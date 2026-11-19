"""Read-only, metadata-first storage inventory. No content hashing or deletion."""
import argparse, csv, ctypes, heapq, json, math, os, re, shutil, stat, sys, time
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
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

AGE_BUCKETS = ('0-10', '11-20', 'over-20', 'unknown')
MANIFESTS = {'package.json', 'pyproject.toml', 'cargo.toml', 'go.mod', 'sdkmanifest.xml'}
KEEP_SIGNALS = {
    'source and manifests': 'source requires repository or backup verification',
    'Git metadata': 'repository and worktree boundaries require separate review',
    'deliverables': 'deliverables require a verified copy',
    'evidence or recovery': 'evidence and recovery data require retention review',
    'databases': 'database contents and ownership require verification',
    'installed dependencies': 'dependency recovery and consumers require verification',
    'SDKs and installers': 'SDK or installer ownership and reacquisition require verification',
    'sensitive paths': 'sensitive paths require retention review',
}


def calendar(as_of, tz_name):
    if re.fullmatch(r'[+-](?:[01][0-9]|2[0-3]):[0-5][0-9]', tz_name):
        minutes = int(tz_name[1:3]) * 60 + int(tz_name[4:])
        tz = timezone(timedelta(minutes=minutes * (-1 if tz_name[0] == '-' else 1)))
    else:
        try:
            tz = timezone.utc if tz_name == 'UTC' else ZoneInfo(tz_name)
        except ZoneInfoNotFoundError as exc:
            raise ValueError('UNKNOWN_TIMEZONE_USE_IANA_OR_FIXED_OFFSET') from exc
    cutoff = datetime.fromisoformat(as_of) if as_of else datetime.now(tz)
    if cutoff.tzinfo is None:
        raise ValueError('AS_OF_REQUIRES_EXPLICIT_OFFSET')
    return cutoff.astimezone(tz)


def age_fields(name, metadata, cutoff):
    label = re.search(r'(?<![0-9])([0-9]{4}-[0-9]{2}-[0-9]{2})(?![0-9])', name)
    source = 'unknown'
    day = None
    if label:
        try:
            day = date.fromisoformat(label[1])
            source = 'workspace-date-label'
        except ValueError:
            pass
    birth = getattr(metadata, 'st_birthtime', None)
    if birth is None and os.name == 'nt':  # Windows CPython 3.11 exposes creation here.
        birth = getattr(metadata, 'st_ctime', None)
    if day is None and birth is not None:
        day = datetime.fromtimestamp(birth, cutoff.tzinfo).date()
        source = 'filesystem-birthtime'
    days = (cutoff.date() - day).days if day is not None else None
    bucket = 'unknown' if days is None or days < 0 else '0-10' if days <= 10 else '11-20' if days <= 20 else 'over-20'
    return {'age_date': day.isoformat() if day else None, 'age_source': source,
            'age_days': days, 'age_bucket': bucket}


def file_category(name, parts, inherited):
    suffix = Path(name).suffix.lower()
    if name.startswith('.env') or re.search(r'credential|secret|private.key|auth.state', name):
        return 'sensitive paths'
    if name == '.git' or '.git' in parts:
        return 'Git metadata'
    if suffix in ('.sqlite', '.sqlite3', '.db', '.mdf') or name in ('pg_version', 'pg_control'):
        return 'databases'
    if inherited:
        return inherited
    if suffix in ('.msi', '.msix', '.dmg', '.deb', '.rpm') or name == 'sdkmanifest.xml':
        return 'SDKs and installers'
    if name in MANIFESTS or suffix in ('.js', '.ts', '.tsx', '.py', '.rs', '.go', '.java', '.cs', '.cpp'):
        return 'source and manifests'
    if suffix in ('.mp4', '.wav', '.pdf', '.zip', '.7z', '.tar', '.vhdx'):
        return 'media or archives (verify)'
    return 'other data (verify)'


