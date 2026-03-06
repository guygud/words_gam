import { WORD_BUILDER_CONFIG } from '../config.js';

const STORAGE_DAY_OFFSET = 'wordbuilder_dayOffset';

export class WordBuilderGame {
    constructor(dictionaryService, wordIndex) {
        this.dictionaryService = dictionaryService;
        this.wordIndex = wordIndex;
        this.dayOffset = parseInt(sessionStorage.getItem(STORAGE_DAY_OFFSET) || '0', 10);
        this.letterOfDay = WORD_BUILDER_CONFIG.getLetterOfDay(this.dayOffset);
        this.aroundLetters = [];
        this.currentLetters = [];
        this.goldenLetter = this.letterOfDay;
        this.currentWord = [];
        this.foundWords = new Set();
        this.coins = 0;
        this.energy = WORD_BUILDER_CONFIG.ENERGY_START;
        this.lettersVisible = false;
        this.totalValidWords = 0;
        this.allValidWords = [];

        this._generateAroundLetters();
    }

    changeDay() {
        this.dayOffset++;
        sessionStorage.setItem(STORAGE_DAY_OFFSET, String(this.dayOffset));
        this.letterOfDay = WORD_BUILDER_CONFIG.getLetterOfDay(this.dayOffset);
        this.coins = 0;
        this.energy = WORD_BUILDER_CONFIG.ENERGY_START;
        this.foundWords = new Set();
        this.lettersVisible = false;
        this._generateAroundLetters();
    }

    revealOrChangeLettersForEnergy() {
        const cost = WORD_BUILDER_CONFIG.ENERGY_CHANGE_LETTERS;
        if (this.energy < cost) return null;
        this.energy -= cost;
        if (this.lettersVisible) {
            this._generateAroundLetters();
            return 'changed';
        } else {
            this.lettersVisible = true;
            return 'revealed';
        }
    }

    _generateAroundLetters() {
        const entries = Object.entries(WORD_BUILDER_CONFIG.LETTER_FREQUENCIES)
            .filter(([l]) => l !== this.letterOfDay);
        const letters = entries.map(([l]) => l);
        const frequencies = entries.map(([, f]) => f);
        const minLen = WORD_BUILDER_CONFIG.MIN_WORD_LENGTH;
        const minFreq = WORD_BUILDER_CONFIG.MIN_FREQUENT_WORDS;
        const minLong = WORD_BUILDER_CONFIG.MIN_FREQUENT_LONG;
        const longLen = WORD_BUILDER_CONFIG.MIN_LONG_WORD_LENGTH;

        let bestCandidate = null;
        let bestScore = -Infinity;

        for (let attempt = 0; attempt < WORD_BUILDER_CONFIG.MAX_GENERATION_ATTEMPTS; attempt++) {
            const candidate = this._sampleLetters(letters, frequencies);

            if (!this.wordIndex) {
                this.aroundLetters = candidate;
                break;
            }

            this.aroundLetters = candidate;
            this._rebuildCurrentLetters();
            const count = this.wordIndex.countForSetWithGolden(
                this.currentLetters, this.letterOfDay, minLen
            );

            const { total: freqCount, longCount } = this.wordIndex.countFrequentForSet(
                this.currentLetters, this.letterOfDay, minLen, longLen
            );

            const score = freqCount * 3 + longCount * 10 - Math.abs(count - 25);

            if (count < 3) {
                if (score > bestScore) { bestCandidate = [...candidate]; bestScore = score; }
                continue;
            }

            if (count >= WORD_BUILDER_CONFIG.MIN_VALID_WORDS &&
                count <= WORD_BUILDER_CONFIG.MAX_VALID_WORDS &&
                freqCount >= minFreq && longCount >= minLong) {
                this.aroundLetters = candidate;
                break;
            }
            if (score > bestScore) { bestCandidate = [...candidate]; bestScore = score; }

            if (attempt === WORD_BUILDER_CONFIG.MAX_GENERATION_ATTEMPTS - 1 && bestCandidate) {
                this.aroundLetters = bestCandidate;
            }
        }

        if (!bestCandidate && !this.aroundLetters.length) {
            this.aroundLetters = this._sampleLetters(letters, frequencies);
        }

        this._rebuildCurrentLetters();
        this._pickGoldenLetter();
        this.currentWord = [];
    }

    _rebuildCurrentLetters() {
        this.currentLetters = [this.letterOfDay, ...this.aroundLetters];
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
            lettersVisible: this.lettersVisible,
            totalValidWords: this.totalValidWords,
            allValidWords: this.allValidWords
        };
    }
}
