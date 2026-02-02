/**
 * 遊戲主邏輯類
 * 管理遊戲狀態、物件生成、碰撞檢測和遊戲流程
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 遊戲狀態
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.coins = 0;
        this.gameTime = 0;
        this.level = 1;
        
        // 遊戲物件
        this.mario = null;
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.particles = [];
        
        // 遊戲設定
        this.gravity = 0.8;
        this.platformHeight = 20;
        this.groundY = canvas.height - 100;
        
        // 生成器
        this.platformGenerator = null;
        this.enemyGenerator = null;
        this.coinGenerator = null;
        
        // 遊戲循環
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        
        // 相機系統
        this.camera = {
            x: 0,
            y: 0,
            speed: 2,
            targetX: 0
        };
        
        // 音效
        this.sounds = {};
        this.soundEnabled = true;
        
        // 特效
        this.shakeIntensity = 0;
        this.flashIntensity = 0;
        
        // 初始化
        this.init();
    }

    init() {
        this.createMario();
        this.generateInitialLevel();
        this.setupGenerators();
        
        // 綁定事件
        this.bindEvents();
    }

    createMario() {
        this.mario = new Mario(this.canvas);
        this.mario.setPosition(50, this.groundY - 40);
    }

    generateInitialLevel() {
        // 創建地面平台
        this.platforms = [];
        this.addPlatform(0, this.groundY, this.canvas.width, this.platformHeight);
        
        // 添加一些起始平台
        for (let i = 0; i < 5; i++) {
            const x = 200 + i * 300;
            const y = this.groundY - 100 - Math.random() * 100;
            this.addPlatform(x, y, 150, 15);
        }
        
        // 初始化道具和金幣
        this.collectibles = [];
        this.addCoin(300, this.groundY - 120);
        this.addMushroom(400, this.groundY - 120);
        
        // 初始化敵人
        this.enemies = [];
        this.addGoomba(600, this.groundY - 40);
        this.addGoomba(900, this.groundY - 40);
    }

    addPlatform(x, y, width, height = 15) {
        this.platforms.push({
            x, y, width, height,
            type: 'platform',
            solid: true
        });
    }

    addGoomba(x, y) {
        this.enemies.push({
            x, y,
            width: 40,
            height: 40,
            velocityX: -1,
            velocityY: 0,
            type: 'goomba',
            alive: true,
            direction: -1, // 開始向左移動
            speed: 1
        });
    }

    addCoin(x, y) {
        this.collectibles.push({
            x, y,
            width: 20,
            height: 20,
            type: 'coin',
            collected: false,
            value: 100,
            bobOffset: Math.random() * Math.PI * 2,
            rotation: 0
        });
    }

    addMushroom(x, y) {
        this.collectibles.push({
            x, y,
            width: 30,
            height: 30,
            type: 'mushroom',
            collected: false,
            value: 200,
            bobOffset: Math.random() * Math.PI * 2,
            animation: 0
        });
    }

    setupGenerators() {
        this.platformGenerator = {
            lastX: 1000,
            minSpacing: 200,
            maxSpacing: 400,
            generate: () => {
                const x = this.platformGenerator.lastX + 
                    (Math.random() * 300 + 200);
                const y = this.groundY - (Math.random() * 200 + 50);
                this.addPlatform(x, y, 150, 15);
                this.platformGenerator.lastX = x;
                
                // 隨機生成金幣
                if (Math.random() < 0.7) {
                    this.addCoin(x + 75, y - 50);
                }
                
                // 隨機生成敵人
                if (Math.random() < 0.5) {
                    this.addGoomba(x + 200, this.groundY - 40);
                }
            }
        };
    }

    bindEvents() {
        // 窗口大小改變
        window.addEventListener('resize', () => this.handleResize());
        
        // 遊戲狀態變化
        document.addEventListener('marioJump', () => this.handleMarioJump());
        document.addEventListener('marioMoveLeft', () => this.handleMarioMove('left'));
        document.addEventListener('marioMoveRight', () => this.handleMarioMove('right'));
        document.addEventListener('marioStopMove', () => this.handleMarioStopMove());
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 120;
        this.groundY = this.canvas.height - 100;
        
        // 更新瑪莉歐地面位置
        if (this.mario) {
            this.mario.groundY = this.groundY;
            if (this.mario.y > this.groundY - 40) {
                this.mario.y = this.groundY - 40;
            }
        }
        
        // 更新平台
        this.platforms.forEach(platform => {
            if (platform.y > this.groundY - 20) {
                platform.y = this.groundY - 20;
            }
        });
    }

    // 遊戲開始
    start() {
        if (this.gameState !== 'playing') {
            this.gameState = 'playing';
            this.isRunning = true;
            this.gameTime = 0;
            this.loop();
        }
    }

    // 遊戲暫停
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.isRunning = false;
        }
    }

    // 遊戲恢復
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.isRunning = true;
            this.loop();
        }
    }

    // 遊戲結束
    gameOver() {
        this.gameState = 'gameOver';
        this.isRunning = false;
        
        // 停止所有動畫
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 發送遊戲結束事件
        document.dispatchEvent(new CustomEvent('gameOver', {
            detail: {
                score: this.score,
                coins: this.coins,
                time: this.gameTime,
                level: this.level
            }
        }));
    }

    // 重置遊戲
    reset() {
        this.score = 0;
        this.coins = 0;
        this.gameTime = 0;
        this.level = 1;
        this.gameState = 'menu';
        this.camera.x = 0;
        this.camera.y = 0;
        this.shakeIntensity = 0;
        this.flashIntensity = 0;
        
        this.createMario();
        this.generateInitialLevel();
        this.setupGenerators();
    }

    // 主遊戲循環
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // 更新遊戲
        this.update(deltaTime);
        
        // 繪製遊戲
        this.draw();
        
        // 繼續循環
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    // 更新遊戲邏輯
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // 更新時間
        this.gameTime += deltaTime;
        
        // 更新瑪莉歐
        if (this.mario) {
            this.mario.update(deltaTime);
            this.updateCamera();
        }
        
        // 更新敵人
        this.updateEnemies(deltaTime);
        
        // 更新道具和金幣
        this.updateCollectibles(deltaTime);
        
        // 更新特效
        this.updateEffects(deltaTime);
        
        // 更新粒子系統
        this.updateParticles(deltaTime);
        
        // 碰撞檢測
        this.checkCollisions();
        
        // 生成新內容
        this.generateContent();
        
        // 清理遠離的物件
        this.cleanup();
        
        // 檢查瑪莉歐狀態
        this.checkMarioStatus();
    }

    updateCamera() {
        // 追蹤瑪莉歐
        const targetX = this.mario.x - this.canvas.width * 0.3;
        this.camera.x += (targetX - this.camera.x) * 0.05;
        
        // 限制相機位置
        this.camera.x = Math.max(0, this.camera.x);
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            // 移動敵人
            enemy.x += enemy.velocityX * enemy.speed;
            
            // 重力影響
            if (enemy.y + enemy.height < this.groundY) {
                enemy.velocityY += this.gravity;
                enemy.y += enemy.velocityY;
            } else {
                enemy.y = this.groundY - enemy.height;
                enemy.velocityY = 0;
            }
            
            // 平台邊緣檢測
            this.checkPlatformEdges(enemy);
        });
    }

    checkPlatformEdges(enemy) {
        // 檢查是否在平台邊緣
        const platformBelow = this.platforms.find(platform => {
            return enemy.x + enemy.width > platform.x &&
                   enemy.x < platform.x + platform.width &&
                   enemy.y + enemy.height >= platform.y &&
                   enemy.y + enemy.height <= platform.y + platform.height + 20;
        });
        
        if (!platformBelow) {
            // 在邊緣，改變方向
            enemy.velocityX *= -1;
        }
        
        // 牆壁碰撞
        if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
            enemy.velocityX *= -1;
        }
    }

    updateCollectibles(deltaTime) {
        this.collectibles.forEach(item => {
            if (item.collected) return;
            
            // 彈跳動畫
            if (item.bobOffset !== undefined) {
                item.bobOffset += deltaTime * 0.005;
                item.y += Math.sin(item.bobOffset) * 0.5;
            }
            
            // 旋轉動畫（針對金幣）
            if (item.type === 'coin') {
                item.rotation += deltaTime * 0.01;
            }
            
            // 蘑菇動畫
            if (item.type === 'mushroom') {
                item.animation += deltaTime * 0.003;
            }
        });
    }

    updateEffects(deltaTime) {
        // 震動效果
        if (this.shakeIntensity > 0) {
            this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * 0.01);
        }
        
        // 閃爍效果
        if (this.flashIntensity > 0) {
            this.flashIntensity = Math.max(0, this.flashIntensity - deltaTime * 0.005);
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
    }

    // 碰撞檢測
    checkCollisions() {
        if (!this.mario) return;
        
        // 瑪莉歐與敵人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkCollision(this.mario.getBounds(), enemy)) {
                this.handleMarioEnemyCollision(enemy);
            }
        });
        
        // 瑪莉歐與道具碰撞
        this.collectibles.forEach(item => {
            if (item.collected) return;
            
            if (this.checkCollision(this.mario.getBounds(), item)) {
                this.handleMarioCollectibleCollision(item);
            }
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    handleMarioEnemyCollision(enemy) {
        // 檢查是否從上方踩踏
        const marioBottom = this.mario.y + this.mario.height;
        const enemyTop = enemy.y;
        const isStomp = marioBottom - enemyTop < 20 && this.mario.velocityY > 0;
        
        if (isStomp) {
            // 踩踏敵人
            enemy.alive = false;
            this.mario.velocityY = -8; // 小跳
            this.score += 200;
            this.createDeathParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.playSound('stomp');
        } else if (!this.mario.invulnerable) {
            // 被敵人撞到
            this.handleMarioDamage();
        }
    }

    handleMarioCollectibleCollision(item) {
        item.collected = true;
        
        switch (item.type) {
            case 'coin':
                this.coins++;
                this.score += item.value;
                this.createCoinParticles(item.x + item.width/2, item.y + item.height/2);
                break;
                
            case 'mushroom':
                this.mario.collectPowerUp('mushroom');
                this.score += item.value;
                this.createPowerUpParticles(item.x + item.width/2, item.y + item.height/2);
                break;
        }
        
        this.playSound(item.type);
    }

    handleMarioDamage() {
        const gameOver = this.mario.takeDamage();
        
        if (gameOver) {
            this.gameOver();
        } else {
            // 閃爍和震動效果
            this.shakeIntensity = 500;
            this.flashIntensity = 1000;
            this.playSound('damage');
        }
    }

    generateContent() {
        // 生成新平台
        if (this.platformGenerator && 
            this.mario.x > this.platformGenerator.lastX - 500) {
            this.platformGenerator.generate();
        }
    }

    cleanup() {
        // 清理遠離相機的物件
        const maxDistance = this.canvas.width + 1000;
        
        this.enemies = this.enemies.filter(enemy => 
            enemy.alive && enemy.x > this.camera.x - maxDistance
        );
        
        this.collectibles = this.collectibles.filter(item =>
            !item.collected && item.x > this.camera.x - maxDistance
        );
    }

    checkMarioStatus() {
        // 檢查瑪莉歐是否掉出畫面
        if (this.mario.y > this.canvas.height + 100) {
            this.handleMarioDamage();
        }
    }

    // 繪製遊戲
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景
        this.drawBackground();
        
        // 應用震動效果
        this.ctx.save();
        if (this.shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 0.01;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 0.01;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // 繪製平台
        this.drawPlatforms();
        
        // 繪製道具和金幣
        this.drawCollectibles();
        
        // 繪製敵人
        this.drawEnemies();
        
        // 繪製瑪莉歐
        if (this.mario) {
            this.ctx.save();
            this.ctx.translate(-this.camera.x, 0);
            this.mario.draw();
            this.ctx.restore();
        }
        
        // 繪製粒子
        this.drawParticles();
        
        this.ctx.restore();
        
        // 閃爍效果
        if (this.flashIntensity > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity / 1000})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawBackground() {
        // 天空漸變
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#8B4513');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 雲朵
        this.drawClouds();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudY = 50 + Math.sin(this.gameTime * 0.0001) * 10;
        
        // 雲朵1
        this.drawCloud(200 - this.camera.x * 0.5, cloudY, 60);
        // 雲朵2
        this.drawCloud(400 - this.camera.x * 0.3, cloudY + 30, 80);
        // 雲朵3
        this.drawCloud(600 - this.camera.x * 0.2, cloudY - 20, 50);
    }

    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.4, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPlatforms() {
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        this.platforms.forEach(platform => {
            if (platform.x + platform.width > this.camera.x - 100 &&
                platform.x < this.camera.x + this.canvas.width + 100) {
                
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // 平台邊緣
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(platform.x, platform.y + platform.height - 3, platform.width, 3);
            }
        });
        
        this.ctx.restore();
    }

    drawEnemies() {
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (enemy.x + enemy.width > this.camera.x - 100 &&
                enemy.x < this.camera.x + this.canvas.width + 100) {
                this.drawGoomba(enemy);
            }
        });
        
        this.ctx.restore();
    }

    drawGoomba(enemy) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // 身體
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 眼睛
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 8, y + 10, 6, 6);
        this.ctx.fillRect(x + w - 14, y + 10, 6, 6);
        
        // 嘴巴
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 8, y + 20, w - 16, 4);
        
        // 腳
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x + 5, y + h - 8, 8, 6);
        this.ctx.fillRect(x + w - 13, y + h - 8, 8, 6);
    }

    drawCollectibles() {
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        this.collectibles.forEach(item => {
            if (item.collected) return;
            
            if (item.x + item.width > this.camera.x - 100 &&
                item.x < this.camera.x + this.canvas.width + 100) {
                
                switch (item.type) {
                    case 'coin':
                        this.drawCoin(item);
                        break;
                    case 'mushroom':
                        this.drawMushroom(item);
                        break;
                }
            }
        });
        
        this.ctx.restore();
    }

    drawCoin(coin) {
        const x = coin.x;
        const y = coin.y;
        const w = coin.width;
        const h = coin.height;
        
        this.ctx.save();
        this.ctx.translate(x + w/2, y + h/2);
        this.ctx.rotate(coin.rotation);
        this.ctx.translate(-w/2, -h/2);
        
        // 金幣外圈
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 金幣內圈
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 金幣符號
        this.ctx.fillStyle = '#8B4513';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('₿', w/2, h/2 + 4);
        
        this.ctx.restore();
    }

    drawMushroom(mushroom) {
        const x = mushroom.x;
        const y = mushroom.y;
        const w = mushroom.width;
        const h = mushroom.height;
        
        // 蘑菇帽
        this.ctx.fillStyle = '#FF4444';
        this.ctx.beginPath();
        this.ctx.ellipse(x + w/2, y + h/3, w/2, h/3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 白點
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x + w*0.3, y + h*0.2, 3, 0, Math.PI * 2);
        this.ctx.arc(x + w*0.7, y + h*0.15, 2, 0, Math.PI * 2);
        this.ctx.arc(x + w*0.5, y + h*0.25, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 蘑菇莖
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(x + w*0.3, y + h*0.3, w*0.4, h*0.6);
        
        // 陰影
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + w/2, y + h + 3, w/2, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawParticles() {
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        
        this.ctx.restore();
    }

    // 粒子效果
    createCoinParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new CoinParticle(x, y));
        }
    }

    createPowerUpParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push(new PowerUpParticle(x, y));
        }
    }

    createDeathParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new DeathParticle(x, y));
        }
    }

    // 音效
    playSound(soundName) {
        if (this.soundEnabled) {
            console.log(`Playing sound: ${soundName}`);
            // 這裡可以添加實際的音效播放邏輯
        }
    }

    // 事件處理器
    handleMarioJump() {
        if (this.gameState === 'playing' && this.mario) {
            this.mario.jump();
        }
    }

    handleMarioMove(direction) {
        if (this.gameState === 'playing' && this.mario) {
            this.mario.move(direction);
        }
    }

    handleMarioStopMove() {
        if (this.gameState === 'playing' && this.mario) {
            this.mario.stopMoving();
        }
    }

    // 獲取遊戲狀態
    getGameState() {
        return {
            state: this.gameState,
            score: this.score,
            coins: this.coins,
            time: Math.floor(this.gameTime / 1000),
            level: this.level,
            marioLives: this.mario ? this.mario.lives : 3
        };
    }
}

// 粒子類
class CoinParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = Math.random() * -3 - 1;
        this.life = 1000;
        this.maxLife = 1000;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.1; // 重力
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.restore();
    }
}

class PowerUpParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 6;
        this.velocityY = Math.random() * -4 - 2;
        this.life = 1500;
        this.maxLife = 1500;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class DeathParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 8;
        this.velocityY = Math.random() * -5 - 2;
        this.life = 2000;
        this.maxLife = 2000;
        this.size = Math.random() * 4 + 2;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.15;
        this.velocityX *= 0.99;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// 導出Game類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, CoinParticle, PowerUpParticle, DeathParticle };
}