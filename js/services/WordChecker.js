import { WordMatch } from '../models/WordMatch.js';
import { CONFIG } from '../config.js';

// Сервис для проверки и поиска слов в линиях

export class WordChecker {
    constructor(dictionaryService) {
        this.dictionary = dictionaryService;
    }
    
    // Поиск всех слов в строке (горизонтальной или вертикальной)
    findWordsInLine(line, lineIndex, isVertical = false) {
        const words = [];
        const foundWordsSet = new Set(); // Для избежания дубликатов
        
        // Работаем с исходной строкой без trim, чтобы сохранить правильные индексы
        if (line.length < CONFIG.MIN_WORD_LENGTH) {
            return words;
        }
        
        // Перебираем все возможные подстроки длиной >= MIN_WORD_LENGTH
        for (let start = 0; start < line.length; start++) {
            // Пропускаем пробелы в начале подстроки
            if (line[start] === ' ') {
                continue;
            }
            
            for (let length = CONFIG.MIN_WORD_LENGTH; length <= line.length - start; length++) {
                const substring = line.substring(start, start + length);
                
                // Пропускаем подстроки с пробелами
                if (substring.includes(' ')) {
                    break; // Прерываем внутренний цикл, так как дальше будут пробелы
                }
                
                // Проверяем, является ли подстрока словом
                if (this.dictionary.isWord(substring)) {
                    // Избегаем дубликатов (одно и то же слово в одной позиции)
                    const wordKey = `${isVertical ? 'v' : 'h'}-${lineIndex}-${start}-${start + length - 1}-${substring}`;
                    if (!foundWordsSet.has(wordKey)) {
                        foundWordsSet.add(wordKey);
                        const endPos = start + length - 1;
                        words.push(new WordMatch(lineIndex, start, endPos, substring, isVertical));
                    }
                }
            }
        }
        
        return words;
    }
    
    // Проверка, является ли строка валидным словом
    isValidWord(word) {
        return this.dictionary.isWord(word);
    }
}
