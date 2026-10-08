"""API-result regression for the real Darwin ACL guard, without filesystem ACL changes.

These controlled API outcomes are deterministic contract evidence, not native
macOS proof. Native cleanup admission and operations run separately on macOS.
"""
import ctypes
import errno
import hashlib
import json
from pathlib import Path
import runpy
import stat
import sys
from types import SimpleNamespace

helper = Path(__file__).resolve().parents[3] / '_refs/cleanup/safe-file-operation.py'
raw = helper.read_bytes()
module = runpy.run_path(str(helper), run_name='acl_contract_fixture')
native_class = module['Native']
guard = native_class.security.__globals__
original = {key: guard[key] for key in ('os', 'sys', 'errno')}
observed = SimpleNamespace(st_mode=stat.S_IFREG | 0o600, st_uid=501, st_nlink=1, st_flags=0)
guard['os'] = SimpleNamespace(fstat=lambda fd: observed, geteuid=lambda: 501)
guard['sys'] = SimpleNamespace(platform='darwin')
constants = {key: value for key, value in vars(errno).items() if key.isupper() and isinstance(value, int)}
constants['ENOATTR'] = 93
guard['errno'] = SimpleNamespace(**constants)
cases = [
    ('absent-ENOENT', errno.ENOENT, None, 0, None, True, None),
    ('absent-ENOATTR', 93, None, 0, None, True, None),
    ('absent-ENODATA', errno.ENODATA, None, 0, None, True, None),
    ('valid-empty', 0, 1, 0, (-1, errno.EINVAL), True, None),
    ('nonempty', 0, 1, 0, (0, 0), False, 'EXTENDED_ACL_UNSUPPORTED'),
    ('invalid-ACL', 0, 1, -1, None, False, 'ACL_INSPECTION_FAILED'),
    ('iterator-I/O', 0, 1, 0, (-1, errno.EIO), False, 'EXTENDED_ACL_UNSUPPORTED'),
    ('null-I/O', errno.EIO, None, 0, None, False, 'ACL_INSPECTION_FAILED'),
    ('null-permission', errno.EACCES, None, 0, None, False, 'ACL_INSPECTION_FAILED'),
    ('null-bad-descriptor', errno.EBADF, None, 0, None, False, 'ACL_INSPECTION_FAILED'),
    ('null-unknown', 0, None, 0, None, False, 'ACL_INSPECTION_FAILED'),
]
results = []
try:
    for label, response_errno, pointer, valid, entry_response, expected, expected_error in cases:
        native = native_class.__new__(native_class)
        freed = []

        def acl_get(fd, acl_type, response_errno=response_errno, pointer=pointer):
            assert fd == 7 and acl_type == 0x100
            ctypes.set_errno(response_errno)
            return pointer

        def acl_entry(acl, first, target, response=entry_response):
            assert response is not None
            result, error = response
            ctypes.set_errno(error)
            return result

        native.acl_get = acl_get
        native.acl_valid = lambda acl, result=valid: result
        native.acl_entry = acl_entry
        native.acl_free = lambda acl: freed.append(acl)
        error = None
        try:
            assert native.security(7, private=True) is observed
            admitted = True
        except module['Refusal'] as refusal:
            admitted = False
            error = str(refusal)
        results.append({'case': label, 'admitted': admitted, 'error': error, 'freed': len(freed)})
        assert admitted == expected and error == expected_error, results[-1]
        assert len(freed) == (1 if pointer else 0), results[-1]
finally:
    guard.update(original)
assert helper.read_bytes() == raw
print(json.dumps({'result': 'PASS', 'cases': results, 'helper_sha256': hashlib.sha256(raw).hexdigest(),
                  'actual_host': sys.platform, 'runtime': sys.version, 'native_os_proof': False,
                  'filesystem_acl_or_permission_mutation': False}))
