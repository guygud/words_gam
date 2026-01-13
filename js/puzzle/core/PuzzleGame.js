import { PuzzleBoard } from '../models/PuzzleBoard.js';
import { PUZZLE_CONFIG } from '../../config-puzzle.js';
import { WordChecker } from '../../services/WordChecker.js';
import { LevelGenerator } from '../services/LevelGenerator.js';
import { WordMatch } from '../../models/WordMatch.js';

// Основной класс игры-головоломки

export class PuzzleGame {
    constructor(dictionaryService, renderer) {
        this.renderer = renderer;
        this.wordChecker = new WordChecker(dictionaryService);
        this.levelGenerator = new LevelGenerator(dictionaryService);
        
        this.board = new PuzzleBoard();
        this.currentLevel = null;
        this.moves = 0;
        this.foundWords = [];
        
        // Состояние игры
        this.gameState = 'preview'; // 'preview', 'shuffling', 'playing', 'completed'
        this.targetWords = []; // Слова, которые нужно собрать
        this.foundTargetWords = []; // Собранные целевые слова (в верхнем регистре)
        this.lockedRows = new Set(); // Зафиксированные строки (собранные слова)
        this.lockedColumns = new Set(); // Зафиксированные столбцы (собранные слова)
        
        // Сохраняем ссылку на renderer для доступа из InputHandler
        this.renderer.game = this;
        
        // Генерируем уровень (но не начинаем сразу)
        this.prepareLevel();
    }
    
    // Подготовка уровня (показываем начальное состояние)
    prepareLevel() {
        this.moves = 0;
        this.foundWords = [];
        this.foundTargetWords = [];
        this.lockedRows = new Set();
        this.lockedColumns = new Set();
        this.gameState = 'preview';
        
        // Генерируем уровень
        this.currentLevel = this.levelGenerator.generateLevel();
        this.targetWords = [...this.currentLevel.words];
        
        // Заполняем доску начальным состоянием (словами)
        const initialBoard = this.currentLevel.initialBoard;
        for (let y = 0; y < PUZZLE_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < PUZZLE_CONFIG.BOARD_SIZE; x++) {
                this.board.setLetter(x, y, initialBoard[y][x]);
            }
        }
        
        // Выводим информацию об уровне
        console.log('Слова уровня:', this.targetWords);
        this.renderer.addLogMessage(`Соберите слова: ${this.targetWords.join(', ')}`);
        this.renderer.addLogMessage('Нажмите "Старт" для начала!');
        
