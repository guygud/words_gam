import { PUZZLE_CONFIG } from '../../config-puzzle.js';

// Генератор уровней для головоломки

export class LevelGenerator {
    constructor(dictionaryService) {
        this.dictionary = dictionaryService;
    }
    
    // Генерация уровня: используем конкретные слова
    generateLevel() {
        const size = PUZZLE_CONFIG.BOARD_SIZE;
        
        // Конкретные слова для уровня
        const selectedWords = ['СТОЛБ', 'ЛАМПА', 'КНИГА', 'ШТУКА', 'ГРУША'];
        
        // Создаем начальное поле: каждое слово в своей строке
        const initialBoard = [];
        for (let y = 0; y < size; y++) {
            initialBoard[y] = [];
            const word = selectedWords[y];
            const wordLetters = word.split('');
            
            // Заполняем строку буквами слова, остальное - случайными буквами из этих слов
            const allLetters = this.getAllLettersFromWords(selectedWords);
            for (let x = 0; x < size; x++) {
                if (x < wordLetters.length) {
                    initialBoard[y][x] = wordLetters[x];
                } else {
                    // Заполняем оставшиеся клетки случайными буквами из всех слов
                    const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
                    initialBoard[y][x] = randomLetter;
                }
            }
        }
        
        // Перемешиваем решение случайными вращениями
        const shuffleResult = this.shuffleBoard(initialBoard, size);
        
        return {
            words: selectedWords,
            initialBoard: initialBoard,
            shuffled: shuffleResult.shuffled,
            rotations: shuffleResult.rotations
        };
    }
    
    // Получить все буквы из слов
    getAllLettersFromWords(words) {
        const letters = [];
        for (const word of words) {
            letters.push(...word.split(''));
        }
        return letters;
    }
    
    // Создание решения с возможными словами
    createSolution(letters, size) {
        const board = [];
        
        // Инициализируем пустое поле
        for (let y = 0; y < size; y++) {
            board[y] = [];
            for (let x = 0; x < size; x++) {
                board[y][x] = '';
            }
        }
        
        // Пытаемся разместить буквы так, чтобы образовались слова
        // Простая стратегия: размещаем буквы случайно, но с учетом возможных слов
        const letterIndex = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Выбираем случайную букву из набора
                const randomLetterIndex = Math.floor(Math.random() * letters.length);
                board[y][x] = letters[randomLetterIndex];
            }
        }
        
        // Пытаемся улучшить решение, размещая буквы для слов
        this.optimizeForWords(board, letters, size);
        
        return board;
    }
    
    // Оптимизация размещения букв для образования слов
    optimizeForWords(board, letters, size) {
        // Простая стратегия: размещаем некоторые буквы в линиях для образования коротких слов
        const shortWords = ['МЕТ', 'ПОЛ', 'РОТ', 'МИР', 'ЛЕС', 'ТЕЛ', 'СОЛ'];
        
        // Пытаемся разместить хотя бы одно слово
        if (shortWords.length > 0) {
            const word = shortWords[Math.floor(Math.random() * shortWords.length)];
            const wordLetters = word.split('');
            
            // Проверяем, есть ли нужные буквы
            const availableLetters = [...letters];
            let canPlace = true;
            for (const letter of wordLetters) {
                const index = availableLetters.indexOf(letter);
                if (index === -1) {
                    canPlace = false;
                    break;
                }
                availableLetters.splice(index, 1);
            }
            
            if (canPlace && wordLetters.length <= size) {
                // Размещаем слово в первой строке
                for (let x = 0; x < wordLetters.length && x < size; x++) {
                    board[0][x] = wordLetters[x];
                }
            }
        }
    }
    
    // Перемешивание доски случайными вращениями с сохранением последовательности
    shuffleBoard(board, size) {
        // Создаем копию доски
        const shuffled = [];
        for (let y = 0; y < size; y++) {
            shuffled[y] = [...board[y]];
        }
        
        // Сохраняем последовательность вращений для анимации
        const rotations = [];
        
        // Выполняем случайные вращения (20-30 раз)
        const rotationCount = 20 + Math.floor(Math.random() * 11);
        
        for (let i = 0; i < rotationCount; i++) {
            const rotationType = Math.floor(Math.random() * 4);
            const index = Math.floor(Math.random() * size);
            
            let rotation = null;
            
            switch (rotationType) {
                case 0: // Вращение строки влево
                    this.rotateRowLeft(shuffled, index, size);
                    rotation = { type: 'row', index, direction: 'left' };
                    break;
                case 1: // Вращение строки вправо
                    this.rotateRowRight(shuffled, index, size);
                    rotation = { type: 'row', index, direction: 'right' };
                    break;
                case 2: // Вращение столбца вверх
                    this.rotateColumnUp(shuffled, index, size);
                    rotation = { type: 'column', index, direction: 'up' };
                    break;
                case 3: // Вращение столбца вниз
                    this.rotateColumnDown(shuffled, index, size);
                    rotation = { type: 'column', index, direction: 'down' };
                    break;
            }
            
            if (rotation) {
                rotations.push(rotation);
            }
        }
        
        return { shuffled, rotations };
    }
    
    // Вспомогательные методы для перемешивания
    rotateRowLeft(board, rowIndex, size) {
        const row = board[rowIndex];
        const first = row[0];
        for (let x = 0; x < size - 1; x++) {
            row[x] = row[x + 1];
        }
        row[size - 1] = first;
    }
    
    rotateRowRight(board, rowIndex, size) {
        const row = board[rowIndex];
        const last = row[size - 1];
        for (let x = size - 1; x > 0; x--) {
            row[x] = row[x - 1];
        }
        row[0] = last;
    }
    
    rotateColumnUp(board, columnIndex, size) {
        const first = board[0][columnIndex];
        for (let y = 0; y < size - 1; y++) {
            board[y][columnIndex] = board[y + 1][columnIndex];
        }
        board[size - 1][columnIndex] = first;
    }
    
    rotateColumnDown(board, columnIndex, size) {
        const last = board[size - 1][columnIndex];
        for (let y = size - 1; y > 0; y--) {
            board[y][columnIndex] = board[y - 1][columnIndex];
        }
        board[0][columnIndex] = last;
    }
}
