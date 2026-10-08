"""Bounded POSIX cleanup under an explicit cooperative maintenance fence.

This is not kernel-enforced exclusion of hidden same-user writers. A capture
conflict is retained as a contract breach, never accepted as mutation authority.
The command-line protocol has no test hooks, installation or permission repair.
"""
import ctypes
import errno
import hashlib
import json
import os
import platform
import re
import stat
import sys
import time
from pathlib import Path

MAX_REQUEST = 1024 * 1024
MAX_SAFE = (1 << 53) - 1
RUNTIME = '.sdcorejs/tmp/cleanup-runtime'
FENCE = RUNTIME + '/posix-maintenance.lock'
DECIMAL = re.compile(r'^(0|[1-9][0-9]*)$')
HASH = re.compile(r'^sha256:[a-f0-9]{64}$')


class Refusal(Exception):
    pass


def require(condition, code):
    if not condition:
        raise Refusal(code)


def relative(value):
    require(isinstance(value, str) and value and not re.search(r'[\\\x00:*?<>|]', value), 'UNSAFE_PATH')
    parts = value.split('/')
    require(all(part and part not in ('.', '..') and not part.endswith(('.', ' ')) for part in parts), 'UNSAFE_PATH')
    require(not any(part.lower() in ('.git', 'node_modules', '.aws', '.agents', '.codex') for part in parts), 'PROTECTED_BOUNDARY')
    require(not re.match(r'^\.sdcorejs/(?:tasks/)?sessions(?:/|$)', value, re.I), 'PROTECTED_BOUNDARY')
    return parts


def state_of(observed):
    require(0 <= observed.st_size <= MAX_SAFE, 'UNREPRESENTABLE_FILE_SIZE')
    return {'size': observed.st_size, 'mtime': observed.st_mtime_ns // 1_000_000,
            'ctime': observed.st_ctime_ns // 1_000_000, 'ino': str(observed.st_ino),
            'dev': str(observed.st_dev), 'mode': observed.st_mode, 'nlink': observed.st_nlink,
            'mtime_ns': str(observed.st_mtime_ns), 'ctime_ns': str(observed.st_ctime_ns),
            'uid': observed.st_uid, 'gid': observed.st_gid}


def precise_state(value):
    require(isinstance(value, dict), 'INVALID_POSIX_STATE')
    for key in ('ino', 'dev', 'mtime_ns', 'ctime_ns'):
        require(isinstance(value.get(key), str) and DECIMAL.fullmatch(value[key]), 'INVALID_POSIX_STATE')
    for key in ('size', 'mode', 'nlink', 'uid', 'gid'):
        require(type(value.get(key)) is int and 0 <= value[key] <= MAX_SAFE, 'INVALID_POSIX_STATE')
    require(value['nlink'] == 1, 'HARDLINK_BOUNDARY')


def matches(observed, expected, rename_transition=False):
    actual = state_of(observed)
    keys = ('size', 'ino', 'dev', 'mode', 'nlink', 'mtime_ns', 'uid', 'gid')
    require(all(actual[key] == expected[key] for key in keys), 'SOURCE_STATE_CHANGED')
    if rename_transition:
        require(int(expected['ctime_ns']) <= observed.st_ctime_ns <= time.time_ns(), 'CTIME_TRANSITION_INVALID')
    else:
        require(actual['ctime_ns'] == expected['ctime_ns'], 'SOURCE_STATE_CHANGED')
    return actual


def content(fd):
    before = os.fstat(fd)
    digest = hashlib.sha256()
    offset = 0
    while True:
        chunk = os.pread(fd, 1024 * 1024, offset)
        if not chunk:
            break
        offset += len(chunk)
        digest.update(chunk)
    require(state_of(os.fstat(fd)) == state_of(before), 'CONTENT_CHANGED_DURING_READ')
    return 'sha256:' + digest.hexdigest()


