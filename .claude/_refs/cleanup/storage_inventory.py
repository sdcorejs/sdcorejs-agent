"""Read-only, metadata-first storage inventory. No content hashing or deletion."""
import argparse, ctypes, heapq, json, math, os, shutil, sys, time
import stat
from collections import Counter
from pathlib import Path

def allocation(path):
    if os.name != 'nt':
        try: st=os.stat(path,follow_symlinks=False)
        except OSError: return None
        return getattr(st,'st_blocks',0)*512 if hasattr(st,'st_blocks') else None
    api=ctypes.WinDLL('kernel32',use_last_error=True)
    fn=api.GetCompressedFileSizeW
    fn.argtypes=[ctypes.c_wchar_p,ctypes.POINTER(ctypes.c_ulong)]
    fn.restype=ctypes.c_ulong
    hi=ctypes.c_ulong(); ctypes.set_last_error(0)
    lo=fn(str(path),ctypes.byref(hi))
    if lo==0xffffffff and ctypes.get_last_error(): return None
    return (hi.value<<32)|lo

def is_redirect(path):
    st=os.lstat(path)
    return os.path.islink(path) or bool(getattr(st,'st_file_attributes',0)&0x400)

def validate_report_target(root, output):
    root=Path(os.path.abspath(root)); output=Path(os.path.abspath(output))
    for parent in (output.parent,*output.parent.parents):
        if is_redirect(parent) or not parent.is_dir(): raise ValueError('UNSAFE_REPORT_PARENT')
    # Resolve existing identities, including Windows 8.3 aliases, after rejecting
    # redirected parents. Lexical abspath alone does not establish containment.
    physical_root=os.path.normcase(root.resolve(strict=True))
    physical_output=os.path.normcase(output.parent.resolve(strict=True)/output.name)
    try: inside=os.path.commonpath([physical_root,physical_output])==physical_root
    except ValueError: inside=False
    if inside: raise ValueError('REPORT_OUTSIDE_ANALYSIS_ROOT_REQUIRED')
    if os.path.lexists(output): raise ValueError('REPORT_ALREADY_EXISTS')
    return output

def write_report(root, output, text):
    output=validate_report_target(root,output)
    with output.open('x',encoding='utf-8') as stream: stream.write(text)

def candidate_kind(path):
    name=path.name.lower()
    if name=='node_modules': return name
    if name=='cache' and path.parent.name.lower() in ('.angular','.next'):
        return path.parent.name.lower()+'/cache'
    if name in ('.npm','.pnpm-store','npm-cache','pnpm-cache','__pycache__','.pytest_cache','.mypy_cache','.ruff_cache','.turbo','.vite','temp','tmp','crashdumps'):
        return name
    return None

# These are observation categories, never a retention or disposal decision.
MANIFESTS = {'package.json', 'pyproject.toml', 'cargo.toml', 'go.mod', 'pom.xml',
             'composer.json', 'gemfile', 'build.gradle', 'package-lock.json'}
PROTECTED_ROLES = {'git-metadata', 'dependencies', 'database', 'recovery', 'evidence'}

def data_role(path, inherited, directory):
    name = path.name.lower()
    parent = path.parent.name.lower()
    suffix = path.suffix.lower()
    if inherited in PROTECTED_ROLES:
        return inherited
    if name == '.git':
        return 'git-metadata'
    if directory and name in ('node_modules', '.venv', 'site-packages', 'vendor'):
        return 'dependencies'
    if directory and name in ('recovery', 'quarantine', 'cleanup-runtime', 'backups', 'restore'):
        return 'recovery'
    if directory and name in ('evidence', 'baselines', 'snapshots', 'diagnostics', 'test-results'):
        return 'evidence'
    if directory and name in ('pgdata', 'postgres-data') or not directory and (
        name == 'pg_version' or suffix in ('.db', '.sqlite', '.sqlite3', '.vhdx', '.mdf')
    ):
        return 'database'
    if directory and name == 'data':
        # Verify the PostgreSQL directory signature without opening its files.
        try:
            if all(not is_redirect(path / child) for child in ('PG_VERSION', 'base', 'global')):
                return 'database'
        except OSError:
            pass
    if inherited == 'handoff-output' or directory and name in ('deliverables', 'delivery', 'handoff', 'exports'):
        return 'handoff-output'
    if not directory and suffix in ('.mp4', '.webm', '.mov'):
        return 'media-output'
    if directory and name in ('sdk', 'sdks', 'installers', 'toolchains') or not directory and suffix in ('.msi', '.msix', '.dmg', '.pkg'):
        return 'sdk-installers'
    if directory and (name in ('cache', 'caches', '.remotion', '.cache', '.turbo') or candidate_kind(path)):
        return 'build-test-cache'
    if directory and (name in ('dist', 'build', 'out') or name == '.next' or parent == '.next' and name == 'server'):
        return 'build-output'
    if not directory and (name in MANIFESTS or inherited not in ('build-test-cache', 'build-output') and
                          suffix in ('.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cs', '.cpp')):
        return 'source-or-manifest'
    if not directory and suffix == '.log' and inherited in (None, 'other'):
        return 'logs'
    return inherited or 'other'