def directory_category(path, inherited):
    name, parent = path.name.lower(), path.parent.name.lower()
    if name == '.git':
        return 'Git metadata'
    if name == 'node_modules':
        return 'installed dependencies'
    if name in ('evidence', 'recovery', 'quarantine', 'backup', 'backups', 'cleanup-runtime'):
        return 'evidence or recovery'
    if name in ('.codex', '.aws', '.agents'):
        return 'sensitive paths'
    if inherited in ('Git metadata', 'evidence or recovery', 'sensitive paths', 'databases'):
        return inherited
    if name in ('deliverables', 'exports', 'handoff', 'delivery'):
        return 'deliverables'
    if inherited:
        return inherited
    if name in ('dist', 'build', 'out', 'target'):
        return 'build outputs (verify)'
    if name in ('sdk', 'sdks', 'installers'):
        return 'SDKs and installers'
    if name == 'data' and any('postgres' in p.lower() for p in path.parts):
        return 'databases'
    if candidate_kind(path) or name == '.remotion' or name == 'cache' and parent == 'remotion':
        return 'build or test cache (verify)'
    return None


def keep_signals(categories, coverage, recent):
    reasons = [reason for kind, reason in KEEP_SIGNALS.items() if kind in categories]
    if coverage != 'complete':
        reasons.append('incomplete scan, exclusion or redirected entry')
    if recent:
        reasons.append('recent file activity')
    return reasons


def describe(categories, name=None):
    types = ', '.join(kind for kind, _ in categories.most_common(4)) or 'no regular files observed'
    return f'{name}: {types}' if name else types


def csv_cell(value):
    if isinstance(value, (dict, list)):
        value = json.dumps(value, ensure_ascii=False)
    if isinstance(value, str) and value.lstrip().startswith(('=', '+', '-', '@')):
        return "'" + value
    return value


