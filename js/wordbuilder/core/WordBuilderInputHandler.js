export class WordBuilderInputHandler {
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Клики по буквам для добавления в слово
        this.renderer.lettersContainer.addEventListener('click', (e) => {
            const tile = e.target.closest('.letter-tile');
            if (!tile || tile.classList.contains('used')) return;
            
            const index = parseInt(tile.dataset.index);
            if (this.game.addLetter(index)) {
                this.updateDisplay();
            }
        });
        
        // Клики по буквам в слове для удаления
        this.renderer.wordDisplay.addEventListener('click', (e) => {
            const letterEl = e.target.closest('.word-letter');
            if (!letterEl) return;
            
            const index = parseInt(letterEl.dataset.index);
            if (this.game.removeLetter(index)) {
                this.updateDisplay();
            }
        });
        
        // Кнопка "Найти слово"
        this.renderer.submitBtn.addEventListener('click', () => {
            this.submitWord();
        });
        
        // Кнопка "Очистить"
        this.renderer.clearBtn.addEventListener('click', () => {
            this.game.clearWord();
            this.updateDisplay();
        });
        
        // Кнопка "Новый набор"
        const newSetBtn = document.getElementById('newSetBtn');
        if (newSetBtn) {
            newSetBtn.addEventListener('click', () => {
                this.game.generateNewSet();
                this.updateDisplay();
                this.renderer.showMessage('Новый набор букв сгенерирован!', 'success');
            });
        }
        
        // Ввод с клавиатуры
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    handleKeyboard(e) {
        // Если фокус на input или textarea, не обрабатываем
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Enter - отправить слово
        if (e.key === 'Enter') {
            e.preventDefault();
            this.submitWord();
            return;
        }
        
        // Escape или Backspace - очистить слово
        if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            this.game.clearWord();
            this.updateDisplay();
            return;
        }
        
        // Ввод букв - найти и добавить первую доступную букву
        const key = e.key.toLowerCase();
        if (/[а-яё]/.test(key)) {
            const state = this.game.getState();
            for (let i = 0; i < state.letters.length; i++) {
                if (state.letters[i].toLowerCase() === key && !state.usedLetters.includes(i)) {
                    if (this.game.addLetter(i)) {
                        this.updateDisplay();
                    }
                    break;
                }
            }
        }
    }
    
    submitWord() {
        const result = this.game.checkWord();
        
        if (result.valid) {
            this.renderer.showMessage(result.message, 'success');
            this.updateDisplay();
        } else {
            this.renderer.showMessage(result.error, 'error');
        }
    }
    
    async updateDisplay() {
        const state = this.game.getState();
        
        // Обновляем буквы
        this.renderer.renderLetters(
            state.letters,
            state.goldenLetter,
            new Set(state.usedLetters)
        );
        
        // Обновляем текущее слово
        this.renderer.renderCurrentWord(state.currentWord);
        
        // Обновляем монеты
        this.renderer.renderCoins(state.coins);
        
        // Обновляем найденные слова
        const { WORD_BUILDER_CONFIG } = await import('../config.js');
        this.renderer.renderFoundWords(state.foundWords, WORD_BUILDER_CONFIG);
    }
}
