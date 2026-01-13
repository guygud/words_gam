#!/bin/bash

# Скрипт для запуска локального HTTP сервера

echo "Запуск локального HTTP сервера..."
echo ""

# Проверяем наличие Python 3
if command -v python3 &> /dev/null; then
    echo "Используется Python 3"
    echo "Откройте в браузере: http://localhost:8000"
    echo "Нажмите Ctrl+C для остановки"
    python3 -m http.server 8000
# Проверяем наличие Python 2
elif command -v python &> /dev/null; then
    echo "Используется Python 2"
    echo "Откройте в браузере: http://localhost:8000"
    echo "Нажмите Ctrl+C для остановки"
    python -m SimpleHTTPServer 8000
# Проверяем наличие PHP
elif command -v php &> /dev/null; then
    echo "Используется PHP"
    echo "Откройте в браузере: http://localhost:8000"
    echo "Нажмите Ctrl+C для остановки"
    php -S localhost:8000
else
    echo "Ошибка: не найден Python или PHP"
    echo "Установите один из них или используйте Node.js:"
    echo "  npm install -g http-server"
    echo "  http-server -p 8000"
    exit 1
fi