def write_csv(root, output, data):
    fields = ['table', 'name', 'path', 'project', 'logical_bytes', 'files', 'single_link_allocated_bytes',
              'age_date', 'age_source', 'age_bucket', 'latest_write_observed', 'latest_write_known',
              'recent_activity', 'coverage', 'contents', 'top_items', 'keep_signals', 'age_as_of_date', 'timezone']
    target = validate_report_target(root, output)
    with target.open('x', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        for table, rows in [('age', data['age_groups']), ('project', data['projects']), ('detail', data['records'])]:
            for row in rows:
                values = {**row, 'table': table, 'age_as_of_date': data['age_as_of_date'], 'timezone': data['timezone']}
                writer.writerow({field: csv_cell(values.get(field)) for field in fields})


def inventory(root, excludes=(), budget=0, output=None, as_of=None, tz_name="UTC"):
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
    cutoff = calendar(as_of, tz_name)
    root_stat = root.lstat()
    data = {'schema_version': 1, 'kind': 'storage-audit', 'mutation_authorized': False,
            'root': str(root), 'started_at_epoch': time.time(), 'status': 'complete',
            'logical_bytes': 0, 'files': 0, 'directories': 0, 'errors': [], 'error_count': 0,
            'excluded': [], 'skipped_reparse_count': 0, 'skipped_reparse_sample': [],
            'records': [], 'projects': [], 'age_groups': [], 'candidates': [], 'dependency_roots': [],
            'age_as_of': cutoff.isoformat(), 'age_as_of_date': cutoff.date().isoformat(),
            'timezone': tz_name, 'recent_activity_days': 10,
            'measurement': 'Logical bytes count names. Single-link allocation excludes hardlinks and '
                           'is an estimate ceiling, independent of mutation eligibility or net free space.'}
    data['volume_before'] = shutil.disk_usage(root)._asdict()
    start = last = time.perf_counter()
    large = []
    timed_out = False

    def summarize(path, count, size, alloc, latest, complete, categories, top, project, age, **extra):
        recent = latest is not None and (cutoff.date() - datetime.fromtimestamp(latest, cutoff.tzinfo).date()).days <= 10
        coverage = 'complete' if complete else 'partial'
        return {'name': path.name or str(path), 'path': str(path), 'project': project,
                'logical_bytes': size, 'files': count, 'single_link_allocated_bytes': alloc if complete else None,
                'latest_write_observed': datetime.fromtimestamp(latest, cutoff.tzinfo).isoformat() if latest is not None else None,
                'latest_write_epoch': latest, 'latest_write_known': complete,
                'recent_activity': recent, 'coverage': coverage, **age, **extra,
                'categories': dict(categories), 'contents': describe(categories, project),
                'top_items': sorted(top, key=lambda item: (-item['logical_bytes'], item['name']))[:3],
                'keep_signals': keep_signals(categories, coverage, recent)}

    def walk(path, metadata, depth=0, outer=None, module_owner=None, inherited=None, project=None):
        nonlocal last, timed_out
        data['directories'] += 1
        kind = candidate_kind(path) if outer is None else None
        owner = path if kind else outer
        module_root = path.name.lower() == 'node_modules' and module_owner is None
        next_module_owner = path if module_root else module_owner
        category = directory_category(path, inherited)
        size = count = errs = links = alloc = 0
        own_size = own_count = own_alloc = 0
        latest = own_latest = None
        complete = True
        markers = []
        types, own_types = Counter(), Counter()
        top, own_top = [], []

        def top_item(items, name, size):
            items.append({'name': name, 'logical_bytes': size})
            items.sort(key=lambda item: (-item['logical_bytes'], item['name']))
            del items[3:]

        def error(entry, exc):
            nonlocal errs, complete
            errs += 1
            complete = False
            data['error_count'] += 1
            if len(data['errors']) < 200:
                data['errors'].append({'path': str(entry), 'code': exc.errno})

        try:
            with os.scandir(path) as entries:
                for entry in entries:
                    if budget and time.perf_counter() - start >= budget:
                        timed_out = True
                        complete = False
                        break
                    try:
                        if os.path.normcase(os.path.abspath(entry.path)) in ex:
                            data['excluded'].append(entry.path)
                            complete = False
                            continue
                        st = entry.stat(follow_symlinks=False)
                        if entry.is_symlink() or getattr(st, 'st_file_attributes', 0) & 0x400 or st.st_dev != root_stat.st_dev:
                            links += 1
                            data['skipped_reparse_count'] += 1
                            if len(data['skipped_reparse_sample']) < 100:
                                data['skipped_reparse_sample'].append(entry.path)
                            complete = False
                            continue
                        name = entry.name.lower()
                        if not category and name in MANIFESTS and stat.S_ISREG(st.st_mode):
                            markers.append(name)
                        if name == '.git':
                            markers.append('Git directory' if stat.S_ISDIR(st.st_mode) else 'Git indirection (worktree or submodule; verify)')
                        if stat.S_ISDIR(st.st_mode):
                            sub = walk(Path(entry.path), st, depth + 1, owner, next_module_owner,
                                       category, entry.name if depth == 0 else project)
                            size += sub['logical_bytes']
                            count += sub['files']
                            errs += sub['errors']
                            links += sub['skipped_reparse']
                            complete = complete and sub['coverage'] == 'complete'
                            alloc = None if alloc is None or sub['single_link_allocated_bytes'] is None else alloc + sub['single_link_allocated_bytes']
                            types.update(sub['categories'])
                            stamp = sub['latest_write_epoch']
                            if stamp is not None:
                                latest = stamp if latest is None else max(latest, stamp)
                            top_item(top, entry.name, sub['logical_bytes'])
                        elif stat.S_ISREG(st.st_mode):
                            size += st.st_size
                            own_size += st.st_size
                            count += 1
                            own_count += 1
                            stamp = st.st_mtime
                            latest = stamp if latest is None else max(latest, stamp)
                            own_latest = stamp if own_latest is None else max(own_latest, stamp)
                            file_type = file_category(name, tuple(part.lower() for part in path.parts), category)
                            types[file_type] += st.st_size
                            own_types[file_type] += st.st_size
                            blocks = getattr(st, 'st_blocks', None)
                            allocated = (allocation(entry.path) if blocks is None else blocks * 512) if st.st_nlink == 1 else 0
                            alloc = None if alloc is None or allocated is None else alloc + allocated
                            own_alloc = None if own_alloc is None or allocated is None else own_alloc + allocated
                            item_name = '(sensitive entry)' if file_type == 'sensitive paths' else entry.name
                            top_item(top, item_name, st.st_size)
                            top_item(own_top, item_name, st.st_size)
                            if st.st_size >= 100_000_000 and file_type != 'sensitive paths':
                                item = (st.st_size, entry.path, stamp)
                                if len(large) < 100:
                                    heapq.heappush(large, item)
                                elif item > large[0]:
                                    heapq.heapreplace(large, item)
                        else:
                            complete = False
                    except OSError as exc:
                        error(entry.path, exc)
        except OSError as exc:
            error(path, exc)
        if markers:
            project = path.name
        rec = summarize(path, count, size, alloc, latest, complete, types, top, project,
                        age_fields(path.name, metadata, cutoff), project_evidence=sorted(markers),
                        errors=errs, skipped_reparse=links)
        if depth <= 3 or size >= 100_000_000 or markers or kind:
            data['records'].append(rec)
        if depth == 1:
            data['projects'].append(rec)
        if depth == 0 and own_count:
            row = summarize(path, own_count, own_size, own_alloc, own_latest, complete, own_types, own_top,
                            project, age_fields('', None, cutoff), direct_files_only=True)
            data['projects'].append({**row, 'name': '(files directly under root)'})
        if kind:
            data['candidates'].append({**rec, 'kind': kind, 'decision': 'inspect'})
        if module_root:
            data['dependency_roots'].append({**rec, 'kind': 'node_modules', 'decision': 'inspect'})
        if time.perf_counter() - last >= 25:
            print(json.dumps({'elapsed_seconds': round(time.perf_counter() - start), 'current': str(path)}),
                  file=sys.stderr, flush=True)
            last = time.perf_counter()
        return rec

    total = walk(root, root_stat, project=root.name)
    data.update(logical_bytes=total['logical_bytes'], files=total['files'],
                status=total['coverage'], budget_exhausted=timed_out)
    if total['project_evidence'] or total['age_source'] == 'workspace-date-label':
        data['projects'] = [total]
    identified = {Path(row['path']): row['name'] for row in data['records'] if row['project_evidence']}
    for rows in (data['records'], data['candidates'], data['dependency_roots']):
        for row in rows:
            absolute = Path(row['path'])
            owner = next((identified[entry] for entry in (absolute, *absolute.parents) if entry in identified), row['project'])
            row['project'] = owner
            row['contents'] = describe(Counter(row['categories']), owner)
    data['projects'].sort(key=lambda item: (-item['logical_bytes'], item['path']))
    for bucket in AGE_BUCKETS:
        rows = [row for row in data['projects'] if row['age_bucket'] == bucket]
        sizes = Counter()
        for row in rows:
            sizes.update(row['categories'])
        latest = max((row['latest_write_epoch'] for row in rows if row['latest_write_epoch'] is not None), default=None)
        allocated = [row['single_link_allocated_bytes'] for row in rows]
        summary = summarize(root, sum(row['files'] for row in rows), sum(row['logical_bytes'] for row in rows),
                            sum(allocated) if all(value is not None for value in allocated) else None,
                            latest, data['status'] == 'complete', sizes,
                            [{'name': row['name'], 'logical_bytes': row['logical_bytes']} for row in rows],
                            None, {'age_bucket': bucket, 'age_date': None, 'age_source': 'project-age-buckets'})
        data['age_groups'].append({**summary, 'name': bucket, 'workspace_count': len(rows)})
    data['duration_seconds'] = time.perf_counter() - start
    data['finished_at_epoch'] = time.time()
    data['volume_after'] = shutil.disk_usage(root)._asdict()
    data['large_files'] = [{'path': p, 'logical_bytes': s, 'allocation_bytes': allocation(p), 'mtime_epoch': t}
                           for s, p, t in sorted(large, reverse=True)]
    return data

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',required=True)
    parser.add_argument('--exclude',action='append',default=[],help='Exact directory to omit; marks coverage partial. Repeatable.')
    parser.add_argument('--max-seconds',type=float,default=0,help='0 scans to completion. A budget produces an explicit partial result.')
    parser.add_argument('--out',type=Path)
    parser.add_argument('--csv',type=Path)
    parser.add_argument('--as-of')
    parser.add_argument('--timezone',default='UTC')
    args=parser.parse_args()
    if args.max_seconds<0: parser.error('--max-seconds cannot be negative')
    sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
    try:
        if args.out: validate_report_target(args.root,args.out)
        if args.csv: validate_report_target(args.root,args.csv)
        if args.out and args.csv and args.out.resolve() == args.csv.resolve():
            raise ValueError("REPORT_TARGETS_MUST_DIFFER")
        data=inventory(args.root,args.exclude,args.max_seconds,args.out,args.as_of,args.timezone)
        if args.csv: write_csv(args.root,args.csv,data)
        if args.out: write_report(args.root,args.out,json.dumps(data,ensure_ascii=False,indent=2))
    except (OSError,ValueError) as exc: parser.exit(2,str(exc)+'\n')
    if args.out:
        print(json.dumps({k:data[k] for k in ('root','status','logical_bytes','files','error_count','duration_seconds')}))
    else: print(json.dumps(data,ensure_ascii=False))

if __name__=='__main__': main()
