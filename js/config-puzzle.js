// Конфигурация игры-головоломки с вращением

export const PUZZLE_CONFIG = {
    // Размеры игрового поля
    BOARD_SIZE: 5,  // 5x5
    
    // Слово дня (для генерации букв)
    WORD_OF_DAY: 'МЕТРОПОЛИС',
    
    // Минимальная длина слова для зачёта
    MIN_WORD_LENGTH: 3,
    
    // Размер клетки на canvas (в пикселях)
    CELL_SIZE: 50,
    
    // Получить уникальные буквы из слова дня
    getUniqueLetters() {
        return [...new Set(this.WORD_OF_DAY.split(''))];
    }
};
