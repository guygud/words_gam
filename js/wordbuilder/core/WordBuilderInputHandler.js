import { WORD_BUILDER_CONFIG } from '../config.js';

export class WordBuilderInputHandler {
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.renderer.lettersContainer.addEventListener('click', (e) => {
            const tile = e.target.closest('.letter-tile');
            if (!tile) return;

            const index = parseInt(tile.dataset.index);
            if (this.game.addLetter(index)) {
                this.updateDisplay();
            }
        });

        this.renderer.wordDisplay.addEventListener('click', (e) => {
            const letterEl = e.target.closest('.word-letter');
            if (!letterEl) return;

            const index = parseInt(letterEl.dataset.index);
            if (this.game.removeLetter(index)) {
                this.updateDisplay();
            }
        });

        this.renderer.submitBtn.addEventListener('click', () => {
            this.submitWord();
        });

        this.renderer.clearBtn.addEventListener('click', () => {
            this.game.clearWord();
            this.updateDisplay();
        });

        const newSetBtn = document.getElementById('newSetBtn');
        if (newSetBtn) {
            newSetBtn.addEventListener('click', () => {
                this.game.generateNewSet();
                this.updateDisplay();
                this.renderer.showMessage('Новый набор букв сгенерирован!', 'success');
            });
        }

        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            this.submitWord();
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            this.game.clearWord();
            this.updateDisplay();
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            const word = this.game.currentWord;
            if (word.length > 0) {
                this.game.removeLetter(word.length - 1);
            }
            this.updateDisplay();
            return;
        }

        const key = e.key.toLowerCase();
        if (/[а-яё]/.test(key)) {
            const state = this.game.getState();
            for (let i = 0; i < state.letters.length; i++) {
                if (state.letters[i].toLowerCase() === key) {
                    this.game.addLetter(i);
                    this.updateDisplay();
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

    updateDisplay() {
        const state = this.game.getState();

        this.renderer.renderLetters(state.letters, state.goldenLetter);
        this.renderer.renderCurrentWord(state.currentWord);
        this.renderer.renderCoins(state.coins);
        this.renderer.renderWordCount(state.foundWords.length, state.totalValidWords);
        this.renderer.renderFoundWords(state.foundWords, WORD_BUILDER_CONFIG);
        this.renderer.renderAllValidWords(state.allValidWords, state.foundWords, WORD_BUILDER_CONFIG);
    }
}
