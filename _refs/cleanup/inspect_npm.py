"""Inspect npm recovery metadata without installing packages or authorizing deletion."""
import argparse, hashlib, json, os, platform, re, sys
from pathlib import Path
from urllib.parse import urlparse
sys.dont_write_bytecode=True
import importlib.util
_spec=importlib.util.spec_from_file_location('cleanup_storage_inventory',Path(__file__).with_name('storage_inventory.py'))
_inventory=importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_inventory)
is_redirect=_inventory.is_redirect

def node_range(value):
    if not isinstance(value,str) or not value.strip() or len(value)>200: return None
    # Recognize common npm ranges conservatively without evaluating runtime
    # compatibility. Reject malformed operators and numeric identifiers.
    number=r'(?:0|[1-9][0-9]*)'
    prerelease=rf'(?:{number}|[0-9]*[A-Za-z-][0-9A-Za-z-]*)'
    full=rf'{number}\.{number}\.{number}(?:-{prerelease}(?:\.{prerelease})*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?'
    partial=rf'{number}(?:\.{number}){{0,2}}'
    wildcard=rf'(?:[xX*](?:\.[xX*]){{0,2}}|{number}\.[xX*](?:\.[xX*])?|{number}\.{number}\.[xX*])'
    version=rf'v?(?:{full}|{partial}|{wildcard})'
    atom=rf'(?:<=|>=|<|>|=|~|\^)?\s*{version}'
    for clause in value.strip().split('||'):
        clause=clause.strip()
        if not re.fullmatch(rf'(?:{version}\s+-\s+{version}|{atom}(?:\s+{atom})*)',clause): return None
    return value.strip()

def version_file(value):
    lines=[line.split('#',1)[0].strip() for line in value.splitlines()]
    lines=[line for line in lines if line]
    if len(lines)!=1 or not re.fullmatch(r'v?\d+(?:\.\d+){0,2}',lines[0]): return None
    return lines[0]

def incompatible_optional(entry):
    if not entry.get('optional'): return False
    cpu={'amd64':'x64','x86_64':'x64','arm64':'arm64','aarch64':'arm64','i386':'ia32','i686':'ia32','x86':'ia32'}.get(platform.machine().lower())
    for key,value in (('os',sys.platform),('cpu',cpu)):
        rules=entry.get(key,[])
        if not value or not isinstance(rules,list): continue
        positive=[v for v in rules if isinstance(v,str) and not v.startswith('!') and v!='any']
        if '!'+value in rules or (positive and value not in positive): return True
    return False

