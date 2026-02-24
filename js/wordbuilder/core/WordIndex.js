const RUSSIAN_LETTERS = 'абвгдежзийклмнопрстуфхцчшщъыьэюяё';

const LETTER_BIT = {};
for (let i = 0; i < RUSSIAN_LETTERS.length; i++) {
    LETTER_BIT[RUSSIAN_LETTERS[i]] = i;
}

function charMask(str) {
    let mask = 0;
    for (const ch of str) {
        const bit = LETTER_BIT[ch];
        if (bit !== undefined) mask |= (1 << bit);
    }
    return mask;
}

export class WordIndex {
    constructor(words, freqSet = null) {
        this.words = words;
        this.freqSet = freqSet;
        this.masks = new Int32Array(words.length);
        this.lengths = new Uint8Array(words.length);
        this.isFreq = new Uint8Array(words.length);

        for (let i = 0; i < words.length; i++) {
            this.masks[i] = charMask(words[i]);
            this.lengths[i] = Math.min(words[i].length, 21);
            this.isFreq[i] = freqSet && freqSet.has(words[i]) ? 1 : 0;
        }
    }

    // Посчитать количество слов, составимых из набора букв (без ограничения на золотую)
    countForSet(letters, minLen) {
        const setMask = charMask(letters.join(''));
        const invMask = ~setMask;
        let total = 0;

        for (let i = 0, len = this.masks.length; i < len; i++) {
            if (this.lengths[i] < minLen) continue;
            if ((this.masks[i] & invMask) !== 0) continue;
            total++;
        }
        return total;
    }

    // Посчитать количество слов с учётом золотой буквы
    countForSetWithGolden(letters, golden, minLen) {
        const setMask = charMask(letters.join(''));
        const goldenBit = 1 << LETTER_BIT[golden];
        const invMask = ~setMask;
        let total = 0;

        for (let i = 0, len = this.masks.length; i < len; i++) {
            if (this.lengths[i] < minLen) continue;
            if ((this.masks[i] & goldenBit) === 0) continue;
            if ((this.masks[i] & invMask) !== 0) continue;
            total++;
        }
        return total;
    }

    // Для каждой буквы набора посчитать, сколько слов она даёт как золотая
    countPerGolden(letters, minLen) {
        const setMask = charMask(letters.join(''));
        const invMask = ~setMask;

        const counts = new Map();
        for (const letter of letters) {
            counts.set(letter, 0);
        }

        for (let i = 0, len = this.masks.length; i < len; i++) {
            if (this.lengths[i] < minLen) continue;
            if ((this.masks[i] & invMask) !== 0) continue;
            for (const letter of letters) {
                const bit = 1 << LETTER_BIT[letter];
                if ((this.masks[i] & bit) !== 0) {
                    counts.set(letter, counts.get(letter) + 1);
                }
            }
        }

        return counts;
    }

    countFrequentForSetAll(letters, minLen, longMinLen = 0) {
        const setMask = charMask(letters.join(''));
        const invMask = ~setMask;
        let total = 0, longCount = 0;

        for (let i = 0, len = this.masks.length; i < len; i++) {
            if (!this.isFreq[i]) continue;
            if (this.lengths[i] < minLen) continue;
            if ((this.masks[i] & invMask) !== 0) continue;
            total++;
            if (longMinLen > 0 && this.lengths[i] >= longMinLen) longCount++;
        }
        return { total, longCount };
    }

    getValidWords(letters, golden, minLen) {
        const setMask = charMask(letters.join(''));
        const goldenBit = 1 << LETTER_BIT[golden];
        const invMask = ~setMask;
        const result = [];

        for (let i = 0, len = this.masks.length; i < len; i++) {
            if (this.lengths[i] < minLen) continue;
            if ((this.masks[i] & goldenBit) === 0) continue;
            if ((this.masks[i] & invMask) !== 0) continue;
            result.push({ word: this.words[i], freq: !!this.isFreq[i] });
        }

        result.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word));
        return result;
    }

    isWordFromSet(word, letters) {
        const setMask = charMask(letters.join(''));
        const wordMask = charMask(word);
        return (wordMask & ~setMask) === 0;
    }
}
