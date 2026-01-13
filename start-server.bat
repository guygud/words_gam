@echo off
REM Скрипт для запуска локального HTTP сервера (Windows)

echo Запуск локального HTTP сервера...
echo.

REM Проверяем наличие Python
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Используется Python
    echo Откройте в браузере: http://localhost:8000
    echo Нажмите Ctrl+C для остановки
    python -m http.server 8000
    goto :end
)

REM Проверяем наличие PHP
where php >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Используется PHP
    echo Откройте в браузере: http://localhost:8000
    echo Нажмите Ctrl+C для остановки
    php -S localhost:8000
    goto :end
)

echo Ошибка: не найден Python или PHP
echo Установите один из них или используйте Node.js:
echo   npm install -g http-server
echo   http-server -p 8000

:end
