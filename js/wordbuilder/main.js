import { WordBuilderGame } from './core/WordBuilderGame.js';
import { WordBuilderRenderer } from './core/WordBuilderRenderer.js';
import { WordBuilderInputHandler } from './core/WordBuilderInputHandler.js';
import { WordIndex } from './core/WordIndex.js';
import { DictionaryService } from '../services/DictionaryService.js';
import { WORD_BUILDER_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dictionaryService = new DictionaryService();
    let wordIndex = null;

    try {
        const response = await fetch('nouns.json');
        if (response.ok) {
            const nouns = await response.json();
            const filtered = nouns.filter(w => w && w.length >= WORD_BUILDER_CONFIG.MIN_WORD_LENGTH);
            filtered.forEach(word => dictionaryService.addWord(word));
            wordIndex = new WordIndex(filtered.map(w => w.toLowerCase()));
            console.log(`Словарь: ${filtered.length} слов, индекс построен`);
        }
    } catch (error) {
        console.warn('Не удалось загрузить nouns.json:', error);
    }

    const renderer = new WordBuilderRenderer();
    const game = new WordBuilderGame(dictionaryService, wordIndex);
    const inputHandler = new WordBuilderInputHandler(game, renderer);

    // Первоначальная отрисовка
    inputHandler.updateDisplay();

    console.log('Словостроитель запущен!');
    const state = game.getState();
    console.log('Буквы:', state.letters.map(l => l.toUpperCase()).join(' '));
    console.log('Золотая:', state.goldenLetter.toUpperCase());
    console.log('Доступно слов:', state.totalValidWords);
});
