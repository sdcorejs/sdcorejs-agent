"""Read-only, metadata-first storage inventory. No content hashing or deletion."""
import argparse, ctypes, heapq, json, math, os, shutil, sys, time
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

def inventory(root, excludes=(), budget=0, output=None):
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
    start=last=time.monotonic(); large=[]; timed_out=False
    def walk(path,depth=0,outer=None,module_owner=None):
        nonlocal last,timed_out
        data['directories']+=1
        kind=candidate_kind(path) if outer is None else None
        owner=path if kind else outer
        module_root=path.name.lower()=='node_modules' and module_owner is None
        next_module_owner=path if module_root else module_owner
        size=count=errs=links=0; complete=True
        try:
            with os.scandir(path) as entries:
                for e in entries:
                    if budget and time.monotonic()-start>=budget:
                        timed_out=True; complete=False; data['status']='partial'; break
                    try:
                        if os.path.normcase(os.path.abspath(e.path)) in ex:
                            if not output or os.path.normcase(e.path)!=os.path.normcase(os.path.abspath(output)):
                                data['excluded'].append(e.path); complete=False; data['status']='partial'
                            continue
                        st=e.stat(follow_symlinks=False)
                        if e.is_symlink() or getattr(st,'st_file_attributes',0)&0x400:
                            links+=1; data['skipped_reparse_count']+=1
                            if len(data['skipped_reparse_sample'])<100: data['skipped_reparse_sample'].append(e.path)
                            complete=False; data['status']='partial'; continue
                        if e.is_dir(follow_symlinks=False):
                            s,c,x,l,sub_complete=walk(Path(e.path),depth+1,owner,next_module_owner)
                            size+=s; count+=c; errs+=x; links+=l
                            complete=complete and sub_complete
                        else:
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
        if depth<=3 or size>=100_000_000: data['records'].append(rec)
        if kind: data['candidates'].append({**rec,'kind':kind,'decision':'inspect'})
        if module_root: data['dependency_roots'].append({**rec,'kind':'node_modules','decision':'inspect'})
        if time.monotonic()-last>=25:
            print(json.dumps({'elapsed_seconds':round(time.monotonic()-start),'files':data['files'],'current':str(path)}),file=sys.stderr,flush=True)
            last=time.monotonic()
        return size,count,errs,links,complete
    data['logical_bytes']=walk(root)[0]
    data['budget_exhausted']=timed_out
    data['duration_seconds']=time.monotonic()-start
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
    args=parser.parse_args()
    if args.max_seconds<0: parser.error('--max-seconds cannot be negative')
    sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
    try:
        if args.out: validate_report_target(args.root,args.out)
        data=inventory(args.root,args.exclude,args.max_seconds,args.out)
        if args.out: write_report(args.root,args.out,json.dumps(data,ensure_ascii=False,indent=2))
    except (OSError,ValueError) as exc: parser.exit(2,str(exc)+'\n')
    if args.out:
        print(json.dumps({k:data[k] for k in ('root','status','logical_bytes','files','error_count','duration_seconds')}))
    else: print(json.dumps(data,ensure_ascii=False))

if __name__=='__main__': main()
