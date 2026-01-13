import { Board2048 } from '../models/Board2048.js';
import { WORD2048_CONFIG } from '../../config-2048.js';

// Основная логика игры 2048 со словами

export class Game2048 {
    constructor(renderer) {
        this.board = new Board2048();
        this.renderer = renderer;
        this.inputHandler = null; // Будет установлен позже
        
        this.gameState = 'menu'; // menu, playing, won, lost
        this.moves = 0;
        this.currentWord = '';
        
        this.init();
    }
    
    setInputHandler(inputHandler) {
        this.inputHandler = inputHandler;
    }
    
    init() {
        // Выбираем случайное слово
        this.startNewGame();
    }
    
    startNewGame() {
        const randomWord = WORD2048_CONFIG.TARGET_WORDS[
            Math.floor(Math.random() * WORD2048_CONFIG.TARGET_WORDS.length)
        ];
        this.currentWord = randomWord;
        this.board.setTargetWord(randomWord);
        this.gameState = 'playing';
        this.moves = 0;
        this.render();
    }
    
    // Обработка движения
    move(direction) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // При циклическом сдвиге движение всегда возможно
        switch (direction) {
            case 'left':
                this.board.moveLeft();
                break;
            case 'right':
                this.board.moveRight();
                break;
            case 'up':
                this.board.moveUp();
                break;
            case 'down':
                this.board.moveDown();
                break;
            default:
                return;
        }
        
        // Увеличиваем счетчик ходов и проверяем победу
        this.moves++;
        this.checkWin();
        this.render();
    }
    
    // Проверка победы
    checkWin() {
        const result = this.board.checkWord();
        if (result.found) {
            this.gameState = 'won';
            this.renderer.showWinMessage(this.moves);
        }
    }
    
    // Рендеринг
    render() {
        this.renderer.render(
            this.board,
            this.gameState,
            this.currentWord,
            this.moves
        );
    }
}
