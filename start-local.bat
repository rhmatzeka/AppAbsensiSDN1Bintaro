@echo off
cd /d "%~dp0"
set NEXTAUTH_URL=http://localhost:3005
set AUTH_URL=http://localhost:3005
node .\node_modules\next\dist\bin\next dev --hostname 127.0.0.1 --port 3005
pause
