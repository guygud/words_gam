import { WordBuilderGame } from './core/WordBuilderGame.js';
import { WordBuilderRenderer } from './core/WordBuilderRenderer.js';
import { WordBuilderInputHandler } from './core/WordBuilderInputHandler.js';
import { DictionaryService } from '../services/DictionaryService.js';
import { WORD_BUILDER_CONFIG } from './config.js';

// Точка входа в игру "Словостроитель"

document.addEventListener('DOMContentLoaded', async () => {
    // Инициализация компонентов
    const dictionaryService = new DictionaryService();
    
    // Попытка загрузить большой словарь из nouns.json
    try {
        const response = await fetch('nouns.json');
        if (response.ok) {
            const nouns = await response.json();
            // Добавляем все слова из словаря
            nouns.forEach(word => {
                if (word && word.length >= WORD_BUILDER_CONFIG.MIN_WORD_LENGTH) {
                    dictionaryService.addWord(word);
                }
            });
            console.log(`Загружено ${nouns.length} слов из словаря`);
        }
    } catch (error) {
        console.warn('Не удалось загрузить словарь из nouns.json, используется базовый словарь:', error);
    }
    
    const renderer = new WordBuilderRenderer();
    const game = new WordBuilderGame(dictionaryService);
    const inputHandler = new WordBuilderInputHandler(game, renderer);
    
    // Первоначальная отрисовка
    const state = game.getState();
    renderer.renderLetters(
        state.letters,
        state.goldenLetter,
        new Set(state.usedLetters)
    );
    renderer.renderCurrentWord(state.currentWord);
    renderer.renderCoins(state.coins);
    renderer.renderFoundWords(state.foundWords, WORD_BUILDER_CONFIG);
    
    console.log('Игра "Словостроитель" запущена!');
    console.log('Буквы:', state.letters.join(', '));
    console.log('Золотая буква:', state.goldenLetter);
});
