import { WORD2048_CONFIG } from '../../config-2048.js';

// Модель доски для игры 2048 со словами

export class Board2048 {
    constructor(size = WORD2048_CONFIG.BOARD_SIZE) {
        this.size = size;
        this.cells = [];
        this.targetWord = '';
        
        // Инициализация пустой доски
        this.reset();
    }
    
    // Сброс доски
    reset() {
        this.cells = [];
        for (let y = 0; y < this.size; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.cells[y][x] = null; // null означает пустую клетку
            }
        }
    }
    
    // Установить целевое слово и разместить буквы
    setTargetWord(word) {
        this.targetWord = word.toUpperCase();
        this.reset();
        
        const letters = this.targetWord.split('');
        const positions = [];
        
        // Генерируем случайные позиции
        while (positions.length < WORD2048_CONFIG.INITIAL_LETTERS_COUNT) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);
            const pos = `${x},${y}`;
            
            if (!positions.includes(pos)) {
                positions.push(pos);
            }
        }
        
        // Сначала размещаем все уникальные буквы из слова (гарантируем наличие всех букв)
        const uniqueLetters = [...new Set(letters)];
        const lettersToPlace = [...uniqueLetters];
        
        // Добавляем остальные буквы (с повторениями) до нужного количества
        while (lettersToPlace.length < WORD2048_CONFIG.INITIAL_LETTERS_COUNT) {
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            lettersToPlace.push(randomLetter);
        }
        
        // Перемешиваем буквы для случайного размещения
        for (let i = lettersToPlace.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lettersToPlace[i], lettersToPlace[j]] = [lettersToPlace[j], lettersToPlace[i]];
        }
        
        // Размещаем буквы на доске
        for (let i = 0; i < positions.length; i++) {
            const [x, y] = positions[i].split(',').map(Number);
            this.cells[y][x] = lettersToPlace[i];
        }
    }
    
    // Получить букву в позиции
    getCell(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return null;
        }
        return this.cells[y][x];
    }
    
    // Установить букву в позицию
    setCell(x, y, letter) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            this.cells[y][x] = letter;
        }
    }
    
    // Проверка, пуста ли клетка
    isEmpty(x, y) {
        return this.getCell(x, y) === null;
    }
    
    // Циклический сдвиг влево (тор - последний элемент становится первым)
    moveLeft() {
        for (let y = 0; y < this.size; y++) {
            const first = this.cells[y][0];
            // Сдвигаем все элементы влево
            for (let x = 0; x < this.size - 1; x++) {
                this.cells[y][x] = this.cells[y][x + 1];
            }
            // Первый элемент становится последним
            this.cells[y][this.size - 1] = first;
        }
        return true; // Циклический сдвиг всегда возможен
    }
    
    // Циклический сдвиг вправо (тор - первый элемент становится последним)
    moveRight() {
        for (let y = 0; y < this.size; y++) {
            const last = this.cells[y][this.size - 1];
            // Сдвигаем все элементы вправо
            for (let x = this.size - 1; x > 0; x--) {
                this.cells[y][x] = this.cells[y][x - 1];
            }
            // Последний элемент становится первым
            this.cells[y][0] = last;
        }
        return true; // Циклический сдвиг всегда возможен
    }
    
    // Циклический сдвиг вверх (тор - последний элемент становится первым)
    moveUp() {
        for (let x = 0; x < this.size; x++) {
            const first = this.cells[0][x];
            // Сдвигаем все элементы вверх
            for (let y = 0; y < this.size - 1; y++) {
                this.cells[y][x] = this.cells[y + 1][x];
            }
            // Первый элемент становится последним
            this.cells[this.size - 1][x] = first;
        }
        return true; // Циклический сдвиг всегда возможен
    }
    
    // Циклический сдвиг вниз (тор - первый элемент становится последним)
    moveDown() {
        for (let x = 0; x < this.size; x++) {
            const last = this.cells[this.size - 1][x];
            // Сдвигаем все элементы вниз
            for (let y = this.size - 1; y > 0; y--) {
                this.cells[y][x] = this.cells[y - 1][x];
            }
            // Последний элемент становится первым
            this.cells[0][x] = last;
        }
        return true; // Циклический сдвиг всегда возможен
    }
    
    // Проверка, собрано ли слово
    checkWord() {
        const target = this.targetWord;
        if (!target) return { found: false };
        
        // Проверяем горизонтальные строки
        for (let y = 0; y < this.size; y++) {
            // Собираем все буквы в строке (игнорируя null)
            let row = '';
            for (let x = 0; x < this.size; x++) {
                if (this.cells[y][x] !== null) {
                    row += this.cells[y][x];
                }
            }
            
            // Проверяем прямое направление
            if (row.includes(target)) {
                return { found: true, word: target, row: y, column: -1 };
            }
            
            // Проверяем обратное направление
            const reversed = row.split('').reverse().join('');
            if (reversed.includes(target)) {
                return { found: true, word: target, row: y, column: -1 };
            }
        }
        
        // Проверяем вертикальные столбцы
        for (let x = 0; x < this.size; x++) {
            // Собираем все буквы в столбце (игнорируя null)
            let column = '';
            for (let y = 0; y < this.size; y++) {
                if (this.cells[y][x] !== null) {
                    column += this.cells[y][x];
                }
            }
            
            // Проверяем прямое направление
            if (column.includes(target)) {
                return { found: true, word: target, row: -1, column: x };
            }
            
            // Проверяем обратное направление
            const reversed = column.split('').reverse().join('');
            if (reversed.includes(target)) {
                return { found: true, word: target, row: -1, column: x };
            }
        }
        
        return { found: false };
    }
}
