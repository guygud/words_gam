import { CONFIG } from '../config.js';

// Менеджер системы очков

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.wordOfDay = CONFIG.WORD_OF_DAY;
    }
    
    // Подсчет очков за сгоревшие линии с найденными словами
    calculateScore(wordMatches) {
        let points = CONFIG.BASE_LINE_SCORE;
        
        if (wordMatches.length === 0) {
            return 0; // Если нет слов, линия не сгорает (или возвращаем 0)
        }
        
        // Добавляем очки за каждое найденное слово
        for (const match of wordMatches) {
            // Базовый бонус за длину слова
            points += match.word.length * CONFIG.WORD_BONUS;
            
            // Дополнительный бонус за точное совпадение со словом дня
            if (match.word === this.wordOfDay) {
                points += CONFIG.WORD_OF_DAY_BONUS;
            }
        }
        
        return points;
    }
    
    // Добавить очки
    addPoints(points) {
        this.score += points;
    }
    
    // Получить текущий счет
    getScore() {
        return this.score;
    }
    
    // Сброс счета
    reset() {
        this.score = 0;
    }
}
