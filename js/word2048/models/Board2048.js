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
        
        // Размещаем буквы слова случайным образом на доске
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
        
        // Размещаем буквы (повторяем буквы слова, если нужно)
        let letterIndex = 0;
        for (let i = 0; i < positions.length; i++) {
            const [x, y] = positions[i].split(',').map(Number);
            const letter = letters[letterIndex % letters.length];
            this.cells[y][x] = letter;
            letterIndex++;
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
    
    // Сдвиг влево
    moveLeft() {
        let moved = false;
        for (let y = 0; y < this.size; y++) {
            const row = [];
            // Собираем все непустые клетки
            for (let x = 0; x < this.size; x++) {
                if (this.cells[y][x] !== null) {
                    row.push(this.cells[y][x]);
                }
            }
            
            // Заполняем строку слева направо
            const newRow = new Array(this.size).fill(null);
            for (let i = 0; i < row.length; i++) {
                newRow[i] = row[i];
            }
            
            // Проверяем, изменилась ли строка
            if (JSON.stringify(this.cells[y]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            
            this.cells[y] = newRow;
        }
        return moved;
    }
    
    // Сдвиг вправо
    moveRight() {
        let moved = false;
        for (let y = 0; y < this.size; y++) {
            const row = [];
            // Собираем все непустые клетки
            for (let x = 0; x < this.size; x++) {
                if (this.cells[y][x] !== null) {
                    row.push(this.cells[y][x]);
                }
            }
            
            // Заполняем строку справа налево
            const newRow = new Array(this.size).fill(null);
            for (let i = 0; i < row.length; i++) {
                newRow[this.size - 1 - i] = row[row.length - 1 - i];
            }
            
            // Проверяем, изменилась ли строка
            if (JSON.stringify(this.cells[y]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            
            this.cells[y] = newRow;
        }
        return moved;
    }
    
    // Сдвиг вверх
    moveUp() {
        let moved = false;
        for (let x = 0; x < this.size; x++) {
            const column = [];
            // Собираем все непустые клетки
            for (let y = 0; y < this.size; y++) {
                if (this.cells[y][x] !== null) {
                    column.push(this.cells[y][x]);
                }
            }
            
            // Заполняем столбец сверху вниз
            const newColumn = new Array(this.size).fill(null);
            for (let i = 0; i < column.length; i++) {
                newColumn[i] = column[i];
            }
            
            // Проверяем, изменился ли столбец
            let changed = false;
            for (let y = 0; y < this.size; y++) {
                if (this.cells[y][x] !== newColumn[y]) {
                    changed = true;
                    break;
                }
            }
            
            if (changed) {
                moved = true;
                for (let y = 0; y < this.size; y++) {
                    this.cells[y][x] = newColumn[y];
                }
            }
        }
        return moved;
    }
    
    // Сдвиг вниз
    moveDown() {
        let moved = false;
        for (let x = 0; x < this.size; x++) {
            const column = [];
            // Собираем все непустые клетки
            for (let y = 0; y < this.size; y++) {
                if (this.cells[y][x] !== null) {
                    column.push(this.cells[y][x]);
                }
            }
            
            // Заполняем столбец снизу вверх
            const newColumn = new Array(this.size).fill(null);
            for (let i = 0; i < column.length; i++) {
                newColumn[this.size - 1 - i] = column[column.length - 1 - i];
            }
            
            // Проверяем, изменился ли столбец
            let changed = false;
            for (let y = 0; y < this.size; y++) {
                if (this.cells[y][x] !== newColumn[y]) {
                    changed = true;
                    break;
                }
            }
            
            if (changed) {
                moved = true;
                for (let y = 0; y < this.size; y++) {
                    this.cells[y][x] = newColumn[y];
                }
            }
        }
        return moved;
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
