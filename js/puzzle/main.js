import { PuzzleGame } from './core/PuzzleGame.js';
import { PuzzleRenderer } from './core/PuzzleRenderer.js';
import { PuzzleInputHandler } from './core/PuzzleInputHandler.js';
import { DictionaryService } from '../services/DictionaryService.js';

// Точка входа в игру-головоломку

document.addEventListener('DOMContentLoaded', () => {
    // Получаем canvas элемент
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas элемент не найден!');
        return;
    }
    
    // Инициализация компонентов
    const dictionaryService = new DictionaryService();
    const renderer = new PuzzleRenderer(canvas);
    
    // Создание игры
    const game = new PuzzleGame(dictionaryService, renderer);
    
    // Обработчик ввода
    const inputHandler = new PuzzleInputHandler(game);
    
    // Обработчик кнопки "Старт"
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            game.startGame();
            startButton.style.display = 'none';
        });
    }
    
    // Первоначальная отрисовка
    game.render();
    
    console.log('Игра-головоломка запущена!');
    console.log('Слова уровня:', game.currentLevel?.words);
});
