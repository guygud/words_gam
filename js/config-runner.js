// Конфигурация для раннера с буквами

export const RUNNER_CONFIG = {
    // Размеры Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Игрок
    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 40,
    PLAYER_START_X: 100,
    PLAYER_START_Y: 500,
    PLAYER_SPEED: 5, // Скорость движения влево/вправо
    
    // Дорожка
    LANE_COUNT: 3, // Количество полос
    LANE_WIDTH: 200, // Ширина полосы
    LANE_START_X: 200, // Начало дорожки
    
    // Буквы
    LETTER_SIZE: 30,
    LETTER_SPAWN_RATE: 60, // Каждые N кадров (уменьшено для более частого появления букв)
    LETTER_FALL_SPEED: 3.2, // Базовая скорость падения (увеличено на ~5% для первого уровня)
    LETTER_FALL_SPEED_INCREASE: 0.6, // Увеличение скорости за слово (увеличено для последнего уровня)
    STUCK_LETTER_SPACING: 35, // Расстояние между буквами, налипшими на бегуна
    
    // Целевые слова (последовательно)
    TARGET_WORDS: ['КОТ', 'КРИК', 'ЛАМПА'],
    
    // Бонусы
    BONUS_SPAWN_RATE: 300, // Каждые N кадров
    BONUS_TYPES: {
        CLEAR_LETTERS: 'clear', // Сжечь все лишние буквы
        FILTER_LETTERS: 'filter' // Временно игнорировать ненужные буквы
    },
    BONUS_DURATION: 300, // Длительность бонуса в кадрах
    
    // Цвета
    COLORS: {
        BACKGROUND: '#1a1a2e',
        ROAD: '#16213e',
        LANE_LINE: '#0f3460',
        PLAYER: '#e94560',
        LETTER_TARGET: '#4CAF50',
        LETTER_WRONG: '#f44336',
        LETTER_COLLECTED: '#FFC107',
        BONUS: '#9C27B0',
        TEXT: '#ffffff',
        PROGRESS_BAR: '#4CAF50',
        PROGRESS_BG: '#333333',
        TARGET_WORD: '#667eea'
    },
    
    // Алфавит для генерации лишних букв
    ALPHABET: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
};
