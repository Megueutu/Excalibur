# bootstrap-check.ps1 — checks whether `bash` is on PATH.
#
# This is the ONLY .ps1/.bat wrapper in the whole framework. Every other script here
# is POSIX `.sh` and assumes Git Bash on Windows (see wizard/scripts/check-gh.sh for
# the same "check X, guide the user if missing" shape, applied to `gh` instead of
# `bash`). PowerShell exists only to answer the one question a .sh script can't ask
# about itself before it has an interpreter to run in: is there a shell to run it?
#
# Usage: pwsh -File bootstrap-check.ps1   (or: powershell -File bootstrap-check.ps1)
# Exit codes: 0 = bash found, 1 = bash not found
#
# No prompts — safe to run in a non-interactive context (CI, a hook, a first-run check).

$bash = Get-Command bash -ErrorAction SilentlyContinue

if ($bash) {
    Write-Host "bash found: $($bash.Source)"
    exit 0
}

Write-Host "bash not found on PATH." -ForegroundColor Yellow
Write-Host ""
Write-Host "Excalibur's scripts are POSIX .sh and need bash to run — Git Bash on Windows."
Write-Host "This framework already requires git and gh, so Git Bash is very likely"
Write-Host "installed already; it just isn't on PATH yet."
Write-Host ""
Write-Host "Install Git for Windows (includes Git Bash): https://git-scm.com/download/win"
Write-Host "Already installed? Add its bin folder (typically"
Write-Host "  C:\Program Files\Git\bin) to PATH, or run this from a Git Bash prompt instead."

exit 1