def maintenance(value, expected=None):
    require(isinstance(value, dict) and value.get('source') == 'conversation', 'MAINTENANCE_AUTHORITY_REQUIRED')
    for key in ('root_id', 'task_id', 'generation', 'owner', 'attestation'):
        require(isinstance(value.get(key), str) and value[key].strip(), 'MAINTENANCE_EVIDENCE_REQUIRED')
    require(value.get('fence_path') == FENCE, 'MAINTENANCE_FENCE_CHANGED')
    participants = value.get('participants')
    require(isinstance(participants, list) and participants, 'MAINTENANCE_PARTICIPANTS_REQUIRED')
    seen = set()
    for item in participants:
        require(isinstance(item, dict) and isinstance(item.get('id'), str) and item['id'] and item['id'] not in seen,
                'MAINTENANCE_PARTICIPANTS_REQUIRED')
        seen.add(item['id'])
        require(item.get('state') == 'quiescent' and isinstance(item.get('evidence'), str) and item['evidence'].strip()
                and item.get('writable_descriptors_closed') is True and item.get('children_quiescent') is True,
                'MAINTENANCE_WRITER_NOT_QUIESCENT')
    if expected is not None:
        require(value == expected, 'MAINTENANCE_CHANGED')


class Native:
    def __init__(self):
        require(sys.platform in ('linux', 'darwin'), 'POSIX_PLATFORM_UNSUPPORTED')
        require(sys.version_info >= (3, 11) and sys.implementation.name == 'cpython', 'PYTHON_VERSION_UNSUPPORTED')
        require(sys.flags.isolated and sys.flags.no_site and sys.flags.dont_write_bytecode, 'PYTHON_ISOLATION_REQUIRED')
        require(platform.machine().lower() in ('x86_64', 'amd64', 'aarch64', 'arm64'), 'POSIX_ABI_UNSUPPORTED')
        require(ctypes.sizeof(ctypes.c_void_p) == 8, 'POSIX_ABI_UNSUPPORTED')
        require(all(function in os.supports_dir_fd for function in (os.open, os.stat, os.unlink, os.mkdir)), 'DIRFD_UNAVAILABLE')
        require(os.stat in os.supports_follow_symlinks and hasattr(os, 'pread') and hasattr(os, 'O_NOFOLLOW')
                and hasattr(os, 'O_DIRECTORY'), 'DIRFD_UNAVAILABLE')
        self.lib = ctypes.CDLL(None, use_errno=True)
        self.primitive = 'renameat2' if sys.platform == 'linux' else 'renameatx_np'
        self.rename = getattr(self.lib, self.primitive, None)
        require(self.rename is not None, 'NO_REPLACE_PRIMITIVE_UNAVAILABLE')
        self.rename.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
        self.rename.restype = ctypes.c_int
        self.flag = 1 if sys.platform == 'linux' else 4
        if sys.platform == 'darwin':
            self.acl_get = self.lib.acl_get_fd_np
            self.acl_get.argtypes = [ctypes.c_int, ctypes.c_int]
            self.acl_get.restype = ctypes.c_void_p
            self.acl_valid = self.lib.acl_valid
            self.acl_valid.argtypes = [ctypes.c_void_p]
            self.acl_valid.restype = ctypes.c_int
            self.acl_entry = self.lib.acl_get_entry
            self.acl_entry.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.POINTER(ctypes.c_void_p)]
            self.acl_entry.restype = ctypes.c_int
            self.acl_free = self.lib.acl_free
            self.acl_free.argtypes = [ctypes.c_void_p]
            self.acl_free.restype = ctypes.c_int

    def security(self, fd, directory=False, private=False):
        observed = os.fstat(fd)
        require(stat.S_ISDIR(observed.st_mode) if directory else stat.S_ISREG(observed.st_mode), 'SPECIAL_FILE_BOUNDARY')
        require(observed.st_uid in ((os.geteuid(),) if private else (0, os.geteuid())), 'UNTRUSTED_OWNER')
        require(not observed.st_mode & 0o022, 'UNTRUSTED_WRITE_ACCESS')
        require(not getattr(observed, 'st_flags', 0), 'BSD_FLAGS_UNSUPPORTED')
        if not directory:
            require(observed.st_nlink == 1, 'HARDLINK_BOUNDARY')
        if sys.platform == 'linux':
            require(hasattr(os, 'getxattr'), 'ACL_INSPECTION_UNAVAILABLE')
            for attribute in ('system.posix_acl_access', 'system.posix_acl_default') if directory else ('system.posix_acl_access',):
                try:
                    os.getxattr(fd, attribute)
                except OSError as error:
                    require(error.errno == errno.ENODATA, 'ACL_INSPECTION_FAILED')
                else:
                    raise Refusal('EXTENDED_ACL_UNSUPPORTED')
        else:
            ctypes.set_errno(0)
            acl = self.acl_get(fd, 0x100)
            if not acl:
                # Darwin filesec_get_property reports ENOENT for an absent ACL
                # on an already fstat-validated descriptor. Other errors block.
                require(ctypes.get_errno() in {errno.ENOENT, getattr(errno, 'ENOATTR', -1), getattr(errno, 'ENODATA', -2)}, 'ACL_INSPECTION_FAILED')
            else:
                try:
                    require(self.acl_valid(acl) == 0, 'ACL_INSPECTION_FAILED')
                    entry = ctypes.c_void_p()
                    ctypes.set_errno(0)
                    result = self.acl_entry(acl, 0, ctypes.byref(entry))
                    # Darwin returns 0 for an entry, -1/EINVAL after a valid empty ACL.
                    require(result == -1 and ctypes.get_errno() == errno.EINVAL, 'EXTENDED_ACL_UNSUPPORTED')
                finally:
                    self.acl_free(acl)
        return observed

    def profile(self, fd):
        if sys.platform == 'linux':
            with open('/proc/self/fdinfo/' + str(fd), encoding='ascii') as handle:
                mount_id = next((line.split(':', 1)[1].strip() for line in handle if line.startswith('mnt_id:')), None)
            require(mount_id and mount_id.isdecimal(), 'FILESYSTEM_PROFILE_UNKNOWN')
            with open('/proc/self/mountinfo', encoding='utf-8') as handle:
                entry = next((line.split(' - ', 1) for line in handle if line.split(' ', 1)[0] == mount_id), None)
            require(entry is not None and len(entry) == 2, 'FILESYSTEM_PROFILE_UNKNOWN')
            fields = entry[1].split()
            require(fields[0] == 'ext4' and 'rw' in entry[0].split()[5].split(','), 'FILESYSTEM_UNSUPPORTED')
            filesystem = 'ext4'
            identity = {'mount_id': mount_id}
        else:
            class Statfs64(ctypes.Structure):
                _fields_ = [('bsize', ctypes.c_uint32), ('iosize', ctypes.c_int32),
                            ('blocks', ctypes.c_uint64), ('bfree', ctypes.c_uint64), ('bavail', ctypes.c_uint64),
                            ('files', ctypes.c_uint64), ('ffree', ctypes.c_uint64), ('fsid', ctypes.c_int32 * 2),
                            ('owner', ctypes.c_uint32), ('type', ctypes.c_uint32), ('flags', ctypes.c_uint32), ('subtype', ctypes.c_uint32),
                            ('fstypename', ctypes.c_char * 16), ('mntonname', ctypes.c_char * 1024), ('mntfromname', ctypes.c_char * 1024),
                            ('flags_ext', ctypes.c_uint32), ('reserved', ctypes.c_uint32 * 7)]
            require(ctypes.sizeof(Statfs64) == 2168, 'POSIX_ABI_UNSUPPORTED')
            name = 'fstatfs' if platform.machine().lower() == 'arm64' else 'fstatfs$INODE64'
            function = getattr(self.lib, name, None)
            require(function is not None, 'FILESYSTEM_PROFILE_UNAVAILABLE')
            function.argtypes = [ctypes.c_int, ctypes.POINTER(Statfs64)]
            function.restype = ctypes.c_int
            result = Statfs64()
            require(function(fd, ctypes.byref(result)) == 0, 'FILESYSTEM_PROFILE_FAILED')
            require(bytes(result.fstypename) == b'apfs' and result.flags & 0x1000
                    and not result.flags & (0x1 | 0x200 | 0x00200000), 'FILESYSTEM_UNSUPPORTED')
            filesystem = 'apfs'
            identity = {'fsid': [str(value) for value in result.fsid]}
        return {'platform': sys.platform, 'architecture': 'arm64' if platform.machine().lower() in ('aarch64', 'arm64') else 'x64',
                'filesystem': filesystem, 'primitive': self.primitive, 'os_release': platform.release(), **identity}

    def no_replace(self, source_parent, source, destination_parent, destination):
        require(self.rename(source_parent, os.fsencode(source), destination_parent, os.fsencode(destination), self.flag) == 0,
                'DESTINATION_OCCUPIED' if ctypes.get_errno() == errno.EEXIST else 'NO_REPLACE_FAILED_' + str(ctypes.get_errno()))

    def runtime_security(self):
        # Check the explicitly selected interpreter/helper and their exact ancestors.
        # No PATH search, package scan, permission repair or runtime installation.
        for filename in (os.path.realpath(sys.executable), os.path.realpath(__file__)):
            descriptors = []
            try:
                parent = os.open('/', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
                descriptors.append(parent)
                self.security(parent, directory=True)
                parts = filename.split('/')[1:]
                for part in parts[:-1]:
                    parent = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=parent)
                    descriptors.append(parent)
                    self.security(parent, directory=True)
                leaf = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK, dir_fd=parent)
                descriptors.append(leaf)
                self.security(leaf)
            finally:
                for descriptor in reversed(descriptors):
                    os.close(descriptor)


