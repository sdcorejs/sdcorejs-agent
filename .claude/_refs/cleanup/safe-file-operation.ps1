param([Parameter(Mandatory = $true)][string]$InputBase64)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# The compiler uses the process TEMP directory. The input is metadata, not bytes.
# All file writes are performed below through verified native handles.
$nativeSource = @'
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using Microsoft.Win32.SafeHandles;

public static class CleanupNativeOperation {
    const uint READ = 0x80000000, WRITE = 0x40000000, DELETE = 0x00010000;
    const uint READ_ATTRIBUTES = 0x80, LIST_DIRECTORY = 1, SYNCHRONIZE = 0x00100000, SHARE_READ = 1, OPEN_EXISTING = 3;
    const uint BACKUP_SEMANTICS = 0x02000000, OPEN_REPARSE_POINT = 0x00200000;
    const uint DIRECTORY = 0x10, REPARSE_POINT = 0x400, READONLY = 1;
    const long EPOCH_TICKS = 116444736000000000L;

    [StructLayout(LayoutKind.Sequential)] struct FileTime { public uint Low, High; }
    [StructLayout(LayoutKind.Sequential)] struct FileInfo {
        public uint Attributes; public FileTime Creation, Access, Write;
        public uint Volume, SizeHigh, SizeLow, Links, IndexHigh, IndexLow;
    }
    [StructLayout(LayoutKind.Sequential)] struct BasicInfo {
        public long Creation, Access, Write, Change; public uint Attributes;
    }
    [StructLayout(LayoutKind.Sequential)] struct StandardInfo {
        public long AllocationSize, EndOfFile; public uint Links;
        public byte DeletePending, Directory;
    }
    [StructLayout(LayoutKind.Sequential)] struct DispositionInfo { public byte DeleteFile; }
    [StructLayout(LayoutKind.Sequential)] struct UnicodeString { public ushort Length, MaximumLength; public IntPtr Buffer; }
    [StructLayout(LayoutKind.Sequential)] struct ObjectAttributes {
        public uint Length; public IntPtr RootDirectory, ObjectName; public uint Attributes;
        public IntPtr SecurityDescriptor, SecurityQualityOfService;
    }
    [StructLayout(LayoutKind.Sequential)] struct IoStatusBlock { public IntPtr Status; public UIntPtr Information; }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    static extern SafeFileHandle CreateFileW(string name, uint access, uint share, IntPtr security, uint creation, uint flags, IntPtr template);
    [DllImport("ntdll.dll")]
    static extern int NtCreateFile(out SafeFileHandle file, uint access, ref ObjectAttributes attributes,
        out IoStatusBlock status, IntPtr allocation, uint fileAttributes, uint share,
        uint disposition, uint options, IntPtr extendedAttributes, uint extendedAttributesLength);
    [DllImport("ntdll.dll")] static extern uint RtlNtStatusToDosError(int status);
    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool GetFileInformationByHandle(SafeFileHandle file, out FileInfo info);
    [DllImport("kernel32.dll", EntryPoint = "GetFileInformationByHandleEx", SetLastError = true)]
    static extern bool GetBasicInfo(SafeFileHandle file, int type, out BasicInfo info, uint size);
    [DllImport("kernel32.dll", EntryPoint = "GetFileInformationByHandleEx", SetLastError = true)]
    static extern bool GetStandardInfo(SafeFileHandle file, int type, out StandardInfo info, uint size);
    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool SetFileInformationByHandle(SafeFileHandle file, int type, ref DispositionInfo info, uint size);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    static extern uint GetFinalPathNameByHandleW(SafeFileHandle file, StringBuilder name, uint length, uint flags);
    [DllImport("kernel32.dll", SetLastError = true)] static extern uint GetFileType(SafeFileHandle file);
    [DllImport("kernel32.dll", SetLastError = true)] static extern bool FlushFileBuffers(SafeFileHandle file);

