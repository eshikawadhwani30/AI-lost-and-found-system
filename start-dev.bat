@echo off
REM Automatically ensure System32 is in PATH so cmd.exe is always found
set "PATH=C:\Windows\System32;%PATH%"

echo ===================================================
echo Starting AI Lost and Found System (Server + Client)
echo ===================================================

npm run dev
