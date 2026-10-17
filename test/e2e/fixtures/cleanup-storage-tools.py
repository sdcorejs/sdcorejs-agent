import json, os, subprocess, sys, tempfile, unittest
from pathlib import Path

TOOLS = Path(__file__).resolve().parents[3] / '_refs' / 'cleanup'

class ToolsTest(unittest.TestCase):
    def run_tool(self, name, *args):
        p = subprocess.run([sys.executable, '-I', '-S', '-B', str(TOOLS/name), *map(str,args)], capture_output=True, text=True)
        self.assertEqual(p.returncode,0,p.stderr)
        if '--out' in args:
            return json.loads(Path(args[args.index('--out')+1]).read_text(encoding='utf-8'))
        return json.loads(p.stdout)

    def test_inventory_size_and_outer_modules(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); nm=root/'app'/'node_modules'; (nm/'a'/'node_modules').mkdir(parents=True)
            (nm/'a'/'x').write_bytes(b'a'*123)
            (nm/'a'/'node_modules'/'y').write_bytes(b'b'*456)
            data=self.run_tool('storage_inventory.py','--root',root)
            self.assertEqual(data['logical_bytes'],579)
            self.assertEqual(len(data['candidates']),1)
            self.assertEqual(data['candidates'][0]['kind'],'node_modules')
            self.assertEqual(data['candidates'][0]['logical_bytes'],579)
            self.assertEqual(data['status'],'complete')

    def test_exclusion_and_explicit_partial_coverage(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); (root/'keep').mkdir(); (root/'keep'/'x').write_bytes(b'x'*900)
            (root/'a').write_bytes(b'123')
            data=self.run_tool('storage_inventory.py','--root',root,'--exclude',root/'keep')
            self.assertEqual(data['logical_bytes'],3)
            self.assertEqual(data['status'],'partial')
            self.assertTrue(data['excluded'])
            self.assertTrue((root/'keep'/'x').exists())

    def test_partial_candidate_cannot_look_like_empty_complete_cache(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)/'npm-cache'; root.mkdir(); (root/'payload').write_bytes(b'x'*100)
            data=self.run_tool('storage_inventory.py','--root',root,'--max-seconds','0.0000001')
            self.assertEqual(data['candidates'][0].get('coverage'),'partial')

    def test_no_tiny_file_cap_and_budget_is_partial(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)
            for i in range(5005): (root/str(i)).write_bytes(b'x')
            data=self.run_tool('storage_inventory.py','--root',root)
            self.assertEqual(data['files'],5005)
            self.assertEqual(data['logical_bytes'],5005)
            self.assertEqual(data['status'],'complete')
            data=self.run_tool('storage_inventory.py','--root',root,'--max-seconds','0.0000001')
            self.assertTrue(data['budget_exhausted'])
            self.assertEqual(data['status'],'partial')

    def test_cache_candidate_is_exact_not_parent_and_hardlink_is_logical(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); (root/'.angular'/'cache').mkdir(parents=True)
            (root/'.angular'/'cache'/'a').write_bytes(b'x'*20)
            (root/'.angular'/'fixture.txt').write_bytes(b'y'*7)
            os.link(root/'.angular'/'cache'/'a',root/'hardlink')
            data=self.run_tool('storage_inventory.py','--root',root)
            self.assertEqual(data['logical_bytes'],47)
            self.assertEqual(data['candidates'][0]['kind'],'.angular/cache')
            self.assertEqual(data['candidates'][0]['logical_bytes'],20)
            self.assertIn('hardlinks',data['measurement'])

    def test_modules_visible_inside_package_cache_without_nested_double_count(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)/'npm-cache'; nested=root/'_npx'/'id'/'node_modules'/'a'/'node_modules'
            nested.mkdir(parents=True); (nested/'x').write_bytes(b'x'*50)
            data=self.run_tool('storage_inventory.py','--root',root)
            self.assertEqual(len(data.get('dependency_roots',[])),1)
            self.assertEqual(data['dependency_roots'][0]['logical_bytes'],50)
            self.assertEqual(len(data['candidates']),1)
            self.assertEqual(data['candidates'][0]['kind'],'npm-cache')

    @unittest.skipUnless(os.name=='nt','Windows junction fixture')
    def test_junction_not_followed(self):
        with tempfile.TemporaryDirectory() as t, tempfile.TemporaryDirectory() as out:
            root=Path(t); outside=Path(out); (outside/'secret').write_bytes(b'x'*1000)
            p=subprocess.run(['powershell','-NoProfile','-Command',
                "New-Item -ItemType Junction -Path '"+str(root/'alias')+"' -Target '"+out+"' | Out-Null"],capture_output=True,text=True)
            self.assertEqual(p.returncode,0,p.stderr)
            data=self.run_tool('storage_inventory.py','--root',root)
            self.assertEqual(data['logical_bytes'],0)
            self.assertEqual(data['skipped_reparse_count'],1)
            self.assertTrue((outside/'secret').exists())

    def module_fixture(self, root):
        package={'dependencies':{'x':'1.0.0'},'engines':{'node':'>=22.12'},'packageManager':'npm@10.9.7'}
        entry={'version':'1.0.0','resolved':'https://registry.npmjs.org/x/-/x-1.0.0.tgz','integrity':'sha512-abc'}
        lock={'lockfileVersion':3,'packages':{'':package,'node_modules/x':entry}}
        (root/'node_modules').mkdir()
        (root/'package.json').write_text(json.dumps(package))
        (root/'package-lock.json').write_text(json.dumps(lock))
        (root/'node_modules'/'.package-lock.json').write_text(json.dumps(lock))
        return package,lock

    def test_module_recovery_evidence_and_no_mutation(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); self.module_fixture(root)
            before={str(p):p.read_bytes() for p in root.rglob('*') if p.is_file()}
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertTrue(data['recovery_metadata_matches'])
            self.assertEqual(data['node_requirement'],'>=22.12')
            self.assertEqual(data['package_manager'],'npm@10.9.7')
            self.assertFalse(data['delete_authorized'])
            self.assertEqual(before,{str(p):p.read_bytes() for p in root.rglob('*') if p.is_file()})

    def test_mismatch_and_private_dependency_hold(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root)
            installed=json.loads((root/'node_modules'/'.package-lock.json').read_text())
            installed['packages']['node_modules/x']['version']='2.0.0'
            (root/'node_modules'/'.package-lock.json').write_text(json.dumps(installed))
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertFalse(data['recovery_metadata_matches'])
            self.assertIn('installed-lock-drift',data['holds'])
            lock['packages']['node_modules/x']['resolved']='https://private.invalid/x.tgz'
            (root/'package-lock.json').write_text(json.dumps(lock))
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertIn('non-public-or-local-dependency',data['holds'])

    def test_manifest_drift_lifecycle_and_unknown_runtime_hold(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root)
            pkg['dependencies']['x']='2.0.0'
            pkg['scripts']={'prepare':'node unique-install.js'}
            pkg.pop('engines')
            (root/'package.json').write_text(json.dumps(pkg))
            data=self.run_tool('inspect_npm.py','--workspace',root)
            for reason in ('manifest-lock-drift','root-install-lifecycle','node-requirement-unknown'):
                self.assertIn(reason,data['holds'])
            self.assertFalse(data['recovery_metadata_matches'])

    def test_foreign_optional_binary_not_false_drift_but_missing_required_holds(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root)
            extra=dict(lock['packages']['node_modules/x'])
            extra.update(optional=True,os=['darwin' if sys.platform!='darwin' else 'win32'])
            lock['packages']['node_modules/foreign-binary']=extra
            (root/'package-lock.json').write_text(json.dumps(lock))
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertTrue(data['recovery_metadata_matches'])
            self.assertEqual(data['omitted_incompatible_optional_packages'],['node_modules/foreign-binary'])
            lock['packages']['node_modules/foreign-binary']['optional']=False
            (root/'package-lock.json').write_text(json.dumps(lock))
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertIn('installed-lock-drift',data['holds'])

    def test_official_registry_host_does_not_prove_scoped_package_public(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root)
            entry=lock['packages'].pop('node_modules/x')
            entry['resolved']='https://registry.npmjs.org/@private/name/-/name-1.0.0.tgz'
            lock['packages']['node_modules/@private/name']=entry
            pkg['dependencies']={'@private/name':'1.0.0'}; lock['packages']['']=pkg
            (root/'package.json').write_text(json.dumps(pkg))
            for p in (root/'package-lock.json',root/'node_modules'/'.package-lock.json'): p.write_text(json.dumps(lock))
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertFalse(data.get('network_recovery_verified',True))
            self.assertEqual(data.get('scoped_package_visibility_unverified'),['@private/name'])
            self.assertFalse(data['delete_authorized'])

    def test_direct_helpers_cannot_overwrite_analyzed_files(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); self.module_fixture(root)
            targets=[('storage_inventory.py','--root',root/'diagnostic.txt'),('inspect_npm.py','--workspace',root/'package-lock.json')]
            (root/'diagnostic.txt').write_bytes(b'unique evidence')
            for script,flag,target in targets:
                before=target.read_bytes()
                p=subprocess.run([sys.executable,'-I','-S','-B',str(TOOLS/script),flag,str(root),'--out',str(target)],capture_output=True,text=True)
                self.assertNotEqual(p.returncode,0,p.stdout)
                self.assertEqual(target.read_bytes(),before)

    def test_new_outside_report_is_exclusive_and_preserves_existing_report(self):
        with tempfile.TemporaryDirectory() as t, tempfile.TemporaryDirectory() as reports:
            root=Path(t); (root/'x').write_bytes(b'abc'); out=Path(reports)/'report.json'
            data=self.run_tool('storage_inventory.py','--root',root,'--out',out)
            self.assertEqual(data['logical_bytes'],3)
            before=out.read_bytes()
            p=subprocess.run([sys.executable,'-I','-S','-B',str(TOOLS/'storage_inventory.py'),'--root',str(root),'--out',str(out)],capture_output=True,text=True)
            self.assertNotEqual(p.returncode,0)
            self.assertEqual(out.read_bytes(),before)

    def test_version_files_are_parsed_without_comments_or_secret_echo(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root); pkg.pop('engines')
            (root/'package.json').write_text(json.dumps(pkg))
            (root/'.nvmrc').write_text('22.22.3 # _authToken=FAKE_TEST_SENTINEL\n')
            data=self.run_tool('inspect_npm.py','--workspace',root)
            self.assertEqual(data['.nvmrc'],'22.22.3')
            self.assertNotIn('FAKE_TEST_SENTINEL',json.dumps(data))
            for invalid in ('','not-a-node-version'):
                (root/'.nvmrc').write_text(invalid)
                data=self.run_tool('inspect_npm.py','--workspace',root)
                self.assertFalse(data['recovery_metadata_matches'])
                self.assertIn('node-requirement-unknown',data['holds'])

    def test_late_allocation_error_is_unknown_not_fatal(self):
        import importlib.util
        from unittest.mock import patch
        spec=importlib.util.spec_from_file_location('storage_test',TOOLS/'storage_inventory.py')
        module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
        with patch.object(module.os,'name','posix'), patch.object(module.os,'stat',side_effect=FileNotFoundError('disappeared')):
            self.assertIsNone(module.allocation('synthetic-file'))

    def test_node_engine_operator_validation_and_spaced_comparators(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root)
            for valid in ('>= 22.12.0','^22.22.3 || >=24.0.0','22.0.0 - 24.0.0'):
                pkg['engines']['node']=valid
                (root/'package.json').write_text(json.dumps(pkg))
                data=self.run_tool('inspect_npm.py','--workspace',root)
                self.assertEqual(data['node_requirement'],valid)
            for invalid in ('^^22.0.0','>>22.0.0','<=^22.0.0','22.00.1','22.0.0-01'):
                pkg['engines']['node']=invalid
                (root/'package.json').write_text(json.dumps(pkg))
                data=self.run_tool('inspect_npm.py','--workspace',root)
                self.assertFalse(data['recovery_metadata_matches'])
                self.assertIn('invalid-node-engine-range',data['holds'])

    def test_non_npm_manager_never_receives_npm_recovery_recipe(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); pkg,lock=self.module_fixture(root)
            for manager in ('pnpm@10.9.7','yarn@4.9.2','bun@1.2.0'):
                pkg['packageManager']=manager
                (root/'package.json').write_text(json.dumps(pkg))
                data=self.run_tool('inspect_npm.py','--workspace',root)
                self.assertFalse(data['recovery_metadata_matches'])
                self.assertIn('package-manager-ownership-needs-review',data['holds'])
                self.assertIsNone(data['reinstall_command_template'])

    def test_direct_scanner_rejects_nonfinite_budget_and_invalid_exclusions(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); (root/'x').write_bytes(b'abc')
            for args in (['--max-seconds','nan'],['--max-seconds','inf'],['--exclude',str(root)],['--exclude',str(root.parent/'not-in-root')]):
                p=subprocess.run([sys.executable,'-I','-S','-B',str(TOOLS/'storage_inventory.py'),'--root',str(root),*args],capture_output=True,text=True)
                self.assertNotEqual(p.returncode,0,p.stdout)

    @unittest.skipUnless(os.name=='nt','Windows short-path exclusion fixture')
    def test_windows_short_alias_exclusion_fails_explicitly(self):
        import ctypes
        with tempfile.TemporaryDirectory() as t:
            root=Path(t); excluded=root/'long-excluded-directory-name'; excluded.mkdir()
            (root/'kept').write_bytes(b'abc'); (excluded/'payload').write_bytes(b'x'*900)
            get_short=ctypes.WinDLL('kernel32',use_last_error=True).GetShortPathNameW
            get_short.argtypes=[ctypes.c_wchar_p,ctypes.c_wchar_p,ctypes.c_ulong]
            get_short.restype=ctypes.c_ulong
            buffer=ctypes.create_unicode_buffer(32768)
            if not get_short(str(excluded),buffer,len(buffer)) or os.path.normcase(buffer.value)==os.path.normcase(str(excluded)):
                self.skipTest('Filesystem does not expose an 8.3 alias for this fixture')
            command=[sys.executable,'-I','-S','-B',str(TOOLS/'storage_inventory.py'),'--root',str(root),'--exclude']
            ordinary=subprocess.run([*command,str(excluded)],capture_output=True,text=True)
            self.assertEqual(ordinary.returncode,0,ordinary.stderr)
            self.assertEqual(json.loads(ordinary.stdout)['logical_bytes'],3)
            alias=subprocess.run([*command,str(root/Path(buffer.value).name)],capture_output=True,text=True)
            self.assertNotEqual(alias.returncode,0,alias.stdout)
            self.assertIn('EXCLUSION_REQUIRES_CANONICAL_NON_REDIRECTED_PATH',alias.stderr)

    @unittest.skipUnless(os.name=='nt','Windows short-path boundary fixture')
    def test_windows_short_alias_cannot_put_report_inside_analysis_root(self):
        import ctypes
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)/'long-analysis-directory-name'; root.mkdir(); self.module_fixture(root)
            get_short=ctypes.WinDLL('kernel32',use_last_error=True).GetShortPathNameW
            get_short.argtypes=[ctypes.c_wchar_p,ctypes.c_wchar_p,ctypes.c_ulong]
            get_short.restype=ctypes.c_ulong
            buffer=ctypes.create_unicode_buffer(32768)
            if not get_short(str(root),buffer,len(buffer)) or os.path.normcase(buffer.value)==os.path.normcase(str(root)):
                self.skipTest('Filesystem does not expose an 8.3 alias for this fixture')
            for script,flag in [('storage_inventory.py','--root'),('inspect_npm.py','--workspace')]:
                target=Path(buffer.value)/(script+'.json')
                p=subprocess.run([sys.executable,'-I','-S','-B',str(TOOLS/script),flag,str(root),'--out',str(target)],capture_output=True,text=True)
                self.assertNotEqual(p.returncode,0,p.stdout)
                self.assertFalse(target.exists())

if __name__=='__main__': unittest.main()
