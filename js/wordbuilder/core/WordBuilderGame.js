import { WORD_BUILDER_CONFIG } from '../config.js';

export class WordBuilderGame {
    constructor(dictionaryService, wordIndex) {
        this.dictionaryService = dictionaryService;
        this.wordIndex = wordIndex;
        this.letterOfDay = WORD_BUILDER_CONFIG.getLetterOfDay();
        this.aroundLetters = [];
        this.currentLetters = [];
        this.goldenLetter = this.letterOfDay;
        this.currentWord = [];
        this.foundWords = new Set();
        this.coins = 0;
        this.energy = WORD_BUILDER_CONFIG.ENERGY_START;
        this.totalValidWords = 0;
        this.allValidWords = [];

        this._generateAroundLetters();
    }

    _generateAroundLetters() {
        const entries = Object.entries(WORD_BUILDER_CONFIG.LETTER_FREQUENCIES)
            .filter(([l]) => l !== this.letterOfDay);
        this.aroundLetters = this._sampleLetters(
            entries.map(([l]) => l),
            entries.map(([, f]) => f)
        );
        this._rebuildCurrentLetters();
        this._pickGoldenLetter();
        this.currentWord = [];
    }

    _rebuildCurrentLetters() {
        this.currentLetters = [this.letterOfDay, ...this.aroundLetters];
    }

    changeLettersForEnergy() {
        const cost = WORD_BUILDER_CONFIG.ENERGY_CHANGE_LETTERS;
        if (this.energy < cost) return false;
        this.energy -= cost;
        this._generateAroundLetters();
        return true;
    }

    _sampleLetters(letters, frequencies) {
        const available = letters.slice();
        const weights = [...frequencies];
        const selected = [];

        for (let i = 0; i < 6 && available.length > 0; i++) {
            let totalFreq = 0;
            for (const f of weights) totalFreq += f;

            const r = Math.random() * totalFreq;
            let cum = 0;

            for (let j = 0; j < available.length; j++) {
                cum += weights[j];
                if (r < cum) {
                    selected.push(available[j]);
                    available.splice(j, 1);
                    weights.splice(j, 1);
                    break;
                }
            }
        }

        return selected;
    }

    _pickGoldenLetter() {
        this.goldenLetter = this.letterOfDay;
        if (!this.wordIndex) {
            this.totalValidWords = 0;
            this.allValidWords = [];
            return;
        }
        const minLen = WORD_BUILDER_CONFIG.MIN_WORD_LENGTH;
        const entries = this.wordIndex.getValidWords(
            this.currentLetters, this.goldenLetter, minLen
        );
        this.totalValidWords = entries.length;
        this.allValidWords = entries;
    }

    // Буквы можно использовать повторно — просто добавляем букву в слово
    addLetter(letterIndex) {
        const letter = this.currentLetters[letterIndex];
        this.currentWord.push({ letter, index: letterIndex });
        return true;
    }

    removeLetter(wordIndex) {
        if (wordIndex < 0 || wordIndex >= this.currentWord.length) {
            return false;
        }
        this.currentWord.splice(wordIndex, 1);
        return true;
    }

    clearWord() {
        this.currentWord = [];
    }

    getCurrentWordString() {
        return this.currentWord.map(w => w.letter).join('');
    }

    checkWord() {
        const word = this.getCurrentWordString().toLowerCase();

        if (word.length < WORD_BUILDER_CONFIG.MIN_WORD_LENGTH) {
            return { valid: false, error: `Слово должно быть не менее ${WORD_BUILDER_CONFIG.MIN_WORD_LENGTH} букв` };
        }

        if (!word.includes(this.goldenLetter.toLowerCase())) {
            return { valid: false, error: 'Слово должно содержать букву дня!' };
        }

        // Битмаск-проверка: все уникальные буквы слова должны быть в наборе
        if (this.wordIndex && !this.wordIndex.isWordFromSet(word, this.currentLetters)) {
            return { valid: false, error: 'Слово содержит буквы не из набора' };
        }

        if (!this.dictionaryService.isWord(word)) {
            return { valid: false, error: 'Такого слова нет в словаре' };
        }

        if (this.foundWords.has(word)) {
            return { valid: false, error: 'Это слово уже было найдено' };
        }

        const coins = WORD_BUILDER_CONFIG.getCoinsForWord(word.length);
        this.foundWords.add(word);
        this.coins += coins;
        this.clearWord();

        return {
            valid: true,
            word: word,
            coins: coins,
            message: `"${word.toUpperCase()}" +${coins} монет`
        };
    }

    getState() {
        return {
            letters: this.currentLetters,
            letterOfDay: this.letterOfDay,
            goldenLetter: this.goldenLetter,
            aroundLetters: this.aroundLetters,
            currentWord: this.currentWord,
            foundWords: Array.from(this.foundWords),
            coins: this.coins,
            energy: this.energy,
            totalValidWords: this.totalValidWords,
            allValidWords: this.allValidWords
        };
    }
}
