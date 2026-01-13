import { PUZZLE_CONFIG } from '../../config-puzzle.js';

// Рендерер для игры-головоломки

export class PuzzleRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = PUZZLE_CONFIG.CELL_SIZE;
        this.highlightedCells = new Set();
    }
    
    // Очистка canvas
    clear() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Отрисовка сетки поля
    drawGrid(board) {
        const offset = 50; // Смещение для кнопок
        const offsetCells = offset / this.cellSize;
        
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 2;
        
        const size = board.size;
        for (let x = 0; x <= size; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo((x + offsetCells) * this.cellSize, offset);
            this.ctx.lineTo((x + offsetCells) * this.cellSize, offset + size * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= size; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offset, (y + offsetCells) * this.cellSize);
            this.ctx.lineTo(offset + size * this.cellSize, (y + offsetCells) * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    
    // Отрисовка подсветки найденных слов
    drawWordHighlights(wordMatches) {
        if (!wordMatches || wordMatches.length === 0) {
            this.highlightedCells = new Set();
            return;
        }
        
        const highlightedCells = new Set();
        
        for (const match of wordMatches) {
            if (match.isVertical) {
                const columnIndex = match.rowIndex;
                for (let y = match.startX; y <= match.endX; y++) {
                    highlightedCells.add(`${y},${columnIndex}`);
                }
            } else {
                const rowIndex = match.rowIndex;
                for (let x = match.startX; x <= match.endX; x++) {
                    highlightedCells.add(`${rowIndex},${x}`);
                }
            }
        }
        
        this.highlightedCells = highlightedCells;
    }
    
    // Отрисовка игрового поля
    drawBoard(board, lockedRows = new Set(), lockedColumns = new Set()) {
        const offset = 50; // Смещение для кнопок
        
        for (let y = 0; y < board.size; y++) {
            for (let x = 0; x < board.size; x++) {
                const cell = board.getCell(x, y);
                if (cell && cell.occupied) {
                    const isHighlighted = this.highlightedCells.has(`${y},${x}`);
                    const isLocked = lockedRows.has(y) || lockedColumns.has(x);
                    this.drawCell(x + offset / this.cellSize, y + offset / this.cellSize, cell.letter, isHighlighted, isLocked);
                }
            }
        }
    }
    
    // Отрисовка клетки с учетом смещения
    drawCell(x, y, letter, isHighlighted = false, isLocked = false) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        // Фон клетки
        if (isLocked) {
            // Зафиксированная клетка - темно-зеленый с рамкой
            this.ctx.fillStyle = '#2d5a2d';
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
        } else if (isHighlighted) {
            this.ctx.fillStyle = '#4CAF50'; // Зеленый для найденных слов
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
        } else {
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
        }
        
        // Буква
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${this.cellSize * 0.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            letter,
            pixelX + this.cellSize / 2,
            pixelY + this.cellSize / 2
        );
    }
    
    // Отрисовка кнопок управления рядом с каждой строкой и столбцом
    drawControls(lockedRows = new Set(), lockedColumns = new Set()) {
        const size = PUZZLE_CONFIG.BOARD_SIZE;
        const boardSize = size * this.cellSize;
        const buttonSize = 35;
        const spacing = 15;
        const offset = buttonSize + spacing; // Смещение для размещения кнопок
        
        // Кнопки для строк (слева и справа от каждой строки)
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < size; i++) {
            const y = offset + i * this.cellSize + this.cellSize / 2 - buttonSize / 2;
            const isLocked = lockedRows.has(i);
            
            // Цвет кнопки зависит от того, зафиксирована ли строка
            this.ctx.fillStyle = isLocked ? '#666' : '#667eea';
            
            // Кнопка влево (слева от поля)
            this.ctx.fillRect(0, y, buttonSize, buttonSize);
            this.ctx.strokeRect(0, y, buttonSize, buttonSize);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('←', buttonSize / 2, y + buttonSize / 2);
            
            // Кнопка вправо (справа от поля)
            this.ctx.fillStyle = isLocked ? '#666' : '#667eea';
            this.ctx.fillRect(boardSize + offset, y, buttonSize, buttonSize);
            this.ctx.strokeRect(boardSize + offset, y, buttonSize, buttonSize);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('→', boardSize + offset + buttonSize / 2, y + buttonSize / 2);
        }
        
        // Кнопки для столбцов (сверху и снизу от каждого столбца)
        for (let i = 0; i < size; i++) {
            const x = offset + i * this.cellSize + this.cellSize / 2 - buttonSize / 2;
            const isLocked = lockedColumns.has(i);
            
            // Цвет кнопки зависит от того, зафиксирован ли столбец
            this.ctx.fillStyle = isLocked ? '#666' : '#667eea';
            
            // Кнопка вверх (сверху от поля)
            this.ctx.fillRect(x, 0, buttonSize, buttonSize);
            this.ctx.strokeRect(x, 0, buttonSize, buttonSize);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('↑', x + buttonSize / 2, buttonSize / 2);
            
            // Кнопка вниз (снизу от поля)
            this.ctx.fillStyle = isLocked ? '#666' : '#667eea';
            this.ctx.fillRect(x, boardSize + offset, buttonSize, buttonSize);
            this.ctx.strokeRect(x, boardSize + offset, buttonSize, buttonSize);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('↓', x + buttonSize / 2, boardSize + offset + buttonSize / 2);
        }
    }
    
    // Проверка, попал ли клик по кнопке управления
    getControlAt(x, y) {
        const size = PUZZLE_CONFIG.BOARD_SIZE;
        const boardSize = size * this.cellSize;
        const buttonSize = 35;
        const spacing = 15;
        const offset = buttonSize + spacing; // Смещение для кнопок
        
        // Проверяем кнопки строк (слева и справа)
        for (let i = 0; i < size; i++) {
            const buttonY = offset + i * this.cellSize + this.cellSize / 2 - buttonSize / 2;
            
            // Кнопка влево (слева от поля)
            if (x >= 0 && x <= buttonSize &&
                y >= buttonY && y <= buttonY + buttonSize) {
                return { type: 'row', index: i, direction: 'left' };
            }
            
            // Кнопка вправо (справа от поля)
            if (x >= boardSize + offset && x <= boardSize + offset + buttonSize &&
                y >= buttonY && y <= buttonY + buttonSize) {
                return { type: 'row', index: i, direction: 'right' };
            }
        }
        
        // Проверяем кнопки столбцов (сверху и снизу)
        for (let i = 0; i < size; i++) {
            const buttonX = offset + i * this.cellSize + this.cellSize / 2 - buttonSize / 2;
            
            // Кнопка вверх (сверху от поля)
            if (x >= buttonX && x <= buttonX + buttonSize &&
                y >= 0 && y <= buttonSize) {
                return { type: 'column', index: i, direction: 'up' };
            }
            
            // Кнопка вниз (снизу от поля)
            if (x >= buttonX && x <= buttonX + buttonSize &&
                y >= boardSize + offset && y <= boardSize + offset + buttonSize) {
                return { type: 'column', index: i, direction: 'down' };
            }
        }
        
        return null;
    }
    
    // Отрисовка всего игрового состояния
    render(board, wordMatches = [], moves = 0, gameState = 'playing', targetWords = [], foundTargetWords = [], lockedRows = new Set(), lockedColumns = new Set()) {
        this.clear();
        
        // Рисуем кнопки управления только в режиме игры
        if (gameState === 'playing' || gameState === 'completed') {
            this.drawControls(lockedRows, lockedColumns);
        }
        
        // Затем сетку и поле
        this.drawGrid(board);
        
        // Подсвечиваем найденные слова
        this.drawWordHighlights(wordMatches);
        
        this.drawBoard(board, lockedRows, lockedColumns);
        
        // Обновляем UI
        this.updateUI(moves, wordMatches.length, targetWords, foundTargetWords);
    }
    
    // Показ сообщения о победе
    showWinMessage(moves) {
        const winPanel = document.getElementById('win-message');
        if (winPanel) {
            winPanel.style.display = 'block';
            winPanel.innerHTML = `
                <h2>🎉 Поздравляем!</h2>
                <p>Все слова собраны за ${moves} ходов!</p>
                <button onclick="location.reload()">Новая игра</button>
            `;
        }
    }
    
    // Обновление UI элементов
    updateUI(moves, wordsFound, targetWords = [], foundTargetWords = []) {
        const movesElement = document.getElementById('moves');
        const wordsElement = document.getElementById('words-found');
        const wordsListElement = document.getElementById('words-list');
        
        if (movesElement) {
            movesElement.textContent = moves;
        }
        
        if (wordsElement) {
            wordsElement.textContent = `${foundTargetWords.length} / ${targetWords.length}`;
        }
        
        // Обновляем список слов с отметками о собранных
        if (wordsListElement && targetWords.length > 0) {
            wordsListElement.innerHTML = '';
            for (const word of targetWords) {
                const wordDiv = document.createElement('div');
                wordDiv.style.padding = '5px';
                wordDiv.style.margin = '2px';
                wordDiv.style.borderRadius = '3px';
                
                const isFound = foundTargetWords.includes(word.toUpperCase());
                if (isFound) {
                    wordDiv.style.background = '#4CAF50';
                    wordDiv.style.color = 'white';
                    wordDiv.textContent = `✓ ${word}`;
                } else {
                    wordDiv.style.background = '#f0f0f0';
                    wordDiv.style.color = '#333';
                    wordDiv.textContent = word;
                }
                wordsListElement.appendChild(wordDiv);
            }
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
