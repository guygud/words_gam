import { WORD2048_CONFIG } from '../../config-2048.js';

// Рендерер для игры 2048 со словами

export class Renderer2048 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Устанавливаем размер canvas
        const size = WORD2048_CONFIG.BOARD_SIZE;
        const cellSize = WORD2048_CONFIG.CELL_SIZE;
        const padding = WORD2048_CONFIG.CELL_PADDING;
        const boardSize = size * cellSize + (size + 1) * padding;
        
        this.canvas.width = boardSize;
        this.canvas.height = boardSize + 100; // Дополнительное место для информации
        
        this.cellSize = cellSize;
        this.padding = padding;
    }
    
    render(board, gameState, targetWord, moves) {
        // Очищаем canvas
        this.ctx.fillStyle = WORD2048_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем информацию
        this.drawInfo(targetWord, moves, gameState);
        
        // Рисуем доску
        this.drawBoard(board);
        
        // Рисуем сообщения о состоянии игры
        if (gameState === 'won') {
            this.drawWinOverlay();
        }
    }
    
    drawInfo(targetWord, moves, gameState) {
        const y = 20;
        
        // Целевое слово
        this.ctx.fillStyle = WORD2048_CONFIG.COLORS.TEXT_PRIMARY;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Соберите слово: ${targetWord}`, this.canvas.width / 2, y);
        
        // Количество ходов
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Ходов: ${moves}`, this.canvas.width / 2, y + 30);
        
        // Инструкции
        if (gameState === 'playing') {
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = WORD2048_CONFIG.COLORS.TEXT_PRIMARY;
            this.ctx.fillText('Используйте стрелки или WASD для перемещения букв', this.canvas.width / 2, y + 55);
        }
    }
    
    drawBoard(board) {
        const size = board.size;
        const startY = 100;
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cellX = x * this.cellSize + (x + 1) * this.padding;
                const cellY = startY + y * this.cellSize + (y + 1) * this.padding;
                
                const letter = board.getCell(x, y);
                
                // Рисуем фон клетки
                this.ctx.fillStyle = letter 
                    ? WORD2048_CONFIG.COLORS.CELL_BACKGROUND 
                    : WORD2048_CONFIG.COLORS.CELL_EMPTY;
                this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Рисуем рамку
                this.ctx.strokeStyle = WORD2048_CONFIG.COLORS.GRID_LINES;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Рисуем букву
                if (letter) {
                    this.ctx.fillStyle = WORD2048_CONFIG.COLORS.CELL_LETTER;
                    this.ctx.font = `bold ${this.cellSize * 0.5}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        letter,
                        cellX + this.cellSize / 2,
                        cellY + this.cellSize / 2
                    );
                }
            }
        }
    }
    
    drawWinOverlay() {
        // Полупрозрачный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Сообщение о победе
        this.ctx.fillStyle = WORD2048_CONFIG.COLORS.SUCCESS;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            '🎉 Победа!',
            this.canvas.width / 2,
            this.canvas.height / 2 - 30
        );
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(
            'Нажмите пробел для новой игры',
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );
    }
    
    showWinMessage(moves) {
        // Сообщение уже отображается в drawWinOverlay
        console.log(`Победа за ${moves} ходов!`);
    }
}
