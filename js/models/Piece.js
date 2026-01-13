import { CONFIG } from '../config.js';

// Класс падающей фигуры тетромино

export class Piece {
    constructor(type, allowedLetters, x = 0, y = 0) {
        this.type = type;  // Тип фигуры (I, O, T, S, Z, J, L)
        this.x = x;        // Позиция X на поле
        this.y = y;        // Позиция Y на поле
        this.rotation = 0; // Текущий поворот (индекс в массиве форм)
        
        // Получаем формы для данного типа
        const shapes = CONFIG.TETROMINO_SHAPES[type];
        if (!shapes) {
            throw new Error(`Неизвестный тип фигуры: ${type}`);
        }
        
        this.shapes = shapes;
        
        // Генерируем буквы для каждой клетки фигуры
        this.letters = this.generateLetters(allowedLetters);
    }
    
    // Генерация случайных букв для клеток фигуры
    generateLetters(allowedLetters) {
        const currentShape = this.getCurrentShape();
        const letters = [];
        const cellCount = currentShape.length;
        
        // Для одиночной буквы выбираем с учетом баланса гласных/согласных
        if (cellCount === 1) {
            // Определяем гласные и согласные
            const vowels = ['Е', 'О', 'И']; // Гласные из МЕТРОПОЛИС
            const consonants = allowedLetters.filter(letter => !vowels.includes(letter));
            
            // С вероятностью 50% выбираем гласную, 50% - согласную
            // Это обеспечит более сбалансированное распределение
            let selectedLetter;
            if (Math.random() < 0.5) {
                // Выбираем гласную
                const vowelIndex = Math.floor(Math.random() * vowels.length);
                selectedLetter = vowels[vowelIndex];
            } else {
                // Выбираем согласную
                const consonantIndex = Math.floor(Math.random() * consonants.length);
                selectedLetter = consonants[consonantIndex];
            }
            
            letters.push(selectedLetter);
            return letters;
        }
        
        // Для фигур из нескольких клеток (если вернемся к ним)
        // С вероятностью 40% пытаемся создать фигуру с буквами для слова
        if (Math.random() < 0.4 && cellCount >= 3) {
            // Попытка создать фигуру с буквами для короткого слова
            const wordPatterns = [
                ['В', 'О', 'Л'],      // ВОЛ
                ['Л', 'Е', 'В'],      // ЛЕВ
                ['В', 'О', 'Л', 'Я'], // ВОЛЯ
                ['Л', 'Ю', 'Ц'],      // ЛЮЦ
                ['О', 'Л', 'Ю'],       // ОЛЮ
                ['Ю', 'Ц', 'И'],       // ЮЦИ
                ['Ц', 'И', 'Я'],       // ЦИЯ
                ['Э', 'В', 'О'],       // ЭВО
                ['Л', 'Ю', 'Ц', 'И'],  // ЛЮЦИ
                ['В', 'О', 'Л', 'Ю']   // ВОЛЮ
            ];
            
            // Выбираем случайный паттерн, который помещается в фигуру
            const suitablePatterns = wordPatterns.filter(p => p.length <= cellCount);
            if (suitablePatterns.length > 0) {
                const pattern = suitablePatterns[Math.floor(Math.random() * suitablePatterns.length)];
                
                // Заполняем буквы по паттерну, остальные случайно
                for (let i = 0; i < cellCount; i++) {
                    if (i < pattern.length) {
                        letters.push(pattern[i]);
                    } else {
                        // Остальные клетки заполняем случайными буквами
                        const randomIndex = Math.floor(Math.random() * allowedLetters.length);
                        letters.push(allowedLetters[randomIndex]);
                    }
                }
                
                // Перемешиваем буквы, чтобы не всегда было в начале
                for (let i = letters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [letters[i], letters[j]] = [letters[j], letters[i]];
                }
                
                return letters;
            }
        }
        
        // Обычная случайная генерация
        for (let i = 0; i < cellCount; i++) {
            const randomIndex = Math.floor(Math.random() * allowedLetters.length);
            letters.push(allowedLetters[randomIndex]);
        }
        
        return letters;
    }
    
    // Получить текущую форму фигуры
    getCurrentShape() {
        return this.shapes[this.rotation];
    }
    
    // Получить все клетки фигуры с их позициями и буквами
    getCells() {
        const shape = this.getCurrentShape();
        return shape.map(([dx, dy], index) => ({
            x: this.x + dx,
            y: this.y + dy,
            letter: this.letters[index]
        }));
    }
    
    // Проверка, может ли фигура переместиться на (dx, dy)
    canMove(board, dx, dy) {
        const cells = this.getCells();
        
        for (const cell of cells) {
            const newX = cell.x + dx;
            const newY = cell.y + dy;
            
            // Проверка границ
            if (!board.isInside(newX, newY)) {
                return false;
            }
            
            // Проверка занятости клетки
            if (!board.isCellFree(newX, newY)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Перемещение влево
    moveLeft(board) {
        if (this.canMove(board, -1, 0)) {
            this.x--;
            return true;
        }
        return false;
    }
    
    // Перемещение вправо
    moveRight(board) {
        if (this.canMove(board, 1, 0)) {
            this.x++;
            return true;
        }
        return false;
    }
    
    // Перемещение вниз
    moveDown(board) {
        if (this.canMove(board, 0, 1)) {
            this.y++;
            return true;
        }
        return false;
    }
    
    // Поворот фигуры
    rotate(board) {
        const nextRotation = (this.rotation + 1) % this.shapes.length;
        const oldRotation = this.rotation;
        
        this.rotation = nextRotation;
        
        // Проверяем, можно ли повернуть
        if (!this.canMove(board, 0, 0)) {
            // Пробуем сдвинуть влево или вправо при повороте
            if (this.canMove(board, -1, 0)) {
                this.x--;
            } else if (this.canMove(board, 1, 0)) {
                this.x++;
            } else {
                // Если не получается, возвращаем обратно
                this.rotation = oldRotation;
                return false;
            }
        }
        
        return true;
    }
    
    // Проверка, может ли фигура двигаться вниз
    canMoveDown(board) {
        return this.canMove(board, 0, 1);
    }
}
