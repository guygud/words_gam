import { RUNNER_CONFIG } from '../../config-runner.js';

// Основная логика раннера с буквами

export class RunnerGame {
    constructor(renderer) {
        this.renderer = renderer;
        
        // Игрок
        this.player = {
            x: RUNNER_CONFIG.PLAYER_START_X,
            y: RUNNER_CONFIG.PLAYER_START_Y,
            lane: 1, // Средняя полоса (0, 1, 2)
            collectedLetters: [], // Собранные буквы (включая лишние)
            stuckLetters: [] // Буквы, налипшие перед бегуном [{letter, isTarget, x, y}]
        };
        
        // Игровое состояние
        this.gameState = 'playing'; // playing, won, lost
        this.currentWordIndex = 0;
        this.currentWord = RUNNER_CONFIG.TARGET_WORDS[0];
        this.wordProgress = ''; // Прогресс текущего слова
        
        // Буквы на экране
        this.letters = [];
        this.letterSpawnTimer = 0;
        
        // Бонусы
        this.bonuses = [];
        this.bonusSpawnTimer = 0;
        this.activeBonuses = {
            clear: false,
            filter: false
        };
        this.bonusTimers = {
            clear: 0,
            filter: 0
        };
        
        // Скорость и сложность
        this.fallSpeed = RUNNER_CONFIG.LETTER_FALL_SPEED;
        this.spawnRate = RUNNER_CONFIG.LETTER_SPAWN_RATE;
        this.frameCount = 0;
        this.roadOffset = 0; // Смещение дорожной разметки для эффекта скорости
    }
    
    // Обновление игры
    update() {
        if (this.gameState !== 'playing') {
            return;
        }
        
        this.frameCount++;
        
        // Обновление смещения дороги для эффекта скорости
        this.roadOffset += this.fallSpeed * 2; // Движение дороги синхронизировано со скоростью падения
        if (this.roadOffset > 20) {
            this.roadOffset = 0; // Сброс для создания бесконечного паттерна
        }
        
        // Обновление таймеров бонусов
        this.updateBonuses();
        
        // Обновление позиций налипших букв (чтобы следовали за бегуном)
        this.updateStuckLettersPositions();
        
        // Спавн букв
        this.spawnLetters();
        
        // Спавн бонусов
        this.spawnBonuses();
        
        // Обновление позиций букв
        this.updateLetters();
        
        // Обновление позиций бонусов
        this.updateBonusesPositions();
        
        // Проверка столкновений
        this.checkCollisions();
        
        // Проверка победы
        this.checkWin();
    }
    
    // Обновление таймеров бонусов
    updateBonuses() {
        if (this.bonusTimers.clear > 0) {
            this.bonusTimers.clear--;
            if (this.bonusTimers.clear === 0) {
                this.activeBonuses.clear = false;
            }
        }
        
        if (this.bonusTimers.filter > 0) {
            this.bonusTimers.filter--;
            if (this.bonusTimers.filter === 0) {
                this.activeBonuses.filter = false;
            }
        }
    }
    
    // Спавн букв
    spawnLetters() {
        this.letterSpawnTimer++;
        
        if (this.letterSpawnTimer >= this.spawnRate) {
            this.letterSpawnTimer = 0;
            
            // Выбираем случайную полосу
            const lane = Math.floor(Math.random() * RUNNER_CONFIG.LANE_COUNT);
            const x = RUNNER_CONFIG.LANE_START_X + lane * RUNNER_CONFIG.LANE_WIDTH + RUNNER_CONFIG.LANE_WIDTH / 2;
            
            // Определяем, нужная это буква или лишняя
            const neededLetter = this.getNextNeededLetter();
            let letter;
            let isTarget;
            
            if (neededLetter && Math.random() < 0.4) {
                // 40% шанс спавна нужной буквы
                letter = neededLetter;
                isTarget = true;
            } else {
                // Лишняя буква
                const wrongLetters = this.getWrongLetters();
                letter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
                isTarget = false;
            }
            
            this.letters.push({
                x: x,
                y: -RUNNER_CONFIG.LETTER_SIZE,
                letter: letter,
                isTarget: isTarget,
                collected: false
            });
        }
    }
    
    // Получить следующую нужную букву
    getNextNeededLetter() {
        if (this.wordProgress.length < this.currentWord.length) {
            return this.currentWord[this.wordProgress.length];
        }
        return null;
    }
    
    // Получить список лишних букв
    getWrongLetters() {
        const needed = this.currentWord.split('');
        const wrong = RUNNER_CONFIG.ALPHABET.split('').filter(l => !needed.includes(l));
        return wrong.length > 0 ? wrong : RUNNER_CONFIG.ALPHABET.split('');
    }
    
