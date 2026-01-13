// Структура найденного слова в линии или столбце

export class WordMatch {
    constructor(rowIndex, startX, endX, word, isVertical = false) {
        this.rowIndex = rowIndex;      // Номер строки (для горизонтальных) или столбца (для вертикальных)
        this.startX = startX;           // Начальная позиция X (для горизонтальных) или Y (для вертикальных)
        this.endX = endX;               // Конечная позиция X (для горизонтальных) или Y (для вертикальных)
        this.word = word;               // Найденное слово
        this.isVertical = isVertical;   // true если слово вертикальное
    }
}
