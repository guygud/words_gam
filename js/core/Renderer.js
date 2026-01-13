import { CONFIG } from '../config.js';

// Рендерер для отрисовки игры на Canvas

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = CONFIG.CELL_SIZE;
        this.highlightedCells = new Set(); // Клетки с найденными словами для подсветки
    }
    
    // Очистка canvas
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Отрисовка сетки поля
    drawGrid(board) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= board.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, board.height * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= board.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(board.width * this.cellSize, y * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    // Отрисовка игрового поля
    drawBoard(board) {
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                const cell = board.getCell(x, y);
                if (cell && cell.occupied) {
                    // Проверяем, подсвечена ли клетка
                    const isHighlighted = this.highlightedCells && this.highlightedCells.has(`${y},${x}`);
                    this.drawCell(x, y, cell.letter, isHighlighted);
                }
            }
        }
    }
    
    // Отрисовка клетки
    drawCell(x, y, letter, isHighlighted = false) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        // Фон клетки (подсвеченный или обычный)
        if (isHighlighted) {
            this.ctx.fillStyle = '#4CAF50'; // Зеленый для найденных слов
        } else {
            this.ctx.fillStyle = '#444';
        }
        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Буква
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${this.cellSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            letter,
            pixelX + this.cellSize / 2,
            pixelY + this.cellSize / 2
        );
    }
    
    // Отрисовка подсветки найденных слов
    drawWordHighlights(wordMatches) {
        if (!wordMatches || wordMatches.length === 0) {
            this.highlightedCells = new Set();
            return;
        }
        
        // Создаем карту подсвеченных клеток
        const highlightedCells = new Set();
        
        for (const match of wordMatches) {
            if (match.isVertical) {
                // Вертикальное слово: rowIndex = columnIndex, startX/endX = startY/endY
                const columnIndex = match.rowIndex;
                for (let y = match.startX; y <= match.endX; y++) {
                    highlightedCells.add(`${y},${columnIndex}`);
                }
            } else {
                // Горизонтальное слово: rowIndex = rowIndex, startX/endX = startX/endX
                const rowIndex = match.rowIndex;
                for (let x = match.startX; x <= match.endX; x++) {
                    highlightedCells.add(`${rowIndex},${x}`);
                }
            }
        }
        
        // Сохраняем карту для использования в drawBoard
        this.highlightedCells = highlightedCells;
    }
    
    // Отрисовка текущей фигуры
    drawPiece(piece) {
        if (!piece) return;
        
        const cells = piece.getCells();
        
        for (const cell of cells) {
            this.drawCell(cell.x, cell.y, cell.letter);
        }
    }
    
    // Отрисовка всего игрового состояния
    render(board, currentPiece, wordMatches = []) {
        this.clear();
        this.drawGrid(board);
        
        // Подсвечиваем найденные слова
        this.drawWordHighlights(wordMatches);
        
        this.drawBoard(board);
        this.drawPiece(currentPiece);
    }
    
    // Обновление UI элементов
    updateUI(score, wordOfDay) {
        const scoreElement = document.getElementById('score');
        const wordOfDayElement = document.getElementById('word-of-day');
        
        if (scoreElement) {
            scoreElement.textContent = score;
        }
        
        if (wordOfDayElement) {
            wordOfDayElement.textContent = wordOfDay;
        }
    }
    
    // Добавление сообщения в лог
    addLogMessage(message) {
        const logPanel = document.getElementById('log');
        if (logPanel) {
            const p = document.createElement('p');
            p.textContent = message;
            logPanel.appendChild(p);
            
            // Прокрутка вниз
            logPanel.scrollTop = logPanel.scrollHeight;
        }
    }
}
