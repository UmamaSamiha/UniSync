@echo off
echo Starting UniSync...

:: Start Apache and MySQL
call "C:\Users\saadi\Downloads\Xamp\apache_start.bat" >nul 2>&1
call "C:\Users\saadi\Downloads\Xamp\mysql_start.bat" >nul 2>&1

:: Wait a moment for servers to start
timeout /t 2 >nul

:: Open app in browser
start http://localhost/UniSync/login.html

echo UniSync is running at http://localhost/UniSync/login.html
