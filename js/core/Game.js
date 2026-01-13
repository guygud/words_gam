import { Board } from '../models/Board.js';
import { Piece } from '../models/Piece.js';
import { CONFIG } from '../config.js';
import { WordChecker } from '../services/WordChecker.js';
import { ScoreManager } from '../services/ScoreManager.js';

// Основной класс игры

export class Game {
    constructor(dictionaryService, renderer, inputHandler) {
        this.board = new Board();
        this.renderer = renderer;
        this.inputHandler = inputHandler;
        this.wordChecker = new WordChecker(dictionaryService);
        this.scoreManager = new ScoreManager();
        
        // Получаем уникальные буквы из слова дня
        this.allowedLetters = CONFIG.getUniqueLetters();
        
        // Текущая фигура
        this.currentPiece = null;
        
        // Таймеры
        this.dropTimer = 0;
        this.lastTime = 0;
        
        // Состояние игры
        this.isGameOver = false;
        this.isPaused = false;
        
        // Найденные слова для подсветки
        this.foundWords = [];
        
        // Создаем первую фигуру
        this.spawnNewPiece();
    }
    
    // Поиск всех слов на поле (для подсветки)
    findAllWords() {
        const allWordMatches = [];
        
        // Проверяем все линии (горизонтальные слова)
        for (let rowIndex = 0; rowIndex < this.board.height; rowIndex++) {
            const rowString = this.board.getRowString(rowIndex);
            const wordMatches = this.wordChecker.findWordsInLine(rowString, rowIndex, false);
            allWordMatches.push(...wordMatches);
        }
        
        // Проверяем все столбцы (вертикальные слова)
        for (let columnIndex = 0; columnIndex < this.board.width; columnIndex++) {
            const columnString = this.board.getColumnString(columnIndex);
            const wordMatches = this.wordChecker.findWordsInLine(columnString, columnIndex, true);
            allWordMatches.push(...wordMatches);
        }
        
        return allWordMatches;
    }
    
    // Создание новой случайной фигуры (теперь всегда одиночная буква)
    spawnNewPiece() {
        // Всегда создаем одиночную букву
        const type = 'SINGLE';
        
        // Стартовая позиция: случайная по ширине сверху
        const startX = Math.floor(Math.random() * CONFIG.BOARD_WIDTH);
        const startY = 0;
        
        this.currentPiece = new Piece(type, this.allowedLetters, startX, startY);
        
        // Проверка Game Over: если фигура не может быть размещена
        if (!this.currentPiece.canMove(this.board, 0, 0)) {
            this.isGameOver = true;
            this.renderer.addLogMessage('ИГРА ОКОНЧЕНА!');
        }
    }
    
    // Обработка ввода
    handleInput() {
        const keys = this.inputHandler.getKeys();
        
        if (keys.left) {
            this.currentPiece.moveLeft(this.board);
            this.inputHandler.keys.left = false; // Сбрасываем, чтобы не держать
        }
        
        if (keys.right) {
            this.currentPiece.moveRight(this.board);
            this.inputHandler.keys.right = false;
        }
        
        if (keys.down) {
            // Ускоренное падение
            if (this.currentPiece.moveDown(this.board)) {
                this.dropTimer = 0; // Сбрасываем таймер
            }
        }
        
        // Поворот не нужен для одиночных букв, но оставляем для совместимости
        if (keys.rotate) {
            // Для одиночных букв поворот не имеет смысла, но не мешаем
            // this.currentPiece.rotate(this.board);
            this.inputHandler.keys.rotate = false;
        }
    }
    
