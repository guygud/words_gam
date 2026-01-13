// Класс клетки игрового поля

export class Cell {
    constructor() {
        this.letter = '';      // Буква в клетке
        this.occupied = false; // Занята ли клетка
    }
    
    // Очистить клетку
    clear() {
        this.letter = '';
        this.occupied = false;
    }
    
    // Установить букву
    setLetter(letter) {
        this.letter = letter;
        this.occupied = true;
    }
}
