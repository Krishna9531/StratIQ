@echo off
echo ===================================================
echo Starting StratIQ Enterprise Decision Hub...
echo ===================================================

echo [1/2] Starting Python FastAPI Backend on Port 8000...
start cmd /k "cd backend && .\venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Next.js Frontend on Port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up!
echo ---------------------------------------------------
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:8000/docs
echo ---------------------------------------------------
echo Keep those two black terminal windows open while you are using the app.
echo You can safely close this window.
pause
