export class WordBuilderRenderer {
    constructor() {
        this.coinsDisplay = document.getElementById('coinsDisplay');
        this.energyDisplay = document.getElementById('energyDisplay');
        this.changeLettersBtn = document.getElementById('changeLettersBtn');
        this.lettersContainer = document.getElementById('lettersContainer');
        this.wordDisplay = document.getElementById('wordDisplay');
        this.wordsList = document.getElementById('wordsList');
        this.messageEl = document.getElementById('message');
        this.submitBtn = document.getElementById('submitBtn');
        this.clearBtn = document.getElementById('clearBtn');
    }

    renderLetters(letters, goldenLetter) {
        this.lettersContainer.innerHTML = '';

        const goldenIdx = letters.indexOf(goldenLetter);
        const petals = [];
        letters.forEach((l, i) => { if (i !== goldenIdx) petals.push({ letter: l, index: i }); });

        const cx = 130, cy = 130, radius = 85;

        // Буква дня — центр (неизменяемая)
        if (goldenIdx >= 0) {
            const tile = document.createElement('div');
            tile.className = 'letter-tile golden letter-of-day';
            tile.title = 'Буква дня';
            tile.textContent = letters[goldenIdx].toUpperCase();
            tile.dataset.index = goldenIdx;
            tile.style.left = cx + 'px';
            tile.style.top = cy + 'px';
            tile.style.transform = 'translate(-50%, -50%)';
            this.lettersContainer.appendChild(tile);
        }

        // Лепестки вокруг центра
        petals.forEach((p, i) => {
            const angle = (Math.PI * 2 * i / petals.length) - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = p.letter.toUpperCase();
            tile.dataset.index = p.index;
            tile.style.left = x + 'px';
            tile.style.top = y + 'px';
            tile.style.transform = 'translate(-50%, -50%)';
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

    renderEnergy(energy, cost) {
        if (this.energyDisplay) this.energyDisplay.textContent = `⚡ ${energy}`;
        if (this.changeLettersBtn) {
            this.changeLettersBtn.disabled = energy < cost;
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

        const freqCount = allWords.filter(e => e.freq).length;
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `Все доступные слова (${allWords.length}, частотных: ${freqCount})`;
        details.appendChild(summary);

        const foundSet = new Set(foundWords);

        const byLen = {};
        for (const entry of allWords) {
            const len = entry.word.length;
            if (!byLen[len]) byLen[len] = [];
            byLen[len].push(entry);
        }

        for (const len of Object.keys(byLen).sort((a, b) => b - a)) {
            const entries = byLen[len];
            const coins = coinsRewards.getCoinsForWord(parseInt(len));
            const fCount = entries.filter(e => e.freq).length;

            const group = document.createElement('div');
            group.className = 'spoiler-group';

            const title = document.createElement('div');
            title.className = 'spoiler-group-title';
            title.textContent = `${len} букв (${entries.length} слов, частотных: ${fCount}, +${coins} монет)`;
            group.appendChild(title);

            const cloud = document.createElement('div');
            cloud.className = 'spoiler-words';

            for (const entry of entries) {
                const tag = document.createElement('span');
                tag.className = 'spoiler-word';
                if (foundSet.has(entry.word)) tag.classList.add('found');
                if (!entry.freq) tag.classList.add('rare');
                tag.textContent = entry.word.toUpperCase();
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
