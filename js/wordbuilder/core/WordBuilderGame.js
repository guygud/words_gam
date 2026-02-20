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

        let bestCandidate = null;
        let bestCount = 0;

        for (let attempt = 0; attempt < WORD_BUILDER_CONFIG.MAX_GENERATION_ATTEMPTS; attempt++) {
            const candidate = this._sampleLetters(letters, frequencies);

            if (!this.wordIndex) {
                // Без индекса — просто берём первый набор
                this.currentLetters = candidate;
                break;
            }

            const count = this.wordIndex.countForSet(candidate, minLen);

            if (count >= WORD_BUILDER_CONFIG.MIN_VALID_WORDS &&
                count <= WORD_BUILDER_CONFIG.MAX_VALID_WORDS) {
                this.currentLetters = candidate;
                break;
            }

            // Запоминаем лучшего кандидата на случай, если лимит попыток исчерпан
            if (bestCandidate === null || Math.abs(count - 20) < Math.abs(bestCount - 20)) {
                bestCandidate = candidate;
                bestCount = count;
            }

            if (attempt === WORD_BUILDER_CONFIG.MAX_GENERATION_ATTEMPTS - 1) {
                this.currentLetters = bestCandidate;
            }
        }

        this._pickGoldenLetter();

        this.currentWord = [];
        this.foundWords = new Set();
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
        const counts = this.wordIndex.countPerGolden(this.currentLetters, minLen);

        let bestLetter = this.currentLetters[0];
        let bestCount = 0;

        for (const [letter, count] of counts) {
            if (count > bestCount) {
                bestCount = count;
                bestLetter = letter;
            }
        }

        this.goldenLetter = bestLetter;
        this.totalValidWords = bestCount;
        this.allValidWords = this.wordIndex.getValidWords(
            this.currentLetters, bestLetter, minLen
        );
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
