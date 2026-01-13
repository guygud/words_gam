// Обработчик ввода для игры 2048 со словами

export class InputHandler2048 {
    constructor(game) {
        this.game = game;
        this.touchStartX = null;
        this.touchStartY = null;
        this.minSwipeDistance = 30;
        
        this.setupKeyboard();
        this.setupTouch();
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.game.gameState === 'won' && e.code === 'Space') {
                e.preventDefault();
                this.game.startNewGame();
                return;
            }
            
            if (this.game.gameState !== 'playing') {
                return;
            }
            
            let direction = null;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'right';
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'down';
                    break;
            }
            
            if (direction) {
                e.preventDefault();
                this.game.move(direction);
            }
        });
    }
    
    setupTouch() {
        const canvas = this.game.renderer.canvas;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            if (this.touchStartX === null || this.touchStartY === null) {
                return;
            }
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            if (absDeltaX < this.minSwipeDistance && absDeltaY < this.minSwipeDistance) {
                return;
            }
            
            let direction = null;
            
            if (absDeltaX > absDeltaY) {
                // Горизонтальный свайп
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                // Вертикальный свайп
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            if (direction) {
                this.game.move(direction);
            }
            
            this.touchStartX = null;
            this.touchStartY = null;
        });
    }
}