def inspect(root):
    root=Path(os.path.abspath(root)); holds=[]
    result={'workspace':str(root),'delete_authorized':False,'holds':holds,
            'network_recovery_verified':False,'registry_visibility':'not-tested',
            'scoped_package_visibility_unverified':[],
            'recovery_metadata_matches':False,'node_requirement':None,'package_manager':None,
            'reinstall_command_template':None,
            'config_hashes':{},'limitations':['Metadata comparison does not verify installed file contents, registry availability, absence of writers, Git ownership, or backup restoration.']}
    for p in (root,*root.parents):
        if is_redirect(p): holds.append('reparse-boundary'); return result
    paths=[root/'package.json',root/'package-lock.json',root/'node_modules'/'.package-lock.json']
    docs=[]
    for p in paths:
        try:
            # Never follow a redirected dependency root or metadata file.
            if any(is_redirect(q) for q in (p,p.parent)):
                holds.append('reparse-boundary'); return result
            raw=p.read_bytes(); result['config_hashes'][str(p)]=hashlib.sha256(raw).hexdigest()
            docs.append(json.loads(raw))
        except (OSError,ValueError): holds.append('missing-or-invalid-lock-metadata'); return result
    pkg,source,installed=docs
    if not all(isinstance(d,dict) for d in docs): holds.append('invalid-metadata-shape'); return result
    raw_node=pkg.get('engines',{}).get('node')
    result['node_requirement']=node_range(raw_node)
    if raw_node is not None and result['node_requirement'] is None: holds.append('invalid-node-engine-range')
    manager=pkg.get('packageManager')
    if isinstance(manager,str) and re.fullmatch(r'(?:npm|pnpm|yarn|bun)@\d+(?:\.\d+){2}(?:\+[a-zA-Z0-9.-]+)?',manager): result['package_manager']=manager
    elif manager is not None: holds.append('invalid-package-manager-requirement')
    if result['package_manager'] and not result['package_manager'].startswith('npm@'):
        holds.append('package-manager-ownership-needs-review')
    for p in ('.nvmrc','.node-version','.npmrc','npm-shrinkwrap.json','pnpm-lock.yaml','yarn.lock'):
        f=root/p
        if f.exists():
            if is_redirect(f): holds.append('reparse-boundary'); continue
            result['config_hashes'][str(f)]=hashlib.sha256(f.read_bytes()).hexdigest()
            if p in ('.nvmrc','.node-version'):
                parsed=version_file(f.read_text(encoding='utf-8'))
                if parsed is not None: result[p]=parsed
                else: holds.append('invalid-or-unresolved-node-version-file')
            if p in ('pnpm-lock.yaml','yarn.lock','npm-shrinkwrap.json'): holds.append('package-manager-ownership-needs-review')
            if p=='.npmrc': result['limitations'].append('Project .npmrc exists; review effective non-secret install flags and registry routing without printing credentials.')
    if not result['node_requirement'] and not any(k in result for k in ('.nvmrc','.node-version')):
        holds.append('node-requirement-unknown')
    if pkg.get('workspaces'): holds.append('workspace-topology-needs-review')
    if any(pkg.get('scripts',{}).get(k) for k in ('preinstall','install','postinstall','prepare')):
        holds.append('root-install-lifecycle')
    if source.get('lockfileVersion',0)<2 or installed.get('lockfileVersion',0)<2:
        holds.append('unsupported-lock-format'); return result
    sp=source.get('packages'); ip=installed.get('packages')
    if not isinstance(sp,dict) or not isinstance(ip,dict) or '' not in sp:
        holds.append('invalid-package-map'); return result
    for section in ('dependencies','devDependencies','optionalDependencies','peerDependencies','peerDependenciesMeta'):
        if pkg.get(section,{})!=sp[''].get(section,{}): holds.append('manifest-lock-drift'); break
    for key,entry in sp.items():
        if not key: continue
        if not isinstance(entry,dict): holds.append('invalid-package-map'); break
        u=urlparse(entry.get('resolved',''))
        if entry.get('link') or u.scheme!='https' or u.hostname!='registry.npmjs.org' or u.username or u.password or not entry.get('integrity'):
            holds.append('non-public-or-local-dependency'); break
    source_keys=set(sp)-{''}; installed_keys=set(ip)-{''}
    result['scoped_package_visibility_unverified']=sorted({k.rsplit('node_modules/',1)[-1] for k in source_keys if k.rsplit('node_modules/',1)[-1].startswith('@')})
    result['limitations'].append('registry.npmjs.org also serves private scoped packages. Hostname and integrity alone do not prove public access; verify reacquisition without ambient credentials or preserve a backup before dependency cleanup.')
    omitted=sorted(k for k in source_keys-installed_keys if isinstance(sp[k],dict) and incompatible_optional(sp[k]))
    result['omitted_incompatible_optional_packages']=omitted
    comparable=source_keys&installed_keys
    if installed_keys-source_keys or source_keys-installed_keys-set(omitted) or any(not isinstance(ip.get(k),dict) or any(sp[k].get(field)!=ip[k].get(field) for field in ('version','integrity','resolved','link')) for k in comparable):
        holds.append('installed-lock-drift')
    if pkg.get('overrides'): result['limitations'].append('Manifest overrides exist; validate package-manager-specific reproduction separately.')
    result['holds']=sorted(set(holds))
    result['recovery_metadata_matches']=not result['holds']
    result['package_count']=len(source_keys)
    if 'package-manager-ownership-needs-review' not in holds and 'invalid-package-manager-requirement' not in holds:
        result['reinstall_command_template']='npm ci (use the verified project flags and runtime; do not infer legacy-peer-deps)'
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--workspace',required=True); p.add_argument('--out',type=Path)
    a=p.parse_args(); sys.stdout.reconfigure(encoding='utf-8')
    if a.out:
        try: _inventory.validate_report_target(a.workspace,a.out)
        except (OSError,ValueError) as exc: p.exit(2,str(exc)+'\n')
    try: result=inspect(a.workspace)
    except (OSError,ValueError,TypeError,AttributeError) as e:
        result={'workspace':a.workspace,'delete_authorized':False,'recovery_metadata_matches':False,'holds':['inspection-failed'],'error':str(e)}
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if a.out:
        try: _inventory.write_report(a.workspace,a.out,text)
        except (OSError,ValueError) as exc: p.exit(2,str(exc)+'\n')
    print(text)

if __name__=='__main__': main()