class Pins:
    def __init__(self, native, root):
        require(isinstance(root, str) and root.startswith('/') and root == os.path.normpath(root) and root != '/', 'UNSAFE_ROOT')
        self.native = native
        self.fds = []
        self.edges = []
        self.root = root
        self.flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
        fd = os.open('/', self.flags)
        self.fds.append(fd)
        native.security(fd, directory=True)
        for name in root.split('/')[1:]:
            parent = fd
            fd = os.open(name, self.flags, dir_fd=parent)
            self.fds.append(fd)
            native.security(fd, directory=True)
            observed = os.fstat(fd)
            self.edges.append((parent, name, fd, observed.st_ino, observed.st_dev, False))
        self.root_fd = fd
        self.root_state = os.fstat(fd)
        self.root_profile = native.profile(fd)

    def close(self):
        for fd in reversed(self.fds):
            os.close(fd)
        self.fds.clear()

    def parent(self, value, create=False):
        parts = relative(value)
        fd = self.root_fd
        for name in parts[:-1]:
            parent = fd
            try:
                fd = os.open(name, self.flags, dir_fd=parent)
            except FileNotFoundError:
                require(create, 'PARENT_MISSING')
                os.mkdir(name, 0o700, dir_fd=parent)
                os.fsync(parent)
                fd = os.open(name, self.flags, dir_fd=parent)
            self.fds.append(fd)
            observed = self.native.security(fd, directory=True)
            require(observed.st_dev == self.root_state.st_dev and self.native.profile(fd) == self.root_profile, 'MOUNT_BOUNDARY')
            try:
                os.stat('.git', dir_fd=fd, follow_symlinks=False)
            except FileNotFoundError:
                pass
            else:
                raise Refusal('NESTED_REPOSITORY')
            self.edges.append((parent, name, fd, observed.st_ino, observed.st_dev, True))
        return fd, parts[-1]

    def validate(self):
        for parent, name, fd, inode, device, inside in self.edges:
            observed = os.stat(name, dir_fd=parent, follow_symlinks=False)
            pinned = self.native.security(fd, directory=True)
            require(stat.S_ISDIR(observed.st_mode) and observed.st_ino == inode == pinned.st_ino
                    and observed.st_dev == device == pinned.st_dev, 'PARENT_BOUNDARY_CHANGED')
            if inside:
                require(self.native.profile(fd) == self.root_profile, 'MOUNT_BOUNDARY')
                try:
                    os.stat('.git', dir_fd=fd, follow_symlinks=False)
                except FileNotFoundError:
                    pass
                else:
                    raise Refusal('NESTED_REPOSITORY')
        require(self.native.profile(self.root_fd) == self.root_profile, 'FILESYSTEM_PROFILE_CHANGED')


