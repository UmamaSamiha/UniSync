@echo off
echo Starting UniSync...

:: Start MySQL from XAMPP (Apache not needed anymore)
call "C:\Users\saadi\Downloads\Xamp\mysql_start.bat" >nul 2>&1

:: Wait for MySQL to be ready
timeout /t 3 >nul

:: Start Node.js backend in a new window
start "UniSync Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: Install frontend deps if missing, then start React dev server
start "UniSync Frontend" cmd /k "cd /d %~dp0frontend && if not exist node_modules (echo Installing dependencies... && npm install) && npm start"

echo.
echo UniSync is starting up:
echo   Backend  -^> http://localhost:5000
echo   Frontend -^> http://localhost:3000
echo.
echo The browser will open automatically when React is ready.
