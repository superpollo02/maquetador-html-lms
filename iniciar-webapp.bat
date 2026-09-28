@echo off
title Maquetador Editorial LMS - Moodle Ready
echo ====================================================
echo  Iniciando Maquetador Editorial LMS (Moodle Ready)
echo ====================================================
echo.
echo Abriendo servidor local en http://localhost:3000 ...
echo.
start http://localhost:3000
npm run dev
pause
