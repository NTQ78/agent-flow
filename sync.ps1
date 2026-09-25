#Requires -Version 5.1
<#
.SYNOPSIS
  Sync this repo with the live Claude Code config in ~/.claude.

.DESCRIPTION
  The repo defines what is tracked: every file under commands/ and flow/ here has a counterpart
  under ~/.claude. Nothing else is touched, so unrelated commands in ~/.claude are left alone.

    .\sync.ps1            show which tracked files differ, change nothing
    .\sync.ps1 -Pull      ~/.claude  ->  repo   (you edited the live files)
    .\sync.ps1 -Push      repo       ->  ~/.claude (you edited the repo, or just cloned it)

  To start tracking a new command, copy it into commands/ once; from then on it syncs like the rest.
#>
[CmdletBinding()]
param(
  [switch]$Pull,
  [switch]$Push
)

$ErrorActionPreference = 'Stop'

if ($Pull -and $Push) { throw 'Pick one direction: -Pull or -Push.' }

$repo   = $PSScriptRoot
$claude = Join-Path $HOME '.claude'

# The repo is the manifest: whatever lives here is tracked.
# Not just markdown - lf.js is the tool the whole chain runs on, and while this filter
# said *.md it sat untracked for a month while every command that calls it was versioned.
$trackedExt = '.md', '.js', '.mjs', '.json'
# board.example.json is a redacted template; its live counterpart is board.json, which is
# machine-specific and gitignored. Nothing to compare, so it is not tracked.
$notTracked = 'flow/board.example.json'
$tracked = Get-ChildItem -Path (Join-Path $repo 'commands'), (Join-Path $repo 'flow') -File |
  Where-Object { $trackedExt -contains $_.Extension } |
  ForEach-Object { $_.FullName.Substring($repo.Length).TrimStart([char]92, [char]47).Replace([char]92, [char]47) } |
  Where-Object { $notTracked -notcontains $_ }

if (-not $tracked) { throw "No tracked files found under $repo. Is this the right folder?" }

function Get-Sha ($path) {
  if (Test-Path -LiteralPath $path) { (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash } else { $null }
}

$rows = foreach ($rel in $tracked) {
  $inRepo = Join-Path $repo $rel
  $inLive = Join-Path $claude $rel
  $a = Get-Sha $inRepo
  $b = Get-Sha $inLive
  $state = if ($null -eq $b) { 'missing in ~/.claude' }
           elseif ($a -eq $b) { 'same' }
           else { 'differs' }
  [pscustomobject]@{ File = $rel; State = $state; Repo = $inRepo; Live = $inLive }
}

$changed = @($rows | Where-Object State -ne 'same')

if (-not ($Pull -or $Push)) {
  $rows | Sort-Object State, File | Format-Table File, State -AutoSize
  if (-not $changed) { Write-Host 'In sync.' -ForegroundColor Green }
  else { Write-Host "$($changed.Count) file(s) differ. Run -Pull or -Push." -ForegroundColor Yellow }

  # Point out live commands the repo does not track yet.
  $liveCmd = Join-Path $claude 'commands'
  if (Test-Path -LiteralPath $liveCmd) {
    $trackedNames = $tracked | Where-Object { $_ -like 'commands/*' } | ForEach-Object { Split-Path $_ -Leaf }
    $extra = Get-ChildItem -LiteralPath $liveCmd -Filter *.md -File |
      Where-Object { $trackedNames -notcontains $_.Name } | Select-Object -ExpandProperty Name
    if ($extra) {
      Write-Host ''
      Write-Host 'Untracked commands in ~/.claude/commands (copy into commands/ to track):' -ForegroundColor DarkGray
      $extra | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
    }
  }
  return
}

if (-not $changed) { Write-Host 'Already in sync; nothing to do.' -ForegroundColor Green; return }

$direction = if ($Pull) { '~/.claude -> repo' } else { 'repo -> ~/.claude' }
Write-Host "Sync $direction" -ForegroundColor Cyan

foreach ($row in $changed) {
  if ($Pull) {
    if (-not (Test-Path -LiteralPath $row.Live)) {
      Write-Host "  skip  $($row.File)  (not present in ~/.claude)" -ForegroundColor DarkYellow
      continue
    }
    $src = $row.Live; $dst = $row.Repo
  } else {
    $src = $row.Repo; $dst = $row.Live
  }
  $dstDir = Split-Path $dst -Parent
  if (-not (Test-Path -LiteralPath $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
  Copy-Item -LiteralPath $src -Destination $dst -Force
  Write-Host "  copy  $($row.File)" -ForegroundColor Green
}

Write-Host 'Done.' -ForegroundColor Cyan
