export class WordBuilderRenderer {
    constructor() {
        this.coinsDisplay = document.getElementById('coinsDisplay');
        this.lettersContainer = document.getElementById('lettersContainer');
        this.wordDisplay = document.getElementById('wordDisplay');
        this.wordsList = document.getElementById('wordsList');
        this.messageEl = document.getElementById('message');
        this.submitBtn = document.getElementById('submitBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.wordCountEl = document.getElementById('wordCount');
    }

    renderLetters(letters, goldenLetter) {
        this.lettersContainer.innerHTML = '';

        letters.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            if (letter === goldenLetter) {
                tile.classList.add('golden');
            }
            tile.textContent = letter.toUpperCase();
            tile.dataset.index = index;
            this.lettersContainer.appendChild(tile);
        });
    }

    renderCurrentWord(currentWord) {
        this.wordDisplay.innerHTML = '';
        this.wordDisplay.classList.remove('empty');

        if (currentWord.length === 0) {
            this.wordDisplay.classList.add('empty');
            this.submitBtn.disabled = true;
            return;
        }

        currentWord.forEach((item, index) => {
            const letterEl = document.createElement('div');
            letterEl.className = 'word-letter';
            letterEl.textContent = item.letter.toUpperCase();
            letterEl.dataset.index = index;
            this.wordDisplay.appendChild(letterEl);
        });

        this.submitBtn.disabled = currentWord.length < 4;
    }

    renderCoins(coins) {
        this.coinsDisplay.textContent = coins.toLocaleString('ru-RU');
    }

    renderWordCount(found, total) {
        if (this.wordCountEl) {
            this.wordCountEl.textContent = `${found} / ${total}`;
        }
    }

    renderFoundWords(foundWords, coinsRewards) {
        this.wordsList.innerHTML = '';

        if (foundWords.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = 'Пока не найдено слов';
            emptyMsg.style.color = '#999';
            emptyMsg.style.fontStyle = 'italic';
            this.wordsList.appendChild(emptyMsg);
            return;
        }

        const sorted = [...foundWords].sort((a, b) => {
            if (b.length !== a.length) return b.length - a.length;
            return a.localeCompare(b);
        });

        sorted.forEach(word => {
            const badge = document.createElement('div');
            badge.className = 'word-badge';

            const wordText = document.createElement('span');
            wordText.textContent = word.toUpperCase();

            const coins = document.createElement('span');
            coins.className = 'coins';
            const coinsAmount = coinsRewards.getCoinsForWord(word.length);
            coins.textContent = `+${coinsAmount}`;

            badge.appendChild(wordText);
            badge.appendChild(coins);
            this.wordsList.appendChild(badge);
        });
    }

    renderAllValidWords(allWords, foundWords, coinsRewards) {
        const container = document.getElementById('allWordsSpoiler');
        if (!container) return;

        container.innerHTML = '';
        if (!allWords || allWords.length === 0) return;

        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `Все доступные слова (${allWords.length})`;
        details.appendChild(summary);

        const foundSet = new Set(foundWords);

        // Группируем по длине
        const byLen = {};
        for (const w of allWords) {
            const len = w.length;
            if (!byLen[len]) byLen[len] = [];
            byLen[len].push(w);
        }

        for (const len of Object.keys(byLen).sort((a, b) => b - a)) {
            const words = byLen[len];
            const coins = coinsRewards.getCoinsForWord(parseInt(len));

            const group = document.createElement('div');
            group.className = 'spoiler-group';

            const title = document.createElement('div');
            title.className = 'spoiler-group-title';
            title.textContent = `${len} букв (${words.length} слов, +${coins} монет каждое)`;
            group.appendChild(title);

            const cloud = document.createElement('div');
            cloud.className = 'spoiler-words';

            for (const w of words) {
                const tag = document.createElement('span');
                tag.className = 'spoiler-word';
                if (foundSet.has(w)) tag.classList.add('found');
                tag.textContent = w.toUpperCase();
                cloud.appendChild(tag);
            }

            group.appendChild(cloud);
            details.appendChild(group);
        }

        container.appendChild(details);
    }

    showMessage(text, type = 'success') {
        this.messageEl.textContent = text;
        this.messageEl.className = `message ${type}`;
        this.messageEl.style.display = 'block';

        setTimeout(() => {
            this.messageEl.style.display = 'none';
        }, 3000);
    }

    hideMessage() {
        this.messageEl.style.display = 'none';
    }
}
