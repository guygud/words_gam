// Обработчик ввода с клавиатуры

export class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            down: false,
            rotate: false
        };
        
        this.setupEventListeners();
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }
    
    // Обработка нажатия клавиши
    handleKeyDown(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.keys.left = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.keys.right = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
                this.keys.down = true;
                e.preventDefault();
                break;
            case 'Space':
                this.keys.rotate = true;
                e.preventDefault();
                break;
        }
    }
    
    // Обработка отпускания клавиши
    handleKeyUp(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'Space':
                this.keys.rotate = false;
                break;
        }
    }
    
    // Получить состояние клавиш
    getKeys() {
        return { ...this.keys };
    }
    
    // Сброс состояния клавиш
    reset() {
        this.keys = {
            left: false,
            right: false,
            down: false,
            rotate: false
        };
    }
}