    // Спавн бонусов
    spawnBonuses() {
        this.bonusSpawnTimer++;
        
        if (this.bonusSpawnTimer >= RUNNER_CONFIG.BONUS_SPAWN_RATE) {
            this.bonusSpawnTimer = 0;
            
            const lane = Math.floor(Math.random() * RUNNER_CONFIG.LANE_COUNT);
            const x = RUNNER_CONFIG.LANE_START_X + lane * RUNNER_CONFIG.LANE_WIDTH + RUNNER_CONFIG.LANE_WIDTH / 2;
            
            const bonusType = Math.random() < 0.5 
                ? RUNNER_CONFIG.BONUS_TYPES.CLEAR_LETTERS 
                : RUNNER_CONFIG.BONUS_TYPES.FILTER_LETTERS;
            
            this.bonuses.push({
                x: x,
                y: -30,
                type: bonusType,
                collected: false
            });
        }
    }
    
    // Обновление позиций букв
    updateLetters() {
        for (let i = this.letters.length - 1; i >= 0; i--) {
            const letter = this.letters[i];
            letter.y += this.fallSpeed;
            
            // Удаляем буквы, упавшие за экран
            if (letter.y > RUNNER_CONFIG.CANVAS_HEIGHT + RUNNER_CONFIG.LETTER_SIZE) {
                this.letters.splice(i, 1);
            }
        }
    }
    