def source_birth(st):
    birth = getattr(st, 'st_birthtime', None)
    # Python 3.11 Windows exposes creation time as st_ctime.
    if birth is None and os.name == 'nt':
        birth = st.st_ctime
    return birth if birth and math.isfinite(birth) else None

def inventory(root, excludes=(), budget=0, output=None, workspace_metadata=False, measure_allocation=False,
              classification_root=None):
    root=Path(os.path.abspath(root))
    if not math.isfinite(budget) or budget<0: raise ValueError('Traversal budget must be finite and nonnegative')
    for p in (root,*root.parents):
        if is_redirect(p): raise ValueError('Root or ancestor is a reparse point: '+str(p))
    if not root.is_dir(): raise ValueError('Root must be a directory')
    ex=set(); normalized_root=os.path.normcase(root)
    for p in excludes:
        absolute=os.path.normcase(os.path.abspath(p))
        try: inside=os.path.commonpath([normalized_root,absolute])==normalized_root
        except ValueError: inside=False
        if not os.path.isabs(p) or not inside or absolute==normalized_root:
            raise ValueError('Exclusions must be absolute descendants of the analysis root')
        if os.path.normcase(os.path.realpath(absolute))!=absolute:
            raise ValueError('EXCLUSION_REQUIRES_CANONICAL_NON_REDIRECTED_PATH')
        ex.add(absolute)
    if output: ex.add(os.path.normcase(os.path.abspath(output)))
    data={'root':str(root),'started_at_epoch':time.time(),'status':'complete','logical_bytes':0,
          'files':0,'directories':0,'errors':[],'error_count':0,'excluded':[],
          'skipped_reparse_count':0,'skipped_reparse_sample':[],'records':[],'candidates':[],'dependency_roots':[],
          'measurement':'Logical sums may count hardlinks more than once. Allocation is measured only for top large files. Candidate names are discovery hints, never deletion authority.'}
    data['volume_before']=shutil.disk_usage(root)._asdict()
    root_stat = os.lstat(root)
    root_device = root_stat.st_dev
    start=last=time.perf_counter(); large=[]; timed_out=False
    def walk(path,depth=0,outer=None,module_owner=None,current_role=None,info=None):
        nonlocal last,timed_out
        data['directories']+=1
        kind=candidate_kind(path) if outer is None else None
        owner=path if kind else outer
        module_root=path.name.lower()=='node_modules' and module_owner is None
        next_module_owner=path if module_root else module_owner
        size=count=errs=links=0; complete=True
        newest = direct_newest = None
        kinds, direct_kinds, markers = Counter(), Counter(), set()
        direct_bytes = direct_files = 0
        boundaries = set()
        allocated = 0
        try:
            if workspace_metadata:
                current = os.lstat(path)
                if (current.st_dev, current.st_ino) != (info.st_dev, info.st_ino) or is_redirect(path):
                    raise OSError('Directory identity changed')
            with os.scandir(path) as entries:
                for e in entries:
                    if budget and time.perf_counter()-start>=budget:
                        timed_out=True; complete=False; data['status']='partial'; break
                    try:
                        if os.path.normcase(os.path.abspath(e.path)) in ex:
                            if not output or os.path.normcase(e.path)!=os.path.normcase(os.path.abspath(output)):
                                data['excluded'].append(e.path); complete=False; data['status']='partial'
                                boundaries.add('excluded-path')
                            continue
                        st=e.stat(follow_symlinks=False)
                        if e.is_symlink() or getattr(st,'st_file_attributes',0)&0x400:
                            links+=1; data['skipped_reparse_count']+=1
                            if len(data['skipped_reparse_sample'])<100: data['skipped_reparse_sample'].append(e.path)
                            complete=False; data['status']='partial'; continue
                        if workspace_metadata and st.st_dev != root_device:
                            boundaries.add('different-filesystem')
                            complete=False; data['status']='partial'; continue
                        if workspace_metadata and e.name.lower() in MANIFESTS | {'.git'}:
                            markers.add(e.name.lower())
                        if e.is_dir(follow_symlinks=False):
                            role = data_role(Path(e.path), current_role, True) if workspace_metadata else None
                            s,c,x,l,sub_complete,sub_newest,sub_kinds,sub_boundaries,sub_allocation=walk(
                                Path(e.path),depth+1,owner,next_module_owner,role,st)
                            size+=s; count+=c; errs+=x; links+=l
                            complete=complete and sub_complete
                            if workspace_metadata:
                                kinds.update(sub_kinds)
                                boundaries.update(sub_boundaries)
                                if sub_newest is not None and (newest is None or sub_newest > newest):
                                    newest = sub_newest
                            if measure_allocation and allocated is not None:
                                allocated = None if sub_allocation is None else allocated + sub_allocation
                        else:
                            if workspace_metadata and not stat.S_ISREG(st.st_mode):
                                boundaries.add('special-file')
                                complete=False; data['status']='partial'; continue
                            if workspace_metadata:
                                role = data_role(Path(e.path), current_role, False)
                                kinds[role] += st.st_size
                                direct_kinds[role] += st.st_size
                                direct_files += 1
                                direct_bytes += st.st_size
                                direct_newest = st.st_mtime if direct_newest is None else max(direct_newest, st.st_mtime)
                                newest = st.st_mtime if newest is None else max(newest, st.st_mtime)
                                if st.st_nlink > 1:
                                    boundaries.add('hardlink-allocation-shared')
                            if measure_allocation and allocated is not None:
                                observed = allocation(e.path) if st.st_nlink == 1 else None
                                allocated = None if observed is None else allocated + observed
                            size+=st.st_size; count+=1; data['files']+=1
                            if st.st_size>=100_000_000:
                                item=(st.st_size,e.path,st.st_mtime)
                                if len(large)<100: heapq.heappush(large,item)
                                elif item>large[0]: heapq.heapreplace(large,item)
                    except OSError as exc:
                        errs+=1; complete=False; data['error_count']+=1; data['status']='partial'
                        if len(data['errors'])<200: data['errors'].append({'path':e.path,'error':str(exc)})
        except OSError as exc:
            errs+=1; complete=False; data['error_count']+=1; data['status']='partial'
            if len(data['errors'])<200: data['errors'].append({'path':str(path),'error':str(exc)})
        rec={'path':str(path),'logical_bytes':size,'files':count,'errors':errs,'skipped_reparse':links,'coverage':'complete' if complete else 'partial'}
        if workspace_metadata:
            if links:
                boundaries.add('redirect-not-followed')
            if errs:
                boundaries.add('unreadable-or-changed')
            if not complete and timed_out:
                boundaries.add('scan-budget')
            rec.update({'depth':depth,'creation_epoch':source_birth(info),'directory_role':current_role,
                        'latest_write_observed_epoch':newest,'markers':sorted(markers),
                        'content_bytes':dict(kinds),'boundaries':sorted(boundaries)})
            if depth == 0:
                data['root_files'] = {'path':str(path),'depth':0,'logical_bytes':direct_bytes,
                    'files':direct_files,'latest_write_observed_epoch':direct_newest,
                    'content_bytes':dict(direct_kinds),'coverage':rec['coverage'],'boundaries':rec['boundaries']}
        if depth<=3 or size>=100_000_000 or workspace_metadata and (markers and not current_role in PROTECTED_ROLES): data['records'].append(rec)
        if kind: data['candidates'].append({**rec,'kind':kind,'decision':'inspect'})
        if module_root: data['dependency_roots'].append({**rec,'kind':'node_modules','decision':'inspect'})
        if time.perf_counter()-last>=25:
            print(json.dumps({'elapsed_seconds':round(time.perf_counter()-start),'files':data['files'],'current':str(path)}),file=sys.stderr,flush=True)
            last=time.perf_counter()
        return size,count,errs,links,complete,newest,kinds,boundaries,allocated if complete else None
    role = None
    if workspace_metadata:
        classification_root = Path(os.path.abspath(classification_root)) if classification_root else root
        relative = root.relative_to(classification_root)
        current = classification_root
        role = data_role(current, None, True)
        for part in relative.parts:
            current = current / part
            role = data_role(current, role, True)
    summary=walk(root,current_role=role,info=root_stat)
    data['logical_bytes']=summary[0]
    if measure_allocation:
        data['observed_allocation_bytes']=summary[-1]
    data['budget_exhausted']=timed_out
    data['duration_seconds']=time.perf_counter()-start
    data['finished_at_epoch']=time.time()
    data['volume_after']=shutil.disk_usage(root)._asdict()
    data['large_files']=[{'path':p,'logical_bytes':s,'allocation_bytes':allocation(p),'mtime_epoch':t} for s,p,t in sorted(large,reverse=True)]
    return data

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',required=True)
    parser.add_argument('--exclude',action='append',default=[],help='Exact directory to omit; marks coverage partial. Repeatable.')
    parser.add_argument('--max-seconds',type=float,default=0,help='0 scans to completion. A budget produces an explicit partial result.')
    parser.add_argument('--out',type=Path)
    parser.add_argument('--workspace-metadata',action='store_true')
    parser.add_argument('--measure-allocation',action='store_true')
    parser.add_argument('--classification-root',type=Path)
    args=parser.parse_args()
    if args.max_seconds<0: parser.error('--max-seconds cannot be negative')
    sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
    try:
        if args.out: validate_report_target(args.root,args.out)
        data=inventory(args.root,args.exclude,args.max_seconds,args.out,args.workspace_metadata,args.measure_allocation,
                       args.classification_root)
        if args.out: write_report(args.root,args.out,json.dumps(data,ensure_ascii=False,indent=2))
    except (OSError,ValueError) as exc: parser.exit(2,str(exc)+'\n')
    if args.out:
        print(json.dumps({k:data[k] for k in ('root','status','logical_bytes','files','error_count','duration_seconds')}))
    else: print(json.dumps(data,ensure_ascii=False))

if __name__=='__main__': main()
