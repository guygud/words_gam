// Конфигурация для игры 2048 со словами

export const WORD2048_CONFIG = {
    BOARD_SIZE: 6,           // Размер поля 6x6
    INITIAL_LETTERS_COUNT: 10, // Количество букв на поле
    CELL_SIZE: 60,            // Размер клетки в пикселях
    CELL_PADDING: 5,          // Отступ между клетками
    ANIMATION_DURATION: 150,  // Длительность анимации в мс
    
    // Цвета
    COLORS: {
        BACKGROUND: '#faf8ef',
        GRID_LINES: '#bbada0',
        CELL_EMPTY: '#cdc1b4',
        CELL_LETTER: '#776e65',
        CELL_BACKGROUND: '#eee4da',
        TEXT_PRIMARY: '#776e65',
        TEXT_SECONDARY: '#f9f6f2',
        SUCCESS: '#4CAF50',
        TARGET_WORD: '#667eea'
    },
    
    // Целевые слова для игры
    TARGET_WORDS: [
        'СТОЛБ',
        'ЛАМПА',
        'КНИГА',
        'ШТУКА',
        'ГРУША'
    ]
};
