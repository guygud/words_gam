import { WORD_BUILDER_CONFIG } from '../config.js';

export class WordBuilderGame {
    constructor(dictionaryService) {
        this.dictionaryService = dictionaryService;
        this.currentLetters = [];
        this.goldenLetter = null;
        this.currentWord = [];
        this.foundWords = new Set(); // Множество найденных слов
        this.coins = 0;
        this.usedLetters = new Set(); // Индексы использованных букв в текущем слове
        
        this.generateNewSet();
    }
    
    // Генерация нового набора букв
    generateNewSet() {
        const letters = Object.keys(WORD_BUILDER_CONFIG.LETTER_FREQUENCIES);
        const frequencies = Object.values(WORD_BUILDER_CONFIG.LETTER_FREQUENCIES);
        
        // Нормализуем частоты
        const total = frequencies.reduce((sum, f) => sum + f, 0);
        const normalized = frequencies.map(f => f / total);
        
        // Создаем кумулятивный массив для выборки
        const cumulative = [];
        let sum = 0;
        for (const freq of normalized) {
            sum += freq;
            cumulative.push(sum);
        }
        
        // Выбираем 7 разных букв без возвращения
        const selected = [];
        const available = letters.slice();
        const availableFreqs = normalized.slice();
        
        for (let i = 0; i < WORD_BUILDER_CONFIG.LETTERS_COUNT && available.length > 0; i++) {
            // Вычисляем общую сумму оставшихся частот
            let totalFreq = 0;
            for (const f of availableFreqs) totalFreq += f;
            
            // Выбираем случайную букву с учетом частот
            const r = Math.random() * totalFreq;
            let cum = 0;
            let idx = 0;
            
            for (let j = 0; j < available.length; j++) {
                cum += availableFreqs[j];
                if (r < cum) {
                    idx = j;
                    break;
                }
            }
            
            selected.push(available[idx]);
            available.splice(idx, 1);
            availableFreqs.splice(idx, 1);
        }
        
        this.currentLetters = selected;
        // Золотая буква - случайная из набора
        this.goldenLetter = this.currentLetters[Math.floor(Math.random() * this.currentLetters.length)];
        this.currentWord = [];
        this.usedLetters.clear();
    }
    
    // Добавить букву в текущее слово
    addLetter(letterIndex) {
        if (this.usedLetters.has(letterIndex)) {
            return false; // Буква уже использована
        }
        
        const letter = this.currentLetters[letterIndex];
        this.currentWord.push({ letter, index: letterIndex });
        this.usedLetters.add(letterIndex);
        return true;
    }
    
    // Удалить букву из текущего слова
    removeLetter(wordIndex) {
        if (wordIndex < 0 || wordIndex >= this.currentWord.length) {
            return false;
        }
        
        const { index } = this.currentWord[wordIndex];
        this.usedLetters.delete(index);
        this.currentWord.splice(wordIndex, 1);
        return true;
    }
    
    // Очистить текущее слово
    clearWord() {
        this.currentWord = [];
        this.usedLetters.clear();
    }
    
    // Получить текущее слово как строку
    getCurrentWordString() {
        return this.currentWord.map(w => w.letter).join('');
    }
    
    // Проверить слово
    checkWord() {
        const word = this.getCurrentWordString().toLowerCase();
        
        // Проверка минимальной длины
        if (word.length < WORD_BUILDER_CONFIG.MIN_WORD_LENGTH) {
            return { valid: false, error: `Слово должно быть не менее ${WORD_BUILDER_CONFIG.MIN_WORD_LENGTH} букв` };
        }
        
        // Проверка наличия золотой буквы
        if (!word.includes(this.goldenLetter.toLowerCase())) {
            return { valid: false, error: 'Слово должно содержать золотую букву!' };
        }
        
        // Проверка, что слово есть в словаре
        if (!this.dictionaryService.isWord(word)) {
            return { valid: false, error: 'Такого слова нет в словаре' };
        }
        
        // Проверка, что слово еще не было найдено
        if (this.foundWords.has(word)) {
            return { valid: false, error: 'Это слово уже было найдено' };
        }
        
        // Вычисляем награду
        const coins = WORD_BUILDER_CONFIG.getCoinsForWord(word.length);
        
        // Добавляем слово в найденные
        this.foundWords.add(word);
        this.coins += coins;
        
        // Очищаем текущее слово
        this.clearWord();
        
        return {
            valid: true,
            word: word,
            coins: coins,
            message: `Найдено слово "${word.toUpperCase()}"! +${coins} монет`
        };
    }
    
    // Получить состояние игры
    getState() {
        return {
            letters: this.currentLetters,
            goldenLetter: this.goldenLetter,
            currentWord: this.currentWord,
            foundWords: Array.from(this.foundWords),
            coins: this.coins,
            usedLetters: Array.from(this.usedLetters)
        };
    }
}
