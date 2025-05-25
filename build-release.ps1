# build-release.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$releaseDir = ".\shavian-transliterate-browser-extension"
$releasesOutputFolder = ".\releases"

try {
    Write-Host "Running Bun build..."
    bun run build:dist
}
catch {
    Write-Host "Bun build failed. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Packaging up at '$releaseDir'"

if (-not (Test-Path $releaseDir -PathType Container)) {
    Write-Host "Creating folder '$releaseDir'"
    New-Item -Path $releaseDir -ItemType Directory | Out-Null
}

Write-Host "Purging '$releaseDir' folder contents"
Remove-Item -Path "$releaseDir\*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Copying contents of './dist' to '$releaseDir'"
Copy-Item -Path ".\dist\*" -Destination $releaseDir -Recurse -Force

Write-Host "Purging '$releasesOutputFolder' folder contents"
Remove-Item -Path "$releasesOutputFolder\*" -Recurse -Force -ErrorAction SilentlyContinue
if (-not (Test-Path $releasesOutputFolder -PathType Container)) {
    New-Item -Path $releasesOutputFolder -ItemType Directory | Out-Null
}

Write-Host "Compressing to *.tar.gz and storing in 'releases'"
# PowerShell's native Tar support (Windows 10 v1803+ / PowerShell 5.1+)
Compress-Archive -Path $releaseDir -DestinationPath (Join-Path $releasesOutputFolder "shavian-transliterate-browser-extension.tar.gz") -CompressionLevel Optimal -Format Tar
# If Compress-Archive with -Format Tar is not available, you might need an external tar.exe.
# Example using an external tar.exe (e.g., from Git Bash):
# Start-Process -FilePath "C:\Program Files\Git\usr\bin\tar.exe" -ArgumentList "-cvzf", (Join-Path $releasesOutputFolder "shavian-transliterate-browser-extension.tar.gz"), $releaseDir -NoNewWindow -Wait -PassThru | Out-Null


Write-Host "Compressing to *.zip and storing in 'releases'"
Compress-Archive -Path $releaseDir -DestinationPath (Join-Path $releasesOutputFolder "shavian-transliterate-browser-extension.zip") -CompressionLevel Optimal

Write-Host "All done"
