import { Cell } from './Cell.js';
import { CONFIG } from '../config.js';

// Класс игрового поля

export class Board {
    constructor(width = CONFIG.BOARD_WIDTH, height = CONFIG.BOARD_HEIGHT) {
        this.width = width;
        this.height = height;
        this.cells = [];
        
        // Инициализация поля пустыми клетками
        for (let y = 0; y < height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < width; x++) {
                this.cells[y][x] = new Cell();
            }
        }
    }
    
    // Проверка, находится ли координата внутри поля
    isInside(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    // Проверка, свободна ли клетка
    isCellFree(x, y) {
        if (!this.isInside(x, y)) {
            return false;
        }
        return !this.cells[y][x].occupied;
    }
    
    // Размещение фигуры на поле
    placePiece(piece) {
        const cells = piece.getCells();
        
        for (const cell of cells) {
            if (this.isInside(cell.x, cell.y)) {
                this.cells[cell.y][cell.x].setLetter(cell.letter);
            }
        }
    }
    
    // Получить индексы полностью заполненных линий
    getFullRows() {
        const fullRows = [];
        
        for (let y = 0; y < this.height; y++) {
            let isFull = true;
            for (let x = 0; x < this.width; x++) {
                if (!this.cells[y][x].occupied) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                fullRows.push(y);
            }
        }
        
        return fullRows;
    }
    
    // Получить строку букв из линии
    getRowString(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.height) {
            return '';
        }
        
        let rowString = '';
        for (let x = 0; x < this.width; x++) {
            if (this.cells[rowIndex][x].occupied) {
                rowString += this.cells[rowIndex][x].letter;
            } else {
                rowString += ' '; // Пробел для пустых клеток
            }
        }
        
        return rowString;
    }
    
    // Удаление линий (сдвиг вниз)
    removeRows(rowIndices) {
        // Сортируем индексы по убыванию, чтобы удалять сверху вниз
        const sortedRows = [...rowIndices].sort((a, b) => b - a);
        
        for (const rowIndex of sortedRows) {
            // Удаляем линию
            this.cells.splice(rowIndex, 1);
            
            // Добавляем новую пустую линию сверху
            const newRow = [];
            for (let x = 0; x < this.width; x++) {
                newRow[x] = new Cell();
            }
            this.cells.unshift(newRow);
        }
    }
    
    // Получить клетку по координатам
    getCell(x, y) {
        if (this.isInside(x, y)) {
            return this.cells[y][x];
        }
        return null;
    }
    
    // Получить строку букв из столбца (вертикально)
    getColumnString(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.width) {
            return '';
        }
        
        let columnString = '';
        for (let y = 0; y < this.height; y++) {
            if (this.cells[y][columnIndex].occupied) {
                columnString += this.cells[y][columnIndex].letter;
            } else {
                columnString += ' '; // Пробел для пустых клеток
            }
        }
        
        return columnString;
    }
    
    // Получить индексы полностью заполненных столбцов
    getFullColumns() {
        const fullColumns = [];
        
        for (let x = 0; x < this.width; x++) {
            let isFull = true;
            for (let y = 0; y < this.height; y++) {
                if (!this.cells[y][x].occupied) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                fullColumns.push(x);
            }
        }
        
        return fullColumns;
    }
    
    // Очистка столбцов (заполнение пустыми клетками)
    removeColumns(columnIndices) {
        for (const columnIndex of columnIndices) {
            // Очищаем все клетки в столбце
            for (let y = 0; y < this.height; y++) {
                this.cells[y][columnIndex].clear();
            }
        }
        
        // Сдвигаем содержимое вниз (как в тетрисе при удалении строк)
        // Но для столбцов проще просто очистить - содержимое упадет само при следующем падении
    }
}
