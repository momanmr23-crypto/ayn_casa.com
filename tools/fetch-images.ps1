# AYN CASA - downloads placeholder stock photos into assets/ and writes assets/CREDITS.md
#
# Source: Openverse API (https://api.openverse.org) - openly licensed photos only
# (CC0, public domain mark, CC BY, CC BY-SA). No API key required.
#
#   powershell -File tools/fetch-images.ps1                 # fill in anything missing
#   powershell -File tools/fetch-images.ps1 -Force          # re-download everything
#   powershell -File tools/fetch-images.ps1 -Only hero,studio-living
#
# Slots live in tools/image-slots.txt  (name | search query | minimum width | pick index).
# To swap a photo: delete assets/<name>.jpg and run again, or just overwrite the file.
# Real project photos should replace these before the site goes live.

param(
  [switch]$Force,
  [string[]]$Only = @()
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root   = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
New-Item -ItemType Directory -Force -Path $assets | Out-Null

$ua = 'AYNCasaWebsiteBuild/1.0 (static demo site)'
$blocked = '(?i)logo|diagram|blueprint|floor ?plan|scan|poster|painting|engraving|drawing|sketch|chart|cover|stamp|banknote|cartoon|billboard'

$slots = @()
Get-Content (Join-Path $PSScriptRoot 'image-slots.txt') | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $parts = $line -split '\|'
  if ($parts.Count -lt 3) { return }
  $slots += , @{
    f    = $parts[0].Trim()
    q    = $parts[1].Trim()
    min  = [int]$parts[2]
    pick = if ($parts.Count -gt 3 -and $parts[3].Trim()) { [int]$parts[3] } else { 1 }
  }
}

function Get-Candidates([string]$query, [int]$minWidth) {
  $q = [uri]::EscapeDataString($query)
  $uri = "https://api.openverse.org/v1/images/?q=$q&license_type=commercial&page_size=16"
  $json = Invoke-RestMethod -Uri $uri -Headers @{ 'User-Agent' = $ua } -TimeoutSec 60
  @($json.results | Where-Object {
      $_.width -ge $minWidth -and
      $_.url -match '\.(jpe?g|png)$' -and
      $_.license -match '^(cc0|pdm|by|by-sa)$' -and
      $_.title -notmatch $blocked
    })
}

$used    = New-Object System.Collections.Generic.HashSet[string]
$credits = New-Object System.Collections.ArrayList

# keep credits for photos that are not re-downloaded in this run
$creditsPath = Join-Path $assets 'CREDITS.md'
$oldCredits = @{}
if (Test-Path $creditsPath) {
  Get-Content $creditsPath | ForEach-Object {
    if ($_ -match '^- \*\*(.+?\.jpg)\*\* - (.*)$') { $oldCredits[$Matches[1]] = $Matches[2] }
  }
}
$ok = 0; $skip = 0; $fail = 0

foreach ($slot in $slots) {
  $name = $slot.f
  if ($Only.Count -gt 0 -and ($Only -notcontains $name)) { continue }

  $out = Join-Path $assets ($name + '.jpg')
  if ((Test-Path $out) -and -not $Force) {
    if (-not $oldCredits.ContainsKey($name + '.jpg')) {
      $oldCredits[$name + '.jpg'] = "kept from a previous run (delete the file to refetch)."
    }
    $skip++
    continue
  }

  try { $cands = @(Get-Candidates $slot.q $slot.min) } catch { $cands = @() }
  if ($cands.Count -eq 0) {
    Write-Output ("MISS  {0,-24} no result for '{1}'" -f $name, $slot.q)
    $fail++
    continue
  }

  # put the requested pick first, then the rest as fallbacks
  $fresh = @($cands | Where-Object { -not $used.Contains($_.url) })
  if ($fresh.Count -eq 0) { $fresh = $cands }
  $ordered = @($fresh | Select-Object -Skip ($slot.pick - 1)) + @($fresh | Select-Object -First ($slot.pick - 1))

  $saved = $false
  foreach ($c in $ordered) {
    foreach ($src in @($c.url, $c.thumbnail)) {
      if (-not $src) { continue }
      try {
        Invoke-WebRequest -Uri $src -OutFile $out -Headers @{ 'User-Agent' = $ua } -TimeoutSec 120
        if ((Get-Item $out).Length -gt 20000) { $saved = $true; break }
      } catch { }
    }
    if ($saved) {
      [void]$used.Add($c.url)
      Write-Output ("OK    {0,-24} {1,6} KB  {2}x{3}  [{4}]  {5}" -f $name, [int]((Get-Item $out).Length / 1kb), $c.width, $c.height, $c.license, $c.title)
      $oldCredits[$name + '.jpg'] = "`"$($c.title)`" by $($c.creator) ($($c.license.ToUpper()) $($c.license_version)). $($c.foreign_landing_url)"
      $ok++
      break
    }
  }
  if (-not $saved) {
    Write-Output ("FAIL  {0,-24} could not download" -f $name)
    $fail++
  }
  Start-Sleep -Milliseconds 600
}

$header = @(
  '# Image credits',
  '',
  'Placeholder photos downloaded from the Openverse API (openly licensed: CC0, public domain,',
  'CC BY or CC BY-SA). They stand in for the studio''s own photography and should be replaced with',
  'real project photos before launch - overwrite the files in `assets/` keeping the same file names,',
  'or point `images: [...]` in `js/data.js` at your own files.',
  '',
  'If any of these images stay on the site, keep this file as well: CC BY and CC BY-SA require',
  'attribution. CC0 and public-domain images have no such requirement.',
  '',
  '## Files',
  ''
)
$creditLines = @($oldCredits.Keys | Sort-Object | ForEach-Object { "- **$_** - $($oldCredits[$_])" })
($header + $creditLines) | Out-File -Encoding utf8 $creditsPath

Write-Output ""
Write-Output ("downloaded {0}   skipped {1}   failed {2}" -f $ok, $skip, $fail)
Write-Output "credits -> assets/CREDITS.md"