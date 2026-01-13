// Обработчик ввода для игры-головоломки

export class PuzzleInputHandler {
    constructor(game) {
        this.game = game;
        this.selectedIndex = undefined;
        this.selectedType = null;
        this.setupEventListeners();
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Обработка кликов по canvas для вращения
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                this.handleCanvasClick(e, canvas);
            });
        }
    }
    
    // Обработка нажатия клавиши
    handleKeyDown(e) {
        const size = 5;
        
        // Упрощенное управление: цифры 1-5 для выбора строки/столбца
        // Затем Q/A для строк, W/S для столбцов
        
        if (e.key >= '1' && e.key <= '5') {
            const index = parseInt(e.key) - 1;
            this.selectedIndex = index;
            e.preventDefault();
            return;
        }
        
        // Если выбрана строка/столбец
        if (this.selectedIndex !== undefined && this.selectedIndex >= 0 && this.selectedIndex < size) {
            if (e.key === 'q' || e.key === 'Q') {
                this.game.rotateRowLeft(this.selectedIndex);
                this.selectedIndex = undefined;
                e.preventDefault();
                return;
            }
            
            if (e.key === 'a' || e.key === 'A') {
                this.game.rotateRowRight(this.selectedIndex);
                this.selectedIndex = undefined;
                e.preventDefault();
                return;
            }
            
            if (e.key === 'w' || e.key === 'W') {
                this.game.rotateColumnUp(this.selectedIndex);
                this.selectedIndex = undefined;
                e.preventDefault();
                return;
            }
            
            if (e.key === 's' || e.key === 'S') {
                this.game.rotateColumnDown(this.selectedIndex);
                this.selectedIndex = undefined;
                e.preventDefault();
                return;
            }
        }
    }
    
    // Обработка клика по canvas
    handleCanvasClick(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Используем метод рендерера для определения, по какой кнопке кликнули
        const control = this.game.renderer.getControlAt(x, y);
        
        if (control) {
            // Проверяем, не зафиксированы ли ряд/столбец
            if (control.type === 'row') {
                if (this.game.lockedRows.has(control.index)) {
                    return; // Ряд зафиксирован, не вращаем
                }
                if (control.direction === 'left') {
                    this.game.rotateRowLeft(control.index);
                } else if (control.direction === 'right') {
                    this.game.rotateRowRight(control.index);
                }
            } else if (control.type === 'column') {
                if (this.game.lockedColumns.has(control.index)) {
                    return; // Столбец зафиксирован, не вращаем
                }
                if (control.direction === 'up') {
                    this.game.rotateColumnUp(control.index);
                } else if (control.direction === 'down') {
                    this.game.rotateColumnDown(control.index);
                }
            }
        }
    }
    
    // Получить выбранную строку (пока упрощенная версия)
    getSelectedRow() {
        // Можно добавить визуальный выбор строки
        return null; // Пока возвращаем null, используем прямые команды
    }
    
    // Получить выбранный столбец
    getSelectedColumn() {
        return null;
    }
}
