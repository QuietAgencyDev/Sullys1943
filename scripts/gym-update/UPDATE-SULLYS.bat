@echo off
cd /d "%~dp0"
echo Updating Sully's screens and coach art.
echo The gym database and settings stay as they are.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0UPDATE-SULLYS.ps1"
if errorlevel 1 pause