    // Обработка приземления фигуры
    handlePieceLanded() {
        // Размещаем фигуру на поле
        this.board.placePiece(this.currentPiece);
        
        const allWordMatches = [];
        const rowsToRemove = [];
        const columnsToRemove = [];
        
        // Проверяем заполненные линии (горизонтальные слова)
        const fullRows = this.board.getFullRows();
        
        if (fullRows.length > 0) {
            for (const rowIndex of fullRows) {
                const rowString = this.board.getRowString(rowIndex);
                const wordMatches = this.wordChecker.findWordsInLine(rowString, rowIndex, false);
                
                // Логируем строку для отладки
                console.log(`Проверка линии ${rowIndex}: "${rowString}" (длина: ${rowString.length}, пробелов: ${(rowString.match(/ /g) || []).length})`);
                
                // Если найдено хотя бы одно слово, линия сгорает
                if (wordMatches.length > 0) {
                    rowsToRemove.push(rowIndex);
                    allWordMatches.push(...wordMatches);
                    
                    // Логируем найденные слова
                    const words = wordMatches.map(w => w.word).join(', ');
                    const message = `Линия ${rowIndex}: "${rowString}" → найдены слова: ${words}`;
                    this.renderer.addLogMessage(message);
                    console.log(message);
                } else {
                    // Если слов не найдено, линия остается
                    // Проверяем, есть ли потенциальные слова для отладки
                    const trimmedRow = rowString.replace(/ /g, '');
                    console.log(`Линия ${rowIndex}: проверяем подстроки в "${trimmedRow}"`);
                    const message = `Линия ${rowIndex}: "${rowString}" → слова не найдены, линия не сгорает`;
                    this.renderer.addLogMessage(message);
                    console.log(message);
                }
            }
        }
        
        // Проверяем все столбцы на вертикальные слова (не только заполненные)
        // Но удаляем только полностью заполненные столбцы с найденными словами
        const fullColumns = this.board.getFullColumns();
        
        // Проверяем все столбцы на наличие слов
        for (let columnIndex = 0; columnIndex < this.board.width; columnIndex++) {
            const columnString = this.board.getColumnString(columnIndex);
            const wordMatches = this.wordChecker.findWordsInLine(columnString, columnIndex, true);
            
            if (wordMatches.length > 0) {
                allWordMatches.push(...wordMatches);
                
                // Логируем найденные слова
                const words = wordMatches.map(w => w.word).join(', ');
                const message = `Столбец ${columnIndex}: "${columnString}" → найдены слова: ${words}`;
                this.renderer.addLogMessage(message);
                console.log(message);
                
                // Если столбец полностью заполнен и содержит слова, он сгорает
                if (fullColumns.includes(columnIndex)) {
                    columnsToRemove.push(columnIndex);
                }
            }
        }
        
        // Удаляем линии с найденными словами
        if (rowsToRemove.length > 0) {
            this.board.removeRows(rowsToRemove);
            this.renderer.addLogMessage(`Сгорело линий: ${rowsToRemove.length}`);
        }
        
        // Удаляем столбцы с найденными словами
        if (columnsToRemove.length > 0) {
            this.board.removeColumns(columnsToRemove);
            this.renderer.addLogMessage(`Сгорело столбцов: ${columnsToRemove.length}`);
        }
        
        // Начисляем очки за все найденные слова (горизонтальные и вертикальные)
        if (allWordMatches.length > 0) {
            const points = this.scoreManager.calculateScore(allWordMatches);
            this.scoreManager.addPoints(points);
            
            this.renderer.addLogMessage(
                `Найдено слов: ${allWordMatches.length}, начислено очков: ${points}`
            );
        }
        
        // Создаем новую фигуру
        this.spawnNewPiece();
    }
    
    // Обновление игрового состояния
    update(deltaTime) {
        if (this.isGameOver || this.isPaused) {
            return;
        }
        
        // Обработка ввода
        this.handleInput();
        
        // Обновление таймера падения
        this.dropTimer += deltaTime;
        const dropInterval = this.inputHandler.keys.down 
            ? CONFIG.FAST_DROP_INTERVAL 
            : CONFIG.DROP_INTERVAL;
        
        if (this.dropTimer >= dropInterval) {
            this.dropTimer = 0;
            
            // Пытаемся опустить фигуру
            if (!this.currentPiece.moveDown(this.board)) {
                // Фигура не может двигаться вниз - приземлилась
                this.handlePieceLanded();
            }
        }
    }
    
    // Отрисовка игры
    render() {
        // Обновляем список найденных слов для подсветки
        this.foundWords = this.findAllWords();
        
        this.renderer.render(this.board, this.currentPiece, this.foundWords);
        this.renderer.updateUI(
            this.scoreManager.getScore(),
            CONFIG.WORD_OF_DAY
        );
    }
    
    // Главный игровой цикл
    gameLoop(currentTime) {
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        if (!this.isGameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    // Запуск игры
    start() {
        this.lastTime = 0;
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // Пауза/возобновление
    togglePause() {
        this.isPaused = !this.isPaused;
    }
}
