# Windows PowerShell wrapper for .claude/sync-skills.sh
# Locates bash.exe (Git for Windows / WSL) and delegates to the bash script.
# Usage: powershell -ExecutionPolicy Bypass -File .claude\sync-skills.ps1 [-check]
param([switch]$check)

$script_args = if ($check) { @("--check") } else { @() }

$bash = $null
foreach ($candidate in @(
    (Get-Command bash -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files\Git\usr\bin\bash.exe"
)) {
    if ($candidate -and (Test-Path $candidate -ErrorAction SilentlyContinue)) {
        $bash = $candidate
        break
    }
}

if (-not $bash) {
    Write-Error "bash not found. Install Git for Windows (https://git-scm.com/downloads) then re-run from a normal shell."
    Write-Host "Alternatively: open Git Bash and run:  bash .claude/sync-skills.sh $($script_args -join ' ')"
    exit 1
}

& $bash ".claude/sync-skills.sh" @script_args
exit $LASTEXITCODE
