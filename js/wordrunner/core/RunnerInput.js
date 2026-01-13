// Обработчик ввода для раннера с буквами

export class RunnerInput {
    constructor(game) {
        this.game = game;
        this.keys = {
            left: false,
            right: false
        };
        
        this.setupKeyboard();
        this.setupTouch();
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.game.gameState === 'won' && e.key.toLowerCase() === 'r') {
                this.game.restart();
                return;
            }
            
            if (this.game.gameState !== 'playing') {
                return;
            }
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.keys.left = true;
                    this.game.moveLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.keys.right = true;
                    this.game.moveRight();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = false;
                    break;
            }
        });
    }
    
    setupTouch() {
        const canvas = this.game.renderer.canvas;
        let touchStartX = null;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            if (touchStartX === null) {
                return;
            }
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const minSwipe = 50;
            
            if (Math.abs(deltaX) > minSwipe) {
                if (deltaX > 0) {
                    this.game.moveRight();
                } else {
                    this.game.moveLeft();
                }
            }
            
            touchStartX = null;
        });
    }
}
