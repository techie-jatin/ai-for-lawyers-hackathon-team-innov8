# Run FastAPI Backend with Uvicorn
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
& "$scriptDir\venv\Scripts\uvicorn.exe" app.main:app --app-dir "$scriptDir\backend" --host 0.0.0.0 --port 8000 --reload
