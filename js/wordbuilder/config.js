const GOOD_DAY_LETTERS = 'абвгдежзиклмнопрстухчя';

export const WORD_BUILDER_CONFIG = {
    LETTERS_COUNT: 7,
    MIN_WORD_LENGTH: 4,

    getLetterOfDay(dayOffset = 0) {
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const dayIndex = Math.floor(dayStart / 86400000) + dayOffset;
        const len = GOOD_DAY_LETTERS.length;
        return GOOD_DAY_LETTERS[((dayIndex % len) + len) % len];
    },

    // Энергия: 4 попытки смены букв в день
    ENERGY_START: 4,
    ENERGY_CHANGE_LETTERS: 1,

    // Rejection sampling — строже для частотных слов
    MIN_VALID_WORDS: 12,
    MAX_VALID_WORDS: 60,
    MIN_FREQUENT_WORDS: 8,
    MIN_FREQUENT_RATIO: 0.5,
    MIN_FREQUENT_LONG: 2,
    MIN_LONG_WORD_LENGTH: 7,
    MAX_GENERATION_ATTEMPTS: 800,

    COINS_REWARDS: {
        4: 3,
        5: 6,
        6: 10,
        7: 20,
        8: 25,
        9: 30,
        10: 40,
        default: 100
    },

    LETTER_FREQUENCIES: {
        'о': 0.1118, 'е': 0.0875, 'а': 0.0764, 'и': 0.0709, 'н': 0.0678,
        'т': 0.0609, 'с': 0.0497, 'л': 0.0496, 'в': 0.0438, 'р': 0.0423,
        'к': 0.0330, 'м': 0.0317, 'д': 0.0309, 'п': 0.0247, 'ы': 0.0236,
        'у': 0.0222, 'б': 0.0201, 'я': 0.0196, 'ь': 0.0184, 'г': 0.0172,
        'з': 0.0148, 'ч': 0.0140, 'й': 0.0121, 'ж': 0.0101, 'х': 0.0095,
        'ш': 0.0072, 'ю': 0.0047, 'ц': 0.0039, 'э': 0.0036, 'щ': 0.0030,
        'ф': 0.0021, 'ё': 0.0020, 'ъ': 0.0002
    },

    getCoinsForWord(wordLength) {
        if (wordLength < this.MIN_WORD_LENGTH) return 0;
        if (wordLength >= 11) return this.COINS_REWARDS.default;
        return this.COINS_REWARDS[wordLength] || 0;
    }
};
