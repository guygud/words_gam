import { RUNNER_CONFIG } from '../../config-runner.js';

// Рендерер для раннера с буквами

export class RunnerRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = RUNNER_CONFIG.CANVAS_WIDTH;
        this.canvas.height = RUNNER_CONFIG.CANVAS_HEIGHT;
    }
    
    render(gameData) {
        // Очистка canvas
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем дорожку с эффектом движения
        this.drawRoad(gameData);
        
        // Рисуем буквы
        this.drawLetters(gameData.letters);
        
        // Рисуем бонусы
        this.drawBonuses(gameData.bonuses);
        
        // Рисуем игрока
        this.drawPlayer(gameData.player);
        
        // Рисуем UI
        this.drawUI(gameData);
        
        // Рисуем экран победы/проигрыша
        if (gameData.gameState === 'won') {
            this.drawWinScreen();
        }
    }
    
    // Рисование дорожки
    drawRoad(gameData) {
        const roadY = 0;
        const roadHeight = RUNNER_CONFIG.CANVAS_HEIGHT;
        
        // Фон дороги
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.ROAD;
        this.ctx.fillRect(
            RUNNER_CONFIG.LANE_START_X,
            roadY,
            RUNNER_CONFIG.LANE_COUNT * RUNNER_CONFIG.LANE_WIDTH,
            roadHeight
        );
        
        // Разделительные линии (статичные)
        this.ctx.strokeStyle = RUNNER_CONFIG.COLORS.LANE_LINE;
        this.ctx.lineWidth = 2;
        for (let i = 1; i < RUNNER_CONFIG.LANE_COUNT; i++) {
            const x = RUNNER_CONFIG.LANE_START_X + i * RUNNER_CONFIG.LANE_WIDTH;
            this.ctx.beginPath();
            this.ctx.setLineDash([10, 10]);
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, roadHeight);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
        
        // Движущиеся линии на дороге для эффекта скорости
        if (gameData && gameData.roadOffset !== undefined) {
            this.ctx.strokeStyle = RUNNER_CONFIG.COLORS.LANE_LINE;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([15, 25]);
            
            const lineSpacing = 40; // Расстояние между линиями
            const startY = gameData.roadOffset;
            
            // Рисуем движущиеся линии в каждой полосе
            for (let lane = 0; lane < RUNNER_CONFIG.LANE_COUNT; lane++) {
                const laneCenterX = RUNNER_CONFIG.LANE_START_X + lane * RUNNER_CONFIG.LANE_WIDTH + RUNNER_CONFIG.LANE_WIDTH / 2;
                
                // Рисуем несколько линий для создания эффекта движения
                for (let y = startY; y < roadHeight; y += lineSpacing) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(laneCenterX - 30, y);
                    this.ctx.lineTo(laneCenterX + 30, y);
                    this.ctx.stroke();
                }
            }
            
            this.ctx.setLineDash([]);
        }
    }
    
    // Рисование букв
    drawLetters(letters) {
        for (const letter of letters) {
            if (letter.collected) continue;
            
            const color = letter.isTarget 
                ? RUNNER_CONFIG.COLORS.LETTER_TARGET 
                : RUNNER_CONFIG.COLORS.LETTER_WRONG;
            
            // Фон буквы
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                letter.x - RUNNER_CONFIG.LETTER_SIZE / 2,
                letter.y - RUNNER_CONFIG.LETTER_SIZE / 2,
                RUNNER_CONFIG.LETTER_SIZE,
                RUNNER_CONFIG.LETTER_SIZE
            );
            
            // Буква
            this.ctx.fillStyle = RUNNER_CONFIG.COLORS.TEXT;
            this.ctx.font = `bold ${RUNNER_CONFIG.LETTER_SIZE * 0.7}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(letter.letter, letter.x, letter.y);
        }
    }
    
    // Рисование бонусов
    drawBonuses(bonuses) {
        for (const bonus of bonuses) {
            if (bonus.collected) continue;
            
            this.ctx.fillStyle = RUNNER_CONFIG.COLORS.BONUS;
            this.ctx.beginPath();
            this.ctx.arc(bonus.x, bonus.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Иконка бонуса
            this.ctx.fillStyle = RUNNER_CONFIG.COLORS.TEXT;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const icon = bonus.type === RUNNER_CONFIG.BONUS_TYPES.CLEAR_LETTERS ? '🔥' : '✨';
            this.ctx.fillText(icon, bonus.x, bonus.y);
        }
    }
    
    // Рисование игрока
    drawPlayer(player) {
        const x = RUNNER_CONFIG.LANE_START_X + player.lane * RUNNER_CONFIG.LANE_WIDTH + RUNNER_CONFIG.LANE_WIDTH / 2;
        const y = player.y;
        const width = RUNNER_CONFIG.PLAYER_WIDTH;
        const height = RUNNER_CONFIG.PLAYER_HEIGHT;
        
        // Рисуем налипшие буквы перед бегуном
        for (const stuck of player.stuckLetters) {
            const color = stuck.isTarget 
                ? RUNNER_CONFIG.COLORS.LETTER_COLLECTED 
                : RUNNER_CONFIG.COLORS.LETTER_WRONG;
            
            // Фон буквы
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                stuck.x - RUNNER_CONFIG.LETTER_SIZE / 2,
                stuck.y - RUNNER_CONFIG.LETTER_SIZE / 2,
                RUNNER_CONFIG.LETTER_SIZE,
                RUNNER_CONFIG.LETTER_SIZE
            );
            
            // Буква
            this.ctx.fillStyle = RUNNER_CONFIG.COLORS.TEXT;
            this.ctx.font = `bold ${RUNNER_CONFIG.LETTER_SIZE * 0.7}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(stuck.letter, stuck.x, stuck.y);
            
            // Обводка
            this.ctx.strokeStyle = RUNNER_CONFIG.COLORS.TEXT;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                stuck.x - RUNNER_CONFIG.LETTER_SIZE / 2,
                stuck.y - RUNNER_CONFIG.LETTER_SIZE / 2,
                RUNNER_CONFIG.LETTER_SIZE,
                RUNNER_CONFIG.LETTER_SIZE
            );
        }
        
        // Рисуем бегуна
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.PLAYER;
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        // Обводка
        this.ctx.strokeStyle = RUNNER_CONFIG.COLORS.TEXT;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    }
    
    // Рисование UI
    drawUI(gameData) {
        // Текущее слово и прогресс (слева)
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Слово ${gameData.currentWordIndex + 1}/${gameData.totalWords}:`, 20, 30);
        
        // Целевое слово (крупно)
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.TARGET_WORD || RUNNER_CONFIG.COLORS.TEXT;
        this.ctx.fillText(gameData.currentWord, 20, 70);
        
        // Прогресс слова (под целевым словом)
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.PROGRESS_BAR;
        let wordDisplay = '';
        for (let i = 0; i < gameData.currentWord.length; i++) {
            if (i < gameData.wordProgress.length) {
                wordDisplay += gameData.wordProgress[i];
            } else {
                wordDisplay += '_';
            }
        }
        this.ctx.fillText(wordDisplay, 20, 105);
        
        // Активные бонусы
        if (gameData.activeBonuses.clear) {
            this.ctx.fillStyle = RUNNER_CONFIG.COLORS.BONUS;
            this.ctx.font = '18px Arial';
            this.ctx.fillText('🔥 Очистка активна', 20, 135);
        }
        
        if (gameData.activeBonuses.filter) {
            this.ctx.fillStyle = RUNNER_CONFIG.COLORS.BONUS;
            this.ctx.font = '18px Arial';
            this.ctx.fillText('✨ Фильтр активен', 20, gameData.activeBonuses.clear ? 160 : 135);
        }
        
        // Количество налипших букв
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.TEXT;
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Букв собрано: ${gameData.player.stuckLetters.length}`, RUNNER_CONFIG.CANVAS_WIDTH - 200, 30);
    }
    
    // Рисование экрана победы
    drawWinScreen() {
        // Полупрозрачный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Сообщение о победе
        this.ctx.fillStyle = RUNNER_CONFIG.COLORS.PROGRESS_BAR;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🎉 Победа!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Все слова собраны!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Нажмите R для новой игры', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}