    // Обновление позиций бонусов
    updateBonusesPositions() {
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            const bonus = this.bonuses[i];
            bonus.y += this.fallSpeed;
            
            if (bonus.y > RUNNER_CONFIG.CANVAS_HEIGHT + 30) {
                this.bonuses.splice(i, 1);
            }
        }
    }
    
    // Проверка столкновений
    checkCollisions() {
        const playerX = RUNNER_CONFIG.LANE_START_X + this.player.lane * RUNNER_CONFIG.LANE_WIDTH + RUNNER_CONFIG.LANE_WIDTH / 2;
        const playerY = this.player.y;
        const playerWidth = RUNNER_CONFIG.PLAYER_WIDTH;
        const playerHeight = RUNNER_CONFIG.PLAYER_HEIGHT;
        
        // Учитываем налипшие буквы при проверке столкновений
        const totalHeight = playerHeight + this.player.stuckLetters.length * RUNNER_CONFIG.STUCK_LETTER_SPACING;
        
        // Проверка столкновений с буквами
        for (let i = this.letters.length - 1; i >= 0; i--) {
            const letter = this.letters[i];
            
            if (letter.collected) continue;
            
            const letterX = letter.x;
            const letterY = letter.y;
            const letterSize = RUNNER_CONFIG.LETTER_SIZE;
            
            // Проверка столкновения с бегуном и налипшими буквами
            const collisionY = playerY - totalHeight / 2;
            const collisionHeight = totalHeight;
            
            if (Math.abs(letterX - playerX) < (playerWidth / 2 + letterSize / 2) &&
                letterY >= collisionY - collisionHeight / 2 && letterY <= collisionY + collisionHeight / 2) {
                
                if (this.activeBonuses.filter && !letter.isTarget) {
                    // Бонус фильтра - игнорируем лишние буквы
                    this.letters.splice(i, 1);
                    continue;
                }
                
                letter.collected = true;
                
                // Буква "налипает" перед бегуном (позиция будет обновляться каждый кадр)
                const stuckLetter = {
                    letter: letter.letter,
                    isTarget: letter.isTarget,
                    x: 0, // Будет обновляться каждый кадр в updateStuckLettersPositions
                    y: 0  // Будет обновляться каждый кадр в updateStuckLettersPositions
                };
                
                this.player.stuckLetters.push(stuckLetter);
                this.player.collectedLetters.push(letter.letter);
                
                // Сразу обновляем позиции всех налипших букв
                this.updateStuckLettersPositions();
                
                if (letter.isTarget) {
                    // Правильная буква - проверяем прогресс
                    this.updateWordProgress();
                }
                
                this.letters.splice(i, 1);
            }
        }
        
        // Проверка столкновений с бонусами
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            const bonus = this.bonuses[i];
            
            if (bonus.collected) continue;
            
            const bonusX = bonus.x;
            const bonusY = bonus.y;
            const bonusSize = 30;
            
            // Учитываем налипшие буквы при проверке столкновений с бонусами
            const totalHeight = playerHeight + this.player.stuckLetters.length * RUNNER_CONFIG.STUCK_LETTER_SPACING;
            const collisionY = playerY - totalHeight / 2;
            
            if (Math.abs(bonusX - playerX) < (playerWidth / 2 + bonusSize / 2) &&
                bonusY >= collisionY - totalHeight / 2 && bonusY <= collisionY + totalHeight / 2) {
                
                this.activateBonus(bonus.type);
                bonus.collected = true;
                this.bonuses.splice(i, 1);
            }
        }
    }
    
    // Активация бонуса
    activateBonus(type) {
        if (type === RUNNER_CONFIG.BONUS_TYPES.CLEAR_LETTERS) {
            // Сжечь все лишние буквы
            this.clearWrongLetters();
        } else if (type === RUNNER_CONFIG.BONUS_TYPES.FILTER_LETTERS) {
            // Временно игнорировать лишние буквы
            this.activeBonuses.filter = true;
            this.bonusTimers.filter = RUNNER_CONFIG.BONUS_DURATION;
        }
    }
    
    // Обновление прогресса слова
    updateWordProgress() {
        const needed = this.currentWord.split('');
        this.wordProgress = '';
        
        // Проверяем налипшие буквы по порядку
        for (const stuck of this.player.stuckLetters) {
            if (stuck.isTarget && this.wordProgress.length < this.currentWord.length) {
                const expectedLetter = this.currentWord[this.wordProgress.length];
                if (stuck.letter === expectedLetter) {
                    this.wordProgress += stuck.letter;
                }
            }
        }
    }
    
    // Очистка лишних букв
    clearWrongLetters() {
        const needed = this.currentWord.split('');
        
        // Удаляем лишние буквы из налипших
        this.player.stuckLetters = this.player.stuckLetters.filter(stuck => {
            if (!stuck.isTarget) {
                return false; // Удаляем лишние
            }
            // Для правильных букв проверяем, не превышают ли они нужное количество
            const letterCount = this.player.stuckLetters.filter(s => s.letter === stuck.letter && s.isTarget).length;
            const neededCount = needed.filter(l => l === stuck.letter).length;
            return letterCount <= neededCount;
        });
        
        // Обновляем позиции оставшихся букв
        this.updateStuckLettersPositions();
        
        // Обновляем прогресс
        this.updateWordProgress();
    }
    
    // Обновление позиций налипших букв
    updateStuckLettersPositions() {
        const playerX = RUNNER_CONFIG.LANE_START_X + this.player.lane * RUNNER_CONFIG.LANE_WIDTH + RUNNER_CONFIG.LANE_WIDTH / 2;
        const playerY = this.player.y;
        
        for (let i = 0; i < this.player.stuckLetters.length; i++) {
            this.player.stuckLetters[i].x = playerX;
            this.player.stuckLetters[i].y = playerY - RUNNER_CONFIG.PLAYER_HEIGHT / 2 - RUNNER_CONFIG.STUCK_LETTER_SPACING * (i + 1);
        }
    }
    
    // Движение игрока
    moveLeft() {
        if (this.player.lane > 0) {
            this.player.lane--;
        }
    }
    
    moveRight() {
        if (this.player.lane < RUNNER_CONFIG.LANE_COUNT - 1) {
            this.player.lane++;
        }
    }
    
    // Проверка победы
    checkWin() {
        if (this.wordProgress === this.currentWord) {
            // Слово собрано - сжигаем соответствующие буквы
            this.burnCollectedWord();
            
            this.currentWordIndex++;
            
            if (this.currentWordIndex >= RUNNER_CONFIG.TARGET_WORDS.length) {
                // Все слова собраны
                this.gameState = 'won';
            } else {
                // Переходим к следующему слову
                this.currentWord = RUNNER_CONFIG.TARGET_WORDS[this.currentWordIndex];
                this.wordProgress = '';
                this.player.collectedLetters = [];
                
                // Увеличиваем сложность
                this.fallSpeed += RUNNER_CONFIG.LETTER_FALL_SPEED_INCREASE;
                this.spawnRate = Math.max(40, this.spawnRate - 10); // Уменьшение интервала спавна
            }
        }
    }
    
    // Сжигание собранного слова (удаление букв из налипших)
    burnCollectedWord() {
        const word = this.currentWord;
        const lettersToRemove = word.split('');
        let removedCount = 0;
        
        // Удаляем буквы слова из налипших (в обратном порядке, чтобы не сбить индексы)
        // Ищем правильные буквы в порядке слова
        for (let i = this.player.stuckLetters.length - 1; i >= 0 && removedCount < lettersToRemove.length; i--) {
            const stuck = this.player.stuckLetters[i];
            if (stuck.isTarget) {
                // Проверяем, является ли эта буква частью собранного слова
                const letterIndex = lettersToRemove.length - 1 - removedCount;
                if (letterIndex >= 0 && stuck.letter === lettersToRemove[letterIndex]) {
                    this.player.stuckLetters.splice(i, 1);
                    removedCount++;
                }
            }
        }
        
        // Обновляем позиции оставшихся букв
        this.updateStuckLettersPositions();
        
        // Очищаем собранные буквы для нового слова
        this.player.collectedLetters = [];
    }
    
    // Получить данные для рендеринга
    getRenderData() {
        return {
            player: this.player,
            letters: this.letters,
            bonuses: this.bonuses,
            currentWord: this.currentWord,
            wordProgress: this.wordProgress,
            currentWordIndex: this.currentWordIndex,
            totalWords: RUNNER_CONFIG.TARGET_WORDS.length,
            activeBonuses: this.activeBonuses,
            gameState: this.gameState,
            roadOffset: this.roadOffset,
            fallSpeed: this.fallSpeed
        };
    }
}
