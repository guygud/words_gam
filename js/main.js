import { Game } from './core/Game.js';
import { Renderer } from './core/Renderer.js';
import { InputHandler } from './core/InputHandler.js';
import { DictionaryService } from './services/DictionaryService.js';

// Точка входа в игру

document.addEventListener('DOMContentLoaded', () => {
    // Получаем canvas элемент
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas элемент не найден!');
        return;
    }
    
    // Инициализация компонентов
    const dictionaryService = new DictionaryService();
    const renderer = new Renderer(canvas);
    const inputHandler = new InputHandler();
    
    // Создание игры
    const game = new Game(dictionaryService, renderer, inputHandler);
    
    // Запуск игры
    game.start();
    
    console.log('Игра "Тетрис со словом дня" запущена!');
    console.log('Слово дня:', 'ЭВОЛЮЦИЯ');
    console.log('Разрешенные буквы:', [...new Set('ЭВОЛЮЦИЯ'.split(''))]);
});
