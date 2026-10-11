# Run Vite Frontend Dev Server
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"
npm run dev -- --host
