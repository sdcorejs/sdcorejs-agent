# Windows PowerShell wrapper for scripts/sync-skills.mjs.
# Usage:
#   powershell -ExecutionPolicy Bypass -File .claude\sync-skills.ps1
#   powershell -ExecutionPolicy Bypass -File .claude\sync-skills.ps1 -check
#   powershell -ExecutionPolicy Bypass -File .claude\sync-skills.ps1 -clean
param(
    [switch]$check,
    [switch]$clean
)

if ($check -and $clean) {
    Write-Error "Use only one mode: -check or -clean."
    exit 2
}

$scriptArgs = @()
if ($check) { $scriptArgs += "--check" }
if ($clean) { $scriptArgs += "--clean" }

$node = Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "node not found. Install Node.js 18+ and re-run."
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$syncScript = Join-Path $repoRoot "scripts\sync-skills.mjs"

& $node $syncScript @scriptArgs
exit $LASTEXITCODE
