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
        const [nounsResp, freqResp] = await Promise.all([
            fetch('nouns.json'),
            fetch('freq5000.json')
        ]);

        let freqSet = null;
        if (freqResp.ok) {
            const freqWords = await freqResp.json();
            freqSet = new Set(freqWords.map(w => w.toLowerCase()));
            console.log(`Частотный список: ${freqSet.size} слов`);
        }

        if (nounsResp.ok) {
            const nouns = await nounsResp.json();
            const filtered = nouns.filter(w => w && w.length >= WORD_BUILDER_CONFIG.MIN_WORD_LENGTH);
            filtered.forEach(word => dictionaryService.addWord(word));
            wordIndex = new WordIndex(filtered.map(w => w.toLowerCase()), freqSet);
            const freqCount = freqSet ? filtered.filter(w => freqSet.has(w.toLowerCase())).length : 0;
            console.log(`Словарь: ${filtered.length} слов, из них частотных: ${freqCount}`);
        }
    } catch (error) {
        console.warn('Не удалось загрузить словари:', error);
    }

    const renderer = new WordBuilderRenderer();
    const game = new WordBuilderGame(dictionaryService, wordIndex);
    const inputHandler = new WordBuilderInputHandler(game, renderer);

    inputHandler.updateDisplay();

    console.log('Словостроитель запущен!');
    const state = game.getState();
    console.log('Буква дня:', state.letterOfDay.toUpperCase());
    console.log('Буквы:', state.letters.map(l => l.toUpperCase()).join(' '));
    console.log('Доступно слов:', state.totalValidWords);
});