    public sealed class Failure { public string code; public string path; public int native_error; }
    public sealed class State {
        public double size, mtime, ctime, ino, dev, mode, nlink;
        public double[] Values() { return new double[] { size, mtime, ctime, ino, dev, mode, nlink }; }
    }
    public sealed class Result {
        public bool source_removed, copy_created, copy_verified;
        public string destination, fingerprint;
        public long? allocated_bytes;
        public State source_state, destination_state;
        public List<Failure> errors = new List<Failure>();
    }
    sealed class BoundaryException : Exception {
        public string Code; public int Native;
        public BoundaryException(string code, int native) { Code = code; Native = native; }
    }
    static void Fail(string code) { throw new BoundaryException(code, 0); }
    static void NativeFail(string code) { throw new BoundaryException(code, Marshal.GetLastWin32Error()); }
    static bool SamePath(string first, string second) {
        return String.Equals(first.TrimEnd('\\'), second.TrimEnd('\\'), StringComparison.OrdinalIgnoreCase);
    }
    static string NativePath(string name) { return "\\\\?\\" + name; }
    static string FinalPath(SafeFileHandle file) {
        StringBuilder value = new StringBuilder(32768);
        uint size = GetFinalPathNameByHandleW(file, value, (uint)value.Capacity, 0);
        if (size == 0 || size >= value.Capacity) NativeFail("CANONICAL_PATH_UNAVAILABLE");
        string name = value.ToString();
        if (!name.StartsWith("\\\\?\\", StringComparison.Ordinal)) Fail("UNSAFE_CANONICAL_PATH");
        return name.Substring(4);
    }
    static FileInfo Inspect(SafeFileHandle file, string exactPath, bool directory) {
        FileInfo info;
        if (!GetFileInformationByHandle(file, out info)) NativeFail("FILE_IDENTITY_UNAVAILABLE");
        if ((info.Attributes & REPARSE_POINT) != 0) Fail("REPARSE_POINT_BOUNDARY");
        if (((info.Attributes & DIRECTORY) != 0) != directory || GetFileType(file) != 1) Fail("UNSUPPORTED_FILE_TYPE");
        if (!SamePath(FinalPath(file), exactPath)) Fail("CANONICAL_BOUNDARY_CHANGED");
        return info;
    }
    static SafeFileHandle Open(string exactPath, uint access, uint creation) {
        SafeFileHandle file = CreateFileW(NativePath(exactPath), access, SHARE_READ, IntPtr.Zero, creation,
            OPEN_REPARSE_POINT | BACKUP_SEMANTICS, IntPtr.Zero);
        if (file.IsInvalid) {
            int error = Marshal.GetLastWin32Error(); file.Dispose();
            throw new BoundaryException("HANDLE_OPEN_FAILED", error);
        }
        return file;
    }
    static SafeFileHandle OpenRelative(SafeFileHandle parent, string component, uint access, uint disposition, bool directory) {
        // Each name has one validated component. NT resolution starts at the held
        // parent object, so no absolute ancestor path can redirect this operation.
        ValidatePart(component);
        IntPtr buffer = Marshal.StringToHGlobalUni(component), name = IntPtr.Zero;
        try {
            UnicodeString unicode = new UnicodeString();
            unicode.Length = checked((ushort)(component.Length * 2)); unicode.MaximumLength = unicode.Length;
            unicode.Buffer = buffer; name = Marshal.AllocHGlobal(Marshal.SizeOf(typeof(UnicodeString)));
            Marshal.StructureToPtr(unicode, name, false);
            ObjectAttributes attributes = new ObjectAttributes();
            attributes.Length = (uint)Marshal.SizeOf(typeof(ObjectAttributes));
            attributes.RootDirectory = parent.DangerousGetHandle(); attributes.ObjectName = name; attributes.Attributes = 0x40;
            IoStatusBlock status; SafeFileHandle file;
            int nativeStatus = NtCreateFile(out file, access | SYNCHRONIZE, ref attributes, out status, IntPtr.Zero,
                0x80, SHARE_READ, disposition, 0x00200000 | 0x20 | (directory ? 1U : 0U), IntPtr.Zero, 0);
            if (nativeStatus < 0) {
                if (file != null) file.Dispose();
                int error = (int)RtlNtStatusToDosError(nativeStatus);
                throw new BoundaryException(disposition == 2 && (error == 80 || error == 183)
                    ? "DESTINATION_OCCUPIED" : "HANDLE_OPEN_FAILED", error);
            }
            return file;
        } finally { if (name != IntPtr.Zero) Marshal.FreeHGlobal(name); Marshal.FreeHGlobal(buffer); }
    }
    static string PinRoot(string root, double[] expectedRoot, List<SafeFileHandle> pins) {
        if (String.IsNullOrEmpty(root) || root.Length < 3 || !Char.IsLetter(root[0]) || root[1] != ':' || root[2] != '\\'
            || root.IndexOf('/') >= 0 || root.IndexOf('\0') >= 0 || root.StartsWith("\\\\", StringComparison.Ordinal)) Fail("UNSAFE_ROOT");
        string full = Path.GetFullPath(root);
        if (!SamePath(full, root)) Fail("ROOT_ALIAS");
        foreach (string part in full.Substring(3).Split(new char[] { '\\' }, StringSplitOptions.RemoveEmptyEntries)) ValidatePart(part);
        SafeFileHandle file = Open(full, LIST_DIRECTORY | READ_ATTRIBUTES, OPEN_EXISTING);
        try {
            FileInfo info = Inspect(file, full, true);
            if (expectedRoot == null || expectedRoot.Length != 2
                || (double)(((ulong)info.IndexHigh << 32) | info.IndexLow) != expectedRoot[0]
                || info.Volume != expectedRoot[1]) Fail("ROOT_IDENTITY_CHANGED");
            pins.Add(file); return full;
        } catch { file.Dispose(); throw; }
    }
    static void ValidatePart(string part) {
        if (part.Length == 0 || part == "." || part == ".." || part.EndsWith(".") || part.EndsWith(" ")
            || part.IndexOfAny(new char[] { '\\', '\0', ':', '*', '?', '<', '>', '|', '"' }) >= 0
            || System.Text.RegularExpressions.Regex.IsMatch(part, @"^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase)) Fail("UNSAFE_PATH");
    }
    static string[] RelativeParts(string relative) {
        if (String.IsNullOrEmpty(relative)) { Fail("UNSAFE_PATH"); }
        string[] parts = relative.Split('/');
        foreach (string part in parts) {
            ValidatePart(part);
            if (String.Equals(part, ".git", StringComparison.OrdinalIgnoreCase)
                || String.Equals(part, "node_modules", StringComparison.OrdinalIgnoreCase)
                || String.Equals(part, ".aws", StringComparison.OrdinalIgnoreCase)
                || String.Equals(part, ".codex", StringComparison.OrdinalIgnoreCase)
                || String.Equals(part, ".agents", StringComparison.OrdinalIgnoreCase)) Fail("PROTECTED_BOUNDARY");
        }
        return parts;
    }
    static void RejectNestedRepository(SafeFileHandle directory) {
        try { using (SafeFileHandle git = OpenRelative(directory, ".git", READ_ATTRIBUTES, 1, false)) { Fail("NESTED_REPOSITORY"); } }
        catch (BoundaryException error) { if (error.Native != 2 && error.Native != 3) throw; }
    }
    static void RecheckNestedRepositories(List<SafeFileHandle> pins) {
        // Git markers remain observed facts: the directory handles pin identity,
        // but cannot freeze child entries. The canonical repository root is exempt.
        for (int i = 1; i < pins.Count; i++) RejectNestedRepository(pins[i]);
    }
    static SafeFileHandle PinParents(string root, SafeFileHandle rootHandle, string[] parts, bool create, List<SafeFileHandle> pins) {
        string current = root;
        SafeFileHandle parent = rootHandle;
        for (int i = 0; i < parts.Length - 1; i++) {
            current = Path.Combine(current, parts[i]);
            SafeFileHandle file = OpenRelative(parent, parts[i], LIST_DIRECTORY | READ_ATTRIBUTES, create ? 3U : 1U, true);
            try { Inspect(file, current, true); pins.Add(file); parent = file; RejectNestedRepository(file); }
            catch { if (!pins.Contains(file)) file.Dispose(); throw; }
        }
        return parent;
    }
    static double Milliseconds(long ticks) {
        long unix = ticks - EPOCH_TICKS;
        return (unix / 10000000L) * 1000.0 + (unix % 10000000L) / 10000.0;
    }
    static State Observe(SafeFileHandle file, string exactPath) {
        FileInfo info = Inspect(file, exactPath, false);
        BasicInfo basic;
        if (!GetBasicInfo(file, 0, out basic, (uint)Marshal.SizeOf(typeof(BasicInfo)))) NativeFail("FILE_STATE_UNAVAILABLE");
        if (info.Links != 1) Fail("HARD_LINK_BOUNDARY");
        State state = new State();
        state.size = ((ulong)info.SizeHigh << 32) | info.SizeLow;
        state.ino = ((ulong)info.IndexHigh << 32) | info.IndexLow;
        state.dev = info.Volume; state.nlink = info.Links;
        state.mtime = Milliseconds(basic.Write); state.ctime = Milliseconds(basic.Change);
        state.mode = 0x8000 | ((basic.Attributes & READONLY) != 0 ? 0x124 : 0x1b6);
        return state;
    }
    static void VerifyState(State actual, double[] expected) {
        if (expected == null || expected.Length != 7) Fail("EXPECTED_STATE_REQUIRED");
        double[] values = actual.Values();
        for (int i = 0; i < values.Length; i++) {
            if (Double.IsNaN(expected[i]) || Double.IsInfinity(expected[i]) || values[i] != expected[i]) Fail("SOURCE_STATE_CHANGED");
        }
    }
    static string Hash(FileStream stream) {
        stream.Position = 0;
        using (SHA256 hash = SHA256.Create()) {
            string result = "sha256:" + BitConverter.ToString(hash.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
            stream.Position = 0; return result;
        }
    }
    public static double[] DecodeNumbers(string wire, int count) {
        byte[] bytes = Convert.FromBase64String(wire);
        if (bytes.Length != count * 8) Fail("INVALID_EXPECTED_STATE");
        double[] result = new double[count];
        for (int i = 0; i < count; i++) {
            result[i] = BitConverter.ToDouble(bytes, i * 8);
            if (Double.IsNaN(result[i]) || Double.IsInfinity(result[i])) Fail("INVALID_EXPECTED_STATE");
        }
        return result;
    }
    public static Result Execute(string root, double[] expectedRoot, string source, string destination, string fingerprint, double[] expected, bool removeSource) {
        if (String.IsNullOrEmpty(destination)) destination = null;
        Result result = new Result(); List<SafeFileHandle> pins = new List<SafeFileHandle>();
        SafeFileHandle sourceHandle = null, destinationHandle = null;
        FileStream sourceStream = null, destinationStream = null;
        string destinationPath = null;
        try {
            if (!System.Text.RegularExpressions.Regex.IsMatch(fingerprint ?? "", "^sha256:[a-f0-9]{64}$")) Fail("EXPECTED_FINGERPRINT_REQUIRED");
            string[] sourceParts = RelativeParts(source);
            string[] destinationParts = destination == null ? null : RelativeParts(destination);
            if (!removeSource && destination == null) Fail("INVALID_NATIVE_OPERATION");
            if (destination != null && String.Equals(source, destination, StringComparison.OrdinalIgnoreCase)) Fail("INVALID_DESTINATION");
            root = PinRoot(root, expectedRoot, pins);
            SafeFileHandle rootHandle = pins[0];
            SafeFileHandle sourceParent = PinParents(root, rootHandle, sourceParts, false, pins);
            string sourcePath = Path.Combine(root, source.Replace('/', '\\'));
            sourceHandle = OpenRelative(sourceParent, sourceParts[sourceParts.Length - 1], READ | (removeSource ? DELETE : 0), 1, false);
            result.source_state = Observe(sourceHandle, sourcePath); VerifyState(result.source_state, expected);
            StandardInfo standard;
            if (GetStandardInfo(sourceHandle, 1, out standard, (uint)Marshal.SizeOf(typeof(StandardInfo))) && standard.AllocationSize >= 0)
                result.allocated_bytes = standard.AllocationSize;
            sourceStream = new FileStream(sourceHandle, FileAccess.Read);
            if (Hash(sourceStream) != fingerprint) Fail("SOURCE_FINGERPRINT_CHANGED");
            VerifyState(Observe(sourceHandle, sourcePath), expected);
            if (destination != null) {
                SafeFileHandle destinationParent = PinParents(root, rootHandle, destinationParts, true, pins);
                destinationPath = Path.Combine(root, destination.Replace('/', '\\'));
                destinationHandle = OpenRelative(destinationParent, destinationParts[destinationParts.Length - 1], READ | WRITE | DELETE, 2, false);
                result.copy_created = true; result.destination = destination;
                Inspect(destinationHandle, destinationPath, false);
                destinationStream = new FileStream(destinationHandle, FileAccess.ReadWrite);
                sourceStream.CopyTo(destinationStream); destinationStream.Flush();
                if (!FlushFileBuffers(destinationHandle)) NativeFail("RECOVERY_FLUSH_FAILED");
                result.fingerprint = Hash(destinationStream);
                result.destination_state = Observe(destinationHandle, destinationPath);
                if (result.fingerprint != fingerprint || result.destination_state.size != result.source_state.size) Fail("RECOVERY_COPY_INVALID");
                result.copy_verified = true;
            }
            VerifyState(Observe(sourceHandle, sourcePath), expected);
            if (Hash(sourceStream) != fingerprint) Fail("SOURCE_FINGERPRINT_CHANGED");
            VerifyState(Observe(sourceHandle, sourcePath), expected);
            RecheckNestedRepositories(pins);
            if (removeSource) {
                DispositionInfo disposition = new DispositionInfo(); disposition.DeleteFile = 1;
                if (!SetFileInformationByHandle(sourceHandle, 4, ref disposition, 1)) NativeFail("SOURCE_REMOVE_FAILED");
                sourceStream.Dispose(); sourceStream = null; sourceHandle.Dispose(); sourceHandle = null;
                result.source_removed = true;
            }
        } catch (BoundaryException error) {
            result.errors.Add(new Failure { code = error.Code, path = source, native_error = error.Native });
        } catch {
            result.errors.Add(new Failure { code = "NATIVE_OPERATION_FAILED", path = source, native_error = 0 });
        } finally {
            if (result.copy_created && destinationHandle != null) {
                // Retain every partial copy and observe its actual bytes and size
                // before releasing the handle, including copies that failed early.
                try {
                    if (destinationStream == null) destinationStream = new FileStream(destinationHandle, FileAccess.ReadWrite);
                    destinationStream.Flush(); FlushFileBuffers(destinationHandle);
                } catch { }
                try { result.fingerprint = Hash(destinationStream); } catch { if (!result.copy_verified) result.fingerprint = null; }
                try { result.destination_state = Observe(destinationHandle, destinationPath); } catch { if (!result.copy_verified) result.destination_state = null; }
            }
            if (destinationStream != null) destinationStream.Dispose();
            if (sourceStream != null) sourceStream.Dispose();
            if (destinationHandle != null) destinationHandle.Dispose();
            if (sourceHandle != null) sourceHandle.Dispose();
            for (int i = pins.Count - 1; i >= 0; i--) pins[i].Dispose();
        }
        return result;
    }
    public static Result AcquireWriter(string root, double[] expectedRoot, string identity) {
        const string reserved = ".sdcorejs/tmp/cleanup-runtime/writer.lock";
        Result result = new Result(); List<SafeFileHandle> pins = new List<SafeFileHandle>();
        SafeFileHandle writer = null; FileStream stream = null;
        try {
            if (!System.Text.RegularExpressions.Regex.IsMatch(identity ?? "", "^sha256:v1:[a-f0-9]{64}$")) Fail("INVALID_WRITER_IDENTITY");
            root = PinRoot(root, expectedRoot, pins);
            string[] parts = RelativeParts(reserved);
            SafeFileHandle parent = PinParents(root, pins[0], parts, true, pins);
            writer = OpenRelative(parent, parts[parts.Length - 1], READ | WRITE | DELETE, 2, false);
            result.copy_created = true; result.destination = reserved;
            string exactPath = Path.Combine(root, reserved.Replace('/', '\\'));
            Inspect(writer, exactPath, false);
            stream = new FileStream(writer, FileAccess.ReadWrite);
            byte[] bytes = Encoding.ASCII.GetBytes(identity);
            stream.Write(bytes, 0, bytes.Length); stream.Flush();
            if (!FlushFileBuffers(writer)) NativeFail("WRITER_FLUSH_FAILED");
            result.fingerprint = Hash(stream);
            result.destination_state = Observe(writer, exactPath);
            using (SHA256 hash = SHA256.Create()) {
                string expected = "sha256:" + BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-", "").ToLowerInvariant();
                if (expected != result.fingerprint || result.destination_state.size != bytes.Length) Fail("WRITER_VERIFICATION_FAILED");
            }
            RecheckNestedRepositories(pins);
            result.copy_verified = true;
        } catch (BoundaryException error) {
            result.errors.Add(new Failure { code = error.Code == "DESTINATION_OCCUPIED" ? "CLEANUP_WRITER_ACTIVE" : error.Code,
                path = reserved, native_error = error.Native });
        } catch {
            result.errors.Add(new Failure { code = "NATIVE_OPERATION_FAILED", path = reserved, native_error = 0 });
        } finally {
            if (stream != null) stream.Dispose();
            if (writer != null) writer.Dispose();
            for (int i = pins.Count - 1; i >= 0; i--) pins[i].Dispose();
        }
        return result;
    }
}
'@

try {
    $request = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($InputBase64)) | ConvertFrom-Json
    Add-Type -TypeDefinition $nativeSource -Language CSharp | Out-Null
    $expectedRoot = [CleanupNativeOperation]::DecodeNumbers([string]$request.root_wire, 2)
    if ($request.operation -eq 'writer') {
        $result = [CleanupNativeOperation]::AcquireWriter([string]$request.root, $expectedRoot, [string]$request.identity)
    } else {
        $expected = [CleanupNativeOperation]::DecodeNumbers([string]$request.expected_wire, 7)
        if ($request.remove_source -isnot [bool]) { throw 'INVALID_NATIVE_OPERATION' }
        $destination = if ($null -eq $request.destination) { $null } else { [string]$request.destination }
        $result = [CleanupNativeOperation]::Execute([string]$request.root, $expectedRoot, [string]$request.source, $destination, [string]$request.fingerprint, $expected, $request.remove_source)
    }
    $result | ConvertTo-Json -Compress -Depth 6
} catch {
    # Do not disclose file contents, compiler output, or raw exception strings.
    [pscustomobject]@{ source_removed = $false; copy_created = $false; copy_verified = $false; destination = $null; fingerprint = $null; allocated_bytes = $null; errors = @(@{ code = 'NATIVE_HELPER_FAILED'; path = $null; native_error = 0 }) } | ConvertTo-Json -Compress -Depth 6
}
