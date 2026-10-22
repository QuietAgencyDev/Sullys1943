# Updates the gym PC screens and coach art.
# Leaves the gym database, Prisma schema, settings, and installed packages in place.
$ErrorActionPreference = "Stop"

function Find-Payload([string]$Start) {
  $dir = $Start
  for ($i = 0; $i -lt 4; $i++) {
    if (Test-Path (Join-Path $dir "apps\web\package.json")) {
      return (Resolve-Path $dir).Path
    }
    $parent = Split-Path $dir -Parent
    if (-not $parent -or $parent -eq $dir) { break }
    $dir = $parent
  }
  throw "The update files were not found next to UPDATE-SULLYS.bat."
}

function Find-GymApp([string]$Payload) {
  $roots = @(
    "C:\SullysGym",
    "C:\Sullys",
    "D:\SullysGym",
    "E:\SullysGym",
    "D:\Sullys",
    "E:\Sullys"
  )
  $found = @()
  foreach ($root in $roots) {
    $app = $null
    if (Test-Path (Join-Path $root "runtime\node.exe") -and (Test-Path (Join-Path $root "app\apps\web\package.json"))) {
      $app = Join-Path $root "app"
    } elseif (Test-Path (Join-Path $root "apps\web\package.json") -and (Test-Path (Join-Path $root "apps\api\prisma\dev.db"))) {
      $app = $root
    }
    if (-not $app) { continue }
    $app = (Resolve-Path $app).Path
    if ($app.TrimEnd("\") -eq $Payload.TrimEnd("\")) { continue }
    $found += $app
  }
  if ($found.Count -eq 0) { return $null }
  return $found[0]
}

function Copy-UpdateTree([string]$FromRoot, [string]$ToRoot, [string]$RelativePath) {
  $from = Join-Path $FromRoot $RelativePath
  $to = Join-Path $ToRoot $RelativePath
  if (-not (Test-Path $from)) {
    Write-Host "Skipped $RelativePath (not in this update)."
    return
  }
  New-Item $to -ItemType Directory -Force | Out-Null
  & robocopy $from $to /E /NFL /NDL /NP /R:2 /W:1 `
    /XD node_modules .git .turbo cache `
    /XF .env .env.local .env.production .env.development dev.db dev.db-journal .offline-ready
  if ($LASTEXITCODE -ge 8) {
    throw "Could not copy $RelativePath (robocopy $LASTEXITCODE)."
  }
}

function Copy-UpdateFile([string]$FromRoot, [string]$ToRoot, [string]$RelativePath) {
  $from = Join-Path $FromRoot $RelativePath
  $to = Join-Path $ToRoot $RelativePath
  if (-not (Test-Path $from)) { return }
  $parent = Split-Path $to -Parent
  New-Item $parent -ItemType Directory -Force | Out-Null
  Copy-Item $from $to -Force
}

function Get-ProtectedStamp([string]$AppRoot) {
  $paths = @(
    "apps\api\.env",
    "apps\api\prisma\schema.prisma",
    "apps\api\prisma\dev.db",
    "apps\api\prisma\dev.db-journal",
    ".offline-ready",
    "apps\api\.offline-ready"
  )
  $stamps = @{}
  foreach ($relative in $paths) {
    $full = Join-Path $AppRoot $relative
    if (Test-Path $full) {
      $stamps[$relative] = (Get-Item $full).LastWriteTimeUtc.Ticks
    } else {
      $stamps[$relative] = $null
    }
  }
  return $stamps
}

function Assert-ProtectedUnchanged([string]$AppRoot, $Before) {
  $after = Get-ProtectedStamp $AppRoot
  foreach ($key in $Before.Keys) {
    if ($Before[$key] -ne $after[$key]) {
      throw "Stopped. $key changed during the update, which should not happen."
    }
  }
}

$payload = Find-Payload $PSScriptRoot
$appRoot = Find-GymApp $payload

Write-Host ""
Write-Host "Sully's gym update" -ForegroundColor Cyan
Write-Host "Copies the new screens and coach art."
Write-Host "Leaves the gym database, schema, and settings file where they are."
Write-Host ""

if (-not $appRoot) {
  Write-Host "This PC does not have a Sully's gym install in C:\SullysGym." -ForegroundColor Yellow
  Write-Host "Plug the USB into the gym mini PC and double-click UPDATE-SULLYS.bat there."
  Write-Host ""
  Read-Host "Press Enter to close"
  exit 1
}

$installRoot = $appRoot
if ((Split-Path $appRoot -Leaf) -eq "app") {
  $installRoot = Split-Path $appRoot -Parent
}

Write-Host "Update from: $payload"
Write-Host "Update onto: $appRoot"
Write-Host ""
$answer = Read-Host "Continue? (Y/N)"
if ($answer -notmatch "^[Yy]") {
  Write-Host "Cancelled. Nothing was changed."
  Read-Host "Press Enter to close"
  exit 0
}

$before = Get-ProtectedStamp $appRoot

$stateFile = Join-Path $installRoot "gym-processes.json"
if (Test-Path $stateFile) {
  Write-Host "Stopping Sully's so the screens can be replaced..."
  $running = @(Get-Content $stateFile -Raw | ConvertFrom-Json)
  foreach ($entry in $running) {
    if ($entry.pid) {
      Stop-Process -Id $entry.pid -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped $($entry.name)."
    }
  }
  Remove-Item $stateFile -Force
}

$trees = @(
  "apps\web\.next",
  "apps\web\public",
  "apps\web\src",
  "apps\staff\.next",
  "apps\staff\src",
  "apps\api\dist",
  "apps\api\src",
  "packages"
)
foreach ($tree in $trees) {
  Write-Host "Copying $tree"
  Copy-UpdateTree $payload $appRoot $tree
}

$files = @(
  "apps\web\package.json",
  "apps\web\next.config.ts",
  "apps\web\tsconfig.json",
  "apps\staff\package.json",
  "apps\staff\next.config.ts",
  "apps\staff\tsconfig.json",
  "apps\api\package.json",
  "apps\api\tsconfig.json",
  "apps\api\tsconfig.build.json"
)
foreach ($file in $files) {
  Copy-UpdateFile $payload $appRoot $file
}

Assert-ProtectedUnchanged $appRoot $before

Write-Host ""
Write-Host "Screens and coach art are updated." -ForegroundColor Green
Write-Host "Database and settings were left in place."

$start = Join-Path $appRoot "Start-Sullys-Gym.ps1"
if (Test-Path $start) {
  Write-Host "Starting Sully's..."
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $start
} else {
  Write-Host "Start Sully's with the desktop shortcut."
  Write-Host "Floor TV: http://localhost:3000/tv/floor"
}

Write-Host ""
Read-Host "Press Enter to close"
