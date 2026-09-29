# Start FastAPI Backend in background
Start-Process -NoNewWindow -FilePath "backend\venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --reload --port 8000" -WorkingDirectory "$PWD\backend"

# Start Next.js Frontend in background
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
Set-Location -Path "$PWD\frontend"
npm.cmd run dev
