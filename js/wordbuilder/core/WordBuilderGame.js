import { WORD_BUILDER_CONFIG } from '../config.js';

export class WordBuilderGame {
    constructor(dictionaryService, wordIndex) {
        this.dictionaryService = dictionaryService;
        this.wordIndex = wordIndex;
        this.currentLetters = [];
        this.goldenLetter = null;
        this.currentWord = [];
        this.foundWords = new Set();
        this.coins = 0;
        this.totalValidWords = 0;
        this.allValidWords = [];

        this.generateNewSet();
    }

    generateNewSet() {
        const letters = Object.keys(WORD_BUILDER_CONFIG.LETTER_FREQUENCIES);
        const frequencies = Object.values(WORD_BUILDER_CONFIG.LETTER_FREQUENCIES);
        const minLen = WORD_BUILDER_CONFIG.MIN_WORD_LENGTH;
        const minFreq = WORD_BUILDER_CONFIG.MIN_FREQUENT_WORDS;
        const minLong = WORD_BUILDER_CONFIG.MIN_FREQUENT_LONG;
        const longLen = WORD_BUILDER_CONFIG.MIN_LONG_WORD_LENGTH;

        let bestCandidate = null;
        let bestScore = -Infinity;

        for (let attempt = 0; attempt < WORD_BUILDER_CONFIG.MAX_GENERATION_ATTEMPTS; attempt++) {
            const candidate = this._sampleLetters(letters, frequencies);

            if (!this.wordIndex) {
                this.currentLetters = candidate;
                break;
            }

            const count = this.wordIndex.countForSet(candidate, minLen);
            if (count < WORD_BUILDER_CONFIG.MIN_VALID_WORDS ||
                count > WORD_BUILDER_CONFIG.MAX_VALID_WORDS) {
                const score = -Math.abs(count - 20);
                if (score > bestScore) { bestCandidate = candidate; bestScore = score; }
                continue;
            }

            const golden = this._bestGoldenFor(candidate, minLen);
            const { total: freqCount, longCount } = this.wordIndex.countFrequentForSet(
                candidate, golden, minLen, longLen
            );
            if (freqCount >= minFreq && longCount >= minLong) {
                this.currentLetters = candidate;
                break;
            }

            const score = freqCount + longCount * 10;
            if (score > bestScore) { bestCandidate = candidate; bestScore = score; }

            if (attempt === WORD_BUILDER_CONFIG.MAX_GENERATION_ATTEMPTS - 1) {
                this.currentLetters = bestCandidate;
            }
        }

        this._pickGoldenLetter();

        this.currentWord = [];
        this.foundWords = new Set();
    }

    _bestGoldenFor(letters, minLen) {
        const counts = this.wordIndex.countPerGolden(letters, minLen);
        let best = letters[0], bestCount = 0;
        for (const [letter, count] of counts) {
            if (count > bestCount) { bestCount = count; best = letter; }
        }
        return best;
    }

    _sampleLetters(letters, frequencies) {
        const available = letters.slice();
        const weights = frequencies.slice();
        const selected = [];

        for (let i = 0; i < WORD_BUILDER_CONFIG.LETTERS_COUNT && available.length > 0; i++) {
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
        if (!this.wordIndex) {
            this.goldenLetter = this.currentLetters[
                Math.floor(Math.random() * this.currentLetters.length)
            ];
            this.totalValidWords = 0;
            this.allValidWords = [];
            return;
        }

        const minLen = WORD_BUILDER_CONFIG.MIN_WORD_LENGTH;
        this.goldenLetter = this._bestGoldenFor(this.currentLetters, minLen);

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
            return { valid: false, error: 'Слово должно содержать золотую букву!' };
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
            goldenLetter: this.goldenLetter,
            currentWord: this.currentWord,
            foundWords: Array.from(this.foundWords),
            coins: this.coins,
            totalValidWords: this.totalValidWords,
            allValidWords: this.allValidWords
        };
    }
}
