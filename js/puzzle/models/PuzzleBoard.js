import { Cell } from '../../models/Cell.js';
import { PUZZLE_CONFIG } from '../../config-puzzle.js';

// Игровое поле для головоломки с вращением

export class PuzzleBoard {
    constructor(size = PUZZLE_CONFIG.BOARD_SIZE) {
        this.size = size;
        this.cells = [];
        
        // Инициализация поля пустыми клетками
        for (let y = 0; y < size; y++) {
            this.cells[y] = [];
            for (let x = 0; x < size; x++) {
                this.cells[y][x] = new Cell();
            }
        }
    }
    
    // Проверка, находится ли координата внутри поля
    isInside(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
    
    // Получить клетку по координатам
    getCell(x, y) {
        if (this.isInside(x, y)) {
            return this.cells[y][x];
        }
        return null;
    }
    
    // Установить букву в клетку
    setLetter(x, y, letter) {
        if (this.isInside(x, y)) {
            this.cells[y][x].setLetter(letter);
        }
    }
    
    // Получить строку букв из линии
    getRowString(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.size) {
            return '';
        }
        
        let rowString = '';
        for (let x = 0; x < this.size; x++) {
            if (this.cells[rowIndex][x].occupied) {
                rowString += this.cells[rowIndex][x].letter;
            } else {
                rowString += ' ';
            }
        }
        
        return rowString;
    }
    
    // Получить строку букв из столбца (вертикально)
    getColumnString(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.size) {
            return '';
        }
        
        let columnString = '';
        for (let y = 0; y < this.size; y++) {
            if (this.cells[y][columnIndex].occupied) {
                columnString += this.cells[y][columnIndex].letter;
            } else {
                columnString += ' ';
            }
        }
        
        return columnString;
    }
    
    // Вращение строки влево
    rotateRowLeft(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.size) {
            return;
        }
        
        const row = this.cells[rowIndex];
        const first = row[0];
        
        // Сдвигаем все элементы влево
        for (let x = 0; x < this.size - 1; x++) {
            row[x] = row[x + 1];
        }
        
        // Первый элемент становится последним
        row[this.size - 1] = first;
    }
    
    // Вращение строки вправо
    rotateRowRight(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.size) {
            return;
        }
        
        const row = this.cells[rowIndex];
        const last = row[this.size - 1];
        
        // Сдвигаем все элементы вправо
        for (let x = this.size - 1; x > 0; x--) {
            row[x] = row[x - 1];
        }
        
        // Последний элемент становится первым
        row[0] = last;
    }
    
    // Вращение столбца вверх
    rotateColumnUp(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.size) {
            return;
        }
        
        const first = this.cells[0][columnIndex];
        
        // Сдвигаем все элементы вверх
        for (let y = 0; y < this.size - 1; y++) {
            this.cells[y][columnIndex] = this.cells[y + 1][columnIndex];
        }
        
        // Первый элемент становится последним
        this.cells[this.size - 1][columnIndex] = first;
    }
    
    // Вращение столбца вниз
    rotateColumnDown(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.size) {
            return;
        }
        
        const last = this.cells[this.size - 1][columnIndex];
        
        // Сдвигаем все элементы вниз
        for (let y = this.size - 1; y > 0; y--) {
            this.cells[y][columnIndex] = this.cells[y - 1][columnIndex];
        }
        
        // Последний элемент становится первым
        this.cells[0][columnIndex] = last;
    }
}