def helper_hash():
    return hashlib.sha256(Path(__file__).read_bytes()).hexdigest()


def probe(root):
    native = Native()
    native.runtime_security()
    pins = Pins(native, root)
    try:
        pins.validate()
        return {'supported': True, 'errors': [], 'helper_sha256': helper_hash(),
                'python': {'executable': os.path.realpath(sys.executable), 'version': platform.python_version()},
                'profile': pins.root_profile,
                'root_state': {'ino': str(pins.root_state.st_ino), 'dev': str(pins.root_state.st_dev)},
                'durability': 'fsync file and relevant directories; process-interruption recovery, no hardware power-loss guarantee',
                'primitive_behavior': 'Must be demonstrated by the real native isolated acceptance suite; this probe is read-only.'}
    finally:
        pins.close()


class Session:
    def __init__(self, request):
        import fcntl
        self.fcntl = fcntl
        self.native = Native()
        self.native.runtime_security()
        self.pins = Pins(self.native, request.get('root'))
        self.lock_fd = None
        self.lock_location = None
        self.failed = False
        self.used = set()
        self.operations = request.get('operations')
        require(isinstance(self.operations, list) and 0 < len(self.operations) <= 5000, 'EXACT_OPERATIONS_REQUIRED')
        self.expected = request.get('maintenance')
        maintenance(self.expected)
        require(self.expected['root_id'] == self.pins.root, 'MAINTENANCE_ROOT_CHANGED')
        boundary = request.get('posix_boundary')
        require(isinstance(boundary, dict) and boundary.get('version') == 'posix-maintenance-v1'
                and boundary.get('root_id') == self.pins.root and boundary.get('maintenance') == self.expected,
                'POSIX_BOUNDARY_REQUIRED')
        require(boundary.get('helper_sha256') == helper_hash() and boundary.get('profile') == self.pins.root_profile,
                'POSIX_BOUNDARY_CHANGED')
        require(boundary.get('python', {}).get('version') == platform.python_version()
                and boundary['python'].get('executable') == os.path.realpath(sys.executable), 'PYTHON_BOUNDARY_CHANGED')
        expected_root = request.get('root_state', {})
        require(expected_root.get('ino') == str(self.pins.root_state.st_ino)
                and expected_root.get('dev') == str(self.pins.root_state.st_dev), 'ROOT_STATE_CHANGED')
        for action in self.operations:
            require(action.get('remove_source') is True, 'POSIX_COPY_ONLY_UNSUPPORTED')
            relative(action.get('source'))
            require(HASH.fullmatch(action.get('fingerprint', '')), 'INVALID_FINGERPRINT')
            precise_state(action.get('state'))
            transaction = action.get('transaction')
            require(isinstance(transaction, dict) and transaction.get('capture') and transaction.get('journal'), 'TRANSACTION_AUTHORITY_REQUIRED')
            capture = '/'.join(relative(transaction['capture']))
            journal = '/'.join(relative(transaction['journal']))
            require(capture.startswith(RUNTIME + '/transactions/') and capture.endswith('/captured')
                    and journal == capture.rsplit('/', 1)[0] + '/journal.ndjson', 'TRANSACTION_SCOPE_CHANGED')
            if action.get('destination') is not None:
                relative(action['destination'])
                require(action['destination'] != action['source'], 'INVALID_DESTINATION')
        parent, name = self.pins.parent(FENCE, create=True)
        self.lock_location = (parent, name)
        self.lock_fd = os.open(name, os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=parent)
        self.native.security(self.lock_fd, private=True)
        try:
            fcntl.flock(self.lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise Refusal('WRITER_ALREADY_ACTIVE')
        self.lock_state = os.fstat(self.lock_fd)
        self.pins.validate()
        os.fsync(self.lock_fd)
        os.fsync(parent)

    def close(self):
        if self.lock_fd is not None:
            self.fcntl.flock(self.lock_fd, self.fcntl.LOCK_UN)
            os.close(self.lock_fd)
            self.lock_fd = None
        self.pins.close()

    def admission(self, observed):
        maintenance(observed, self.expected)
        self.pins.validate()
        parent, name = self.lock_location
        actual = os.stat(name, dir_fd=parent, follow_symlinks=False)
        require(actual.st_ino == self.lock_state.st_ino and actual.st_dev == self.lock_state.st_dev
                and actual.st_nlink == 1, 'MAINTENANCE_FENCE_CHANGED')
        self.native.security(self.lock_fd, private=True)

    def operation(self, request, barrier=None):
        # Only isolated tests importing this class can provide a callable barrier.
        # The production JSON entrypoint never accepts or dispatches one.
        require(not self.failed, 'NATIVE_SESSION_STOPPED')
        action = request.get('action')
        require(action in self.operations and action.get('source') not in self.used, 'OPERATION_SCOPE_CHANGED')
        self.used.add(action['source'])
        first_fd = len(self.pins.fds)
        first_edge = len(self.pins.edges)
        result = {'source_removed': False, 'copy_created': False, 'copy_verified': False, 'destination': None,
                  'fingerprint': None, 'destination_state': None, 'allocated_bytes': None, 'errors': [],
                  'transaction': {'phase': 'NOT_STARTED', 'journal': action['transaction']['journal'],
                                  'capture_path': action['transaction']['capture'], 'source_captured': False,
                                  'active_path_state': 'unknown', 'captured_identity': None, 'capture_retained': False,
                                  'contract_breach': False, 'recovery_verified_before_capture': False}, 'partial': False}
        transaction = result['transaction']
        descriptors = []
        journal_fd = None
        journal_parent = None
        destination_fd = None

        def phase(value, extra=None):
            transaction['phase'] = value
            if extra:
                transaction.update(extra)
            data = (json.dumps({'phase': value, 'source': action['source'], 'destination': action.get('destination'),
                                'approved_fingerprint': action['fingerprint'], 'approved_state': action['state'],
                                'maintenance_generation': self.expected['generation'], 'transaction': transaction,
                                'result': {key: result[key] for key in ('source_removed', 'copy_created', 'copy_verified')}},
                               sort_keys=True, separators=(',', ':')) + '\n').encode()
            offset = 0
            while offset < len(data):
                offset += os.write(journal_fd, data[offset:])
            os.fsync(journal_fd)
            os.fsync(journal_parent)
            if barrier:
                barrier(value, self, action)

        def validate_recovery():
            if destination_fd is None:
                return
            try:
                matches(self.native.security(destination_fd, private=True), result['destination_state'])
                matches(os.stat(destination_name, dir_fd=destination_parent, follow_symlinks=False), result['destination_state'])
                require(content(destination_fd) == action['fingerprint'], 'RECOVERY_STATE_CHANGED')
            except (Refusal, OSError):
                result['copy_verified'] = False
                transaction['recovery_current_verified'] = False
                raise Refusal('RECOVERY_STATE_CHANGED')
            transaction['recovery_current_verified'] = True

        try:
            self.admission(request.get('maintenance'))
            source_parent, source_name = self.pins.parent(action['source'])
            source_fd = os.open(source_name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK, dir_fd=source_parent)
            descriptors.append(source_fd)
            original = self.native.security(source_fd)
            matches(original, action['state'])
            require(content(source_fd) == action['fingerprint'], 'SOURCE_FINGERPRINT_CHANGED')
            transaction['active_path_state'] = 'present'
            capture_parent, capture_name = self.pins.parent(action['transaction']['capture'], create=True)
            journal_parent, journal_name = self.pins.parent(action['transaction']['journal'])
            # Refuse an interrupted transaction; never resume or purge its entries.
            journal_fd = os.open(journal_name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC,
                                 0o600, dir_fd=journal_parent)
            descriptors.append(journal_fd)
            self.native.security(journal_fd, private=True)
            phase('PREPARED')
            destination = action.get('destination')
            if destination is not None:
                destination_parent, destination_name = self.pins.parent(destination, create=True)
                self.admission(request.get('maintenance'))
                destination_fd = os.open(destination_name, os.O_RDWR | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC,
                                         0o600, dir_fd=destination_parent)
                descriptors.append(destination_fd)
                result.update(copy_created=True, destination=destination, partial=True)
                self.native.security(destination_fd, private=True)
                matches(os.fstat(source_fd), action['state'])
                offset = 0
                while True:
                    chunk = os.pread(source_fd, 1024 * 1024, offset)
                    if not chunk:
                        break
                    written = 0
                    while written < len(chunk):
                        written += os.write(destination_fd, chunk[written:])
                    offset += len(chunk)
                os.fsync(destination_fd)
                matches(os.fstat(source_fd), action['state'])
                require(content(source_fd) == action['fingerprint'] and content(destination_fd) == action['fingerprint'], 'RECOVERY_VERIFICATION_FAILED')
                observed_copy = self.native.security(destination_fd, private=True)
                named_copy = os.stat(destination_name, dir_fd=destination_parent, follow_symlinks=False)
                require(named_copy.st_ino == observed_copy.st_ino and named_copy.st_dev == observed_copy.st_dev, 'DESTINATION_BOUNDARY_CHANGED')
                os.fsync(destination_parent)
                result.update(copy_verified=True, fingerprint=action['fingerprint'], destination_state=state_of(observed_copy))
                phase('RECOVERY_VERIFIED', {'recovery_verified_before_capture': True})
            if barrier:
                barrier('BEFORE_CAPTURE', self, action)
            self.admission(request.get('maintenance'))
            validate_recovery()
            named = os.stat(source_name, dir_fd=source_parent, follow_symlinks=False)
            matches(named, action['state'])
            matches(self.native.security(source_fd), action['state'])
            require(content(source_fd) == action['fingerprint'], 'SOURCE_FINGERPRINT_CHANGED')
            if barrier:
                barrier('BEFORE_RENAME', self, action)
            self.native.no_replace(source_parent, source_name, capture_parent, capture_name)
            transaction.update(source_captured=True, active_path_state='absent', capture_retained=True)
            result['partial'] = True
            os.fsync(source_parent)
            os.fsync(capture_parent)
            phase('CAPTURED')
            try:
                captured_fd = os.open(capture_name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK, dir_fd=capture_parent)
                descriptors.append(captured_fd)
                captured = self.native.security(captured_fd)
                transaction['captured_identity'] = state_of(captured)
                matches(captured, action['state'], rename_transition=True)
                require(content(captured_fd) == action['fingerprint'], 'CAPTURE_FINGERPRINT_CHANGED')
                matches(os.fstat(source_fd), state_of(captured))
            except (Refusal, OSError):
                transaction['contract_breach'] = True
                raise Refusal('CAPTURE_CONTRACT_BREACH')
            phase('VALIDATED', {'ctime_transition': {'before': action['state']['ctime_ns'], 'after': str(captured.st_ctime_ns), 'cause': 'authorized-exclusive-rename'}})
            self.admission(request.get('maintenance'))
            validate_recovery()
            named_capture = os.stat(capture_name, dir_fd=capture_parent, follow_symlinks=False)
            matches(named_capture, state_of(captured))
            require(content(captured_fd) == action['fingerprint'], 'CAPTURE_FINGERPRINT_CHANGED')
            try:
                os.stat(source_name, dir_fd=source_parent, follow_symlinks=False)
            except FileNotFoundError:
                pass
            else:
                transaction['active_path_state'] = 'occupied'
                transaction['contract_breach'] = True
                raise Refusal('CAPTURE_CONTRACT_BREACH')
            allocation = captured.st_blocks * 512
            require(0 <= allocation <= MAX_SAFE, 'ALLOCATION_MEASUREMENT_UNAVAILABLE')
            os.unlink(capture_name, dir_fd=capture_parent)
            transaction['capture_retained'] = False
            result.update(source_removed=True, allocated_bytes=allocation)
            os.fsync(capture_parent)
            phase('COMMITTED')
            phase('VERIFIED')
            result['partial'] = False
        except (Refusal, OSError, ValueError, TypeError) as error:
            self.failed = True
            code = str(error) if isinstance(error, Refusal) else 'POSIX_OPERATION_FAILED_' + str(getattr(error, 'errno', 'INVALID'))
            result['errors'].append({'code': code, 'path': action['source']})
            if transaction['source_captured'] and not result['source_removed']:
                transaction['contract_breach'] = transaction['contract_breach'] or code.startswith(('SOURCE_', 'CAPTURE_', 'PARENT_', 'MAINTENANCE_'))
            if journal_fd is not None:
                try:
                    phase('PARTIAL' if result['partial'] else 'BLOCKED')
                except (OSError, Refusal):
                    result['errors'].append({'code': 'JOURNAL_OUTCOME_UNKNOWN', 'path': transaction['journal']})
        finally:
            for fd in reversed(descriptors):
                os.close(fd)
            for fd in reversed(self.pins.fds[first_fd:]):
                os.close(fd)
            del self.pins.fds[first_fd:]
            del self.pins.edges[first_edge:]
        return result


def read_request():
    line = sys.stdin.buffer.readline(MAX_REQUEST + 1)
    if not line:
        return None
    require(len(line) <= MAX_REQUEST and line.endswith(b'\n'), 'REQUEST_LIMIT_EXCEEDED')
    value = json.loads(line)
    require(isinstance(value, dict), 'INVALID_REQUEST')
    return value


def emit(value):
    sys.stdout.write(json.dumps(value, separators=(',', ':'), sort_keys=True) + '\n')
    sys.stdout.flush()


def main():
    session = None
    try:
        first = read_request()
        require(first is not None, 'REQUEST_REQUIRED')
        require(sys.platform in ('linux', 'darwin'), 'POSIX_PLATFORM_UNSUPPORTED')
        if first.get('operation') == 'probe':
            emit(probe(first.get('root')))
            return
        require(first.get('operation') == 'writer', 'INVALID_OPERATION')
        session = Session(first)
        emit({'lock_created': True, 'lock_verified': True, 'path': FENCE, 'state': state_of(session.lock_state), 'errors': []})
        while True:
            request = read_request()
            if request is None:
                break
            if request.get('operation') == 'release':
                session.admission(request.get('maintenance'))
                session.close()
                session = None
                emit({'released': True, 'lock_inode_retained': True, 'errors': []})
                return
            require(request.get('operation') == 'mutate', 'INVALID_OPERATION')
            emit(session.operation(request))
    except (Refusal, OSError, ValueError, TypeError, AttributeError) as error:
        code = str(error) if isinstance(error, Refusal) else 'POSIX_HELPER_FAILED_' + str(getattr(error, 'errno', 'INVALID'))
        emit({'supported': False, 'errors': [{'code': code, 'path': None}]})
        sys.exit(1)
    finally:
        if session is not None:
            session.close()


if __name__ == '__main__':
    main()
