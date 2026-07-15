@echo off
setlocal

cd /d "%~dp0"

if not exist "storage\tmp" mkdir "storage\tmp"

php -d xdebug.mode=off -d sys_temp_dir=storage/tmp -S 0.0.0.0:8000 -t public server.php
