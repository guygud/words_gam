import { Game2048 } from './core/Game2048.js';
import { Renderer2048 } from './core/Renderer2048.js';
import { InputHandler2048 } from './core/InputHandler2048.js';

// Точка входа для игры 2048 со словами

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas element not found!');
} else {
    const renderer = new Renderer2048(canvas);
    const game = new Game2048(renderer);
    const inputHandler = new InputHandler2048(game);
    game.setInputHandler(inputHandler);
    
    // Первоначальный рендеринг
    game.render();
    
    console.log('Игра 2048 со словами загружена!');
}