        // НЕ проверяем слова в preview режиме - они будут зафиксированы только после перемешивания
        this.render();
    }
    
    // Начало игры (запуск перемешивания)
    startGame() {
        if (this.gameState !== 'preview') {
            return;
        }
        
        this.gameState = 'shuffling';
        this.moves = 0;
        this.foundTargetWords = [];
        this.renderer.addLogMessage('Перемешивание...');
        
        // Запускаем анимацию перемешивания
        this.shuffleWithAnimation();
    }
    
    // Перемешивание с анимацией
    async shuffleWithAnimation() {
        const rotations = this.currentLevel.rotations || [];
        const delay = 100; // Задержка между вращениями в миллисекундах
        
        // Выполняем вращения с задержкой для анимации
        for (let i = 0; i < rotations.length; i++) {
            const rotation = rotations[i];
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (rotation.type === 'row') {
                if (rotation.direction === 'left') {
                    this.board.rotateRowLeft(rotation.index);
                } else {
                    this.board.rotateRowRight(rotation.index);
                }
            } else if (rotation.type === 'column') {
                if (rotation.direction === 'up') {
                    this.board.rotateColumnUp(rotation.index);
                } else {
                    this.board.rotateColumnDown(rotation.index);
                }
            }
            
            this.render();
        }
        
        // После перемешивания переходим в режим игры
        this.gameState = 'playing';
        this.renderer.addLogMessage('Начинайте собирать слова!');
        this.render();
    }
    
    // Начало нового уровня
    startNewLevel() {
        this.prepareLevel();
    }
    
    // Вращение строки влево
    rotateRowLeft(rowIndex) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // Проверяем, не зафиксирована ли строка
        if (this.lockedRows.has(rowIndex)) {
            return;
        }
        
        this.board.rotateRowLeft(rowIndex);
        this.moves++;
        this.checkWords();
        this.checkWin();
        this.render();
    }
    
    // Вращение строки вправо
    rotateRowRight(rowIndex) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // Проверяем, не зафиксирована ли строка
        if (this.lockedRows.has(rowIndex)) {
            return;
        }
        
        this.board.rotateRowRight(rowIndex);
        this.moves++;
        this.checkWords();
        this.checkWin();
        this.render();
    }
    
    // Вращение столбца вверх
    rotateColumnUp(columnIndex) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // Проверяем, не зафиксирован ли столбец
        if (this.lockedColumns.has(columnIndex)) {
            return;
        }
        
        // Вращаем столбец, пропуская зафиксированные строки
        this.rotateColumnUpWithLocks(columnIndex);
        this.moves++;
        this.checkWords();
        this.checkWin();
        this.render();
    }
    
    // Вращение столбца вниз
    rotateColumnDown(columnIndex) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // Проверяем, не зафиксирован ли столбец
        if (this.lockedColumns.has(columnIndex)) {
            return;
        }
        
        // Вращаем столбец, пропуская зафиксированные строки
        this.rotateColumnDownWithLocks(columnIndex);
        this.moves++;
        this.checkWords();
        this.checkWin();
        this.render();
    }
    
    // Вращение столбца вверх с учетом зафиксированных строк
    rotateColumnUpWithLocks(columnIndex) {
        const size = PUZZLE_CONFIG.BOARD_SIZE;
        
        // Собираем незафиксированные элементы столбца
        const unlockedElements = [];
        const unlockedIndices = [];
        
        for (let y = 0; y < size; y++) {
            if (!this.lockedRows.has(y)) {
                unlockedElements.push(this.board.getCell(columnIndex, y).letter);
                unlockedIndices.push(y);
            }
        }
        
        if (unlockedElements.length <= 1) {
            return; // Нечего вращать
        }
        
        // Вращаем незафиксированные элементы
        const first = unlockedElements[0];
        for (let i = 0; i < unlockedElements.length - 1; i++) {
            unlockedElements[i] = unlockedElements[i + 1];
        }
        unlockedElements[unlockedElements.length - 1] = first;
        
        // Применяем изменения обратно к незафиксированным позициям
        for (let i = 0; i < unlockedIndices.length; i++) {
            const y = unlockedIndices[i];
            this.board.setLetter(columnIndex, y, unlockedElements[i]);
        }
    }
    
    // Вращение столбца вниз с учетом зафиксированных строк
    rotateColumnDownWithLocks(columnIndex) {
        const size = PUZZLE_CONFIG.BOARD_SIZE;
        
        // Собираем незафиксированные элементы столбца
        const unlockedElements = [];
        const unlockedIndices = [];
        
        for (let y = 0; y < size; y++) {
            if (!this.lockedRows.has(y)) {
                unlockedElements.push(this.board.getCell(columnIndex, y).letter);
                unlockedIndices.push(y);
            }
        }
        
        if (unlockedElements.length <= 1) {
            return; // Нечего вращать
        }
        
        // Вращаем незафиксированные элементы
        const last = unlockedElements[unlockedElements.length - 1];
        for (let i = unlockedElements.length - 1; i > 0; i--) {
            unlockedElements[i] = unlockedElements[i - 1];
        }
        unlockedElements[0] = last;
        
        // Применяем изменения обратно к незафиксированным позициям
        for (let i = 0; i < unlockedIndices.length; i++) {
            const y = unlockedIndices[i];
            this.board.setLetter(columnIndex, y, unlockedElements[i]);
        }
    }
    
    // Проверка победы (все ли слова собраны)
    checkWin() {
        if (!this.targetWords || this.targetWords.length === 0) {
            return;
        }
        
        // Проверяем, собраны ли все целевые слова
        const foundWordStrings = this.foundWords.map(w => w.word.toUpperCase());
        const allFound = this.targetWords.every(word => {
            const upperWord = word.toUpperCase();
            return foundWordStrings.includes(upperWord);
        });
        
        if (allFound && this.foundWords.length >= this.targetWords.length) {
            this.gameState = 'completed';
            this.renderer.addLogMessage(`🎉 Поздравляем! Все слова собраны за ${this.moves} ходов!`);
            this.renderer.showWinMessage(this.moves);
        }
    }
    
    // Проверка всех слов на поле (только целевые слова)
    checkWords() {
        const targetWordMatches = [];
        const previousFound = this.foundTargetWords || [];
        this.foundTargetWords = [];
        
        // Проверяем все строки (горизонтальные слова)
        for (let rowIndex = 0; rowIndex < PUZZLE_CONFIG.BOARD_SIZE; rowIndex++) {
            const rowString = this.board.getRowString(rowIndex);
            const foundTargets = this.findTargetWordsInLine(rowString, rowIndex, false);
            targetWordMatches.push(...foundTargets);
        }
        
        // Проверяем все столбцы (вертикальные слова)
        for (let columnIndex = 0; columnIndex < PUZZLE_CONFIG.BOARD_SIZE; columnIndex++) {
            const columnString = this.board.getColumnString(columnIndex);
            const foundTargets = this.findTargetWordsInLine(columnString, columnIndex, true);
            targetWordMatches.push(...foundTargets);
        }
        
        // Обновляем список найденных целевых слов
        const foundWordStrings = targetWordMatches.map(w => w.word.toUpperCase());
        const newlyFound = [];
        
        for (const targetWord of this.targetWords) {
            const upperTarget = targetWord.toUpperCase();
            if (foundWordStrings.includes(upperTarget)) {
                this.foundTargetWords.push(upperTarget);
                // Проверяем, было ли это слово уже найдено ранее
                if (!previousFound.includes(upperTarget)) {
                    newlyFound.push(targetWord);
                }
            }
        }
        
        // Сохраняем только найденные целевые слова для подсветки
        this.foundWords = targetWordMatches;
        
        // Фиксируем ряды/столбцы с собранными словами (только в режиме игры)
        if (this.gameState === 'playing') {
            for (const match of targetWordMatches) {
                if (match.isVertical) {
                    // Вертикальное слово - фиксируем столбец
                    this.lockedColumns.add(match.rowIndex);
                } else {
                    // Горизонтальное слово - фиксируем строку
                    this.lockedRows.add(match.rowIndex);
                }
            }
            
            // Логируем только что найденные слова
            if (newlyFound.length > 0) {
                for (const word of newlyFound) {
                    this.renderer.addLogMessage(`✓ Собрано: ${word} - ряд зафиксирован!`);
                }
            }
        }
        
        return targetWordMatches;
    }
    
    // Поиск только целевых слов в строке/столбце
    findTargetWordsInLine(line, lineIndex, isVertical) {
        const matches = [];
        
        if (!line || line.length < 3) {
            return matches;
        }
        
        // Проверяем все возможные подстроки
        for (let start = 0; start < line.length; start++) {
            if (line[start] === ' ') {
                continue;
            }
            
            for (let length = 3; length <= line.length - start; length++) {
                const substring = line.substring(start, start + length);
                
                if (substring.includes(' ')) {
                    break;
                }
                
                const upperSubstring = substring.toUpperCase();
                
                // Проверяем, является ли подстрока одним из целевых слов
                if (this.targetWords.some(word => word.toUpperCase() === upperSubstring)) {
                    const endPos = start + length - 1;
                    matches.push(new WordMatch(lineIndex, start, endPos, upperSubstring, isVertical));
                }
            }
        }
        
        return matches;
    }
    
    // Отрисовка игры
    render() {
        // Обновляем список найденных слов для подсветки
        this.foundWords = this.findAllWords();
        
        this.renderer.render(
            this.board, 
            this.foundWords, 
            this.moves, 
            this.gameState,
            this.targetWords,
            this.foundTargetWords || [],
            this.lockedRows,
            this.lockedColumns
        );
    }
    
    // Поиск всех слов на поле (только целевые слова для подсветки)
    findAllWords() {
        const targetWordMatches = [];
        
        // Проверяем все строки (горизонтальные слова)
        for (let rowIndex = 0; rowIndex < PUZZLE_CONFIG.BOARD_SIZE; rowIndex++) {
            const rowString = this.board.getRowString(rowIndex);
            const foundTargets = this.findTargetWordsInLine(rowString, rowIndex, false);
            targetWordMatches.push(...foundTargets);
        }
        
        // Проверяем все столбцы (вертикальные слова)
        for (let columnIndex = 0; columnIndex < PUZZLE_CONFIG.BOARD_SIZE; columnIndex++) {
            const columnString = this.board.getColumnString(columnIndex);
            const foundTargets = this.findTargetWordsInLine(columnString, columnIndex, true);
            targetWordMatches.push(...foundTargets);
        }
        
        return targetWordMatches;
    }
}
