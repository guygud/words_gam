import { RunnerGame } from './core/RunnerGame.js';
import { RunnerRenderer } from './core/RunnerRenderer.js';
import { RunnerInput } from './core/RunnerInput.js';
import { RUNNER_CONFIG } from '../config-runner.js';

// Точка входа для раннера с буквами

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas element not found!');
} else {
    const renderer = new RunnerRenderer(canvas);
    const game = new RunnerGame(renderer);
    game.renderer = renderer;
    const inputHandler = new RunnerInput(game);
    
    // Игровой цикл
    let lastTime = 0;
    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        game.update();
        renderer.render(game.getRenderData());
        
        requestAnimationFrame(gameLoop);
    }
    
    // Добавляем метод restart в game
    game.restart = function() {
        this.player = {
            x: RUNNER_CONFIG.PLAYER_START_X,
            y: RUNNER_CONFIG.PLAYER_START_Y,
            lane: 1,
            collectedLetters: [],
            stuckLetters: []
        };
        this.gameState = 'playing';
        this.currentWordIndex = 0;
        this.currentWord = RUNNER_CONFIG.TARGET_WORDS[0];
        this.wordProgress = '';
        this.letters = [];
        this.bonuses = [];
        this.letterSpawnTimer = 0;
        this.bonusSpawnTimer = 0;
        this.activeBonuses = { clear: false, filter: false };
        this.bonusTimers = { clear: 0, filter: 0 };
        this.fallSpeed = RUNNER_CONFIG.LETTER_FALL_SPEED;
        this.spawnRate = RUNNER_CONFIG.LETTER_SPAWN_RATE;
        this.frameCount = 0;
    };
    
    // Запуск игры
    gameLoop(0);
    
    console.log('Раннер с буквами загружен!');
}
