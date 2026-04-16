@echo off
title AutoResearch AI - Launcher
setlocal

:: Determine project root (handle spaces)
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

set "BACKEND_DIR=%PROJECT_ROOT%\backend"

:: Rich Aesthetic Header
color 0B
cls
echo.
echo   #################################################################
echo   #                                                               #
echo   #             AUTORESEARCH AI - STUDIO PROTOCOL v5.0            #
echo   #           Hyper-Precision Multi-Agent Orchestrator            #
echo   #                                                               #
echo   #################################################################
echo.

:: Check for Ollama (optional)
echo [1/3] Checking Ollama Status...
tasklist /FI "IMAGENAME eq ollama*" 2>NUL | find /I "ollama" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama is running.
) else (
    echo [!] Note: Ollama not detected. Ensure it's running for LLM features.
)

:: Start Backend
echo [2/3] Starting Backend Server (FastAPI)...
:: Check if venv exists (common names: venv, .venv)
set "ACTIVATE_PATH="
if exist "%BACKEND_DIR%\venv\Scripts\activate.bat" set "ACTIVATE_PATH=%BACKEND_DIR%\venv\Scripts\activate.bat"
if exist "%BACKEND_DIR%\.venv\Scripts\activate.bat" set "ACTIVATE_PATH=%BACKEND_DIR%\.venv\Scripts\activate.bat"

if defined ACTIVATE_PATH (
    start "AutoResearch - Backend" cmd /k "title Backend && cd /d "%BACKEND_DIR%" && call "%ACTIVATE_PATH%" && uvicorn main:app --reload --port 8000"
) else (
    start "AutoResearch - Backend" cmd /k "title Backend && cd /d "%BACKEND_DIR%" && uvicorn main:app --reload --port 8000"
)

:: Start Frontend
echo [3/3] Starting Frontend Server (Next.js)...
start "AutoResearch - Frontend" cmd /k "title Frontend && cd /d "%PROJECT_ROOT%" && npm run dev"

echo.
echo   =================================================================
echo      ALL SERVICES ARE LAUNCHING!
echo   =================================================================
echo.
echo      - BACKEND:  http://localhost:8000
echo      - FRONTEND: http://localhost:3000
echo.
echo   Keep this window open or press any key to close this launcher.
pause > nul
