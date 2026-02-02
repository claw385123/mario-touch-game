/**
 * 瑪莉歐角色類
 * 管理瑪莉歐的狀態、動作和物理引擎
 */
class Mario {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 瑪莉歐位置和大小
        this.x = 50;
        this.y = canvas.height - 150; // 起始在地面上
        this.width = 40;
        this.height = 40;
        
        // 物理屬性
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.moveSpeed = 5;
        this.friction = 0.85;
        
        // 狀態
        this.isJumping = false;
        this.isMoving = false;
        this.facingDirection = 'right'; // 'left' 或 'right'
        this.state = 'idle'; // 'idle', 'running', 'jumping', 'walking'
        
        // 動畫相關
        this.animationFrame = 0;
        this.animationSpeed = 8; // 更高的數值 = 更慢的動畫
        this.groundY = canvas.height - 150;
        
        // 遊戲狀態
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.powerUpActive = false;
        this.powerUpType = null; // 'mushroom', 'fireball', etc.
        
        // 視覺效果
        this.opacity = 1;
        this.blinkTimer = 0;
        
        // 音效相關
        this.soundEnabled = true;
    }

    update(deltaTime) {
        // 更新無敵狀態
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            this.blinkTimer += deltaTime;
            
            // 閃爍效果
            if (this.blinkTimer > 100) {
                this.blinkTimer = 0;
            }
            
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
                this.opacity = 1;
            }
        }
        
        // 更新位置
        this.applyPhysics();
        
        // 邊界檢查
        this.checkBoundaries();
        
        // 更新動畫
        this.updateAnimation(deltaTime);
        
        // 更新狀態
        this.updateState();
    }

    applyPhysics() {
        // 應用重力
        if (!this.isOnGround()) {
            this.velocityY += this.gravity;
        }
        
        // 應用摩擦力
        this.velocityX *= this.friction;
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 地面碰撞檢測
        if (this.y + this.height >= this.groundY) {
            this.y = this.groundY - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }

    checkBoundaries() {
        // 左邊界
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = Math.max(0, this.velocityX);
        }
        
        // 右邊界
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
            this.velocityX = Math.min(0, this.velocityX);
        }
        
        // 上邊界
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }
    }

    isOnGround() {
        return this.y + this.height >= this.groundY;
    }

    updateAnimation(deltaTime) {
        this.animationFrame += deltaTime / this.animationSpeed;
        
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }

    updateState() {
        if (this.isJumping) {
            this.state = 'jumping';
        } else if (Math.abs(this.velocityX) > 0.1) {
            this.state = 'running';
        } else {
            this.state = 'idle';
        }
    }

    // 跳躍
    jump() {
        if (this.isOnGround()) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
            this.state = 'jumping';
            
            // 播放跳躍音效
            if (this.soundEnabled) {
                this.playSound('jump');
            }
        }
    }

    // 移動
    move(direction) {
        const speed = this.moveSpeed;
        
        if (direction === 'left') {
            this.velocityX = -speed;
            this.facingDirection = 'left';
            this.isMoving = true;
        } else if (direction === 'right') {
            this.velocityX = speed;
            this.facingDirection = 'right';
            this.isMoving = true;
        }
    }

    // 停止移動
    stopMoving() {
        this.velocityX = 0;
        this.isMoving = false;
    }

    // 繪製瑪莉歐
    draw() {
        this.ctx.save();
        
        // 無敵狀態閃爍效果
        if (this.invulnerable && Math.floor(this.blinkTimer / 100) % 2 === 0) {
            this.opacity = 0.5;
        } else {
            this.opacity = 1;
        }
        
        this.ctx.globalAlpha = this.opacity;
        
        // 繪製瑪莉歐
        this.drawMario();
        
        this.ctx.restore();
    }

    drawMario() {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;
        
        this.ctx.save();
        
        // 如果面向左邊，翻轉畫布
        if (this.facingDirection === 'left') {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-x - w, 0);
        }
        
        // 繪製帽子 (紅色)
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(x + 8, y, 24, 8);
        this.ctx.fillRect(x + 6, y + 6, 28, 6);
        
        // 繪製臉部 (肉色)
        this.ctx.fillStyle = '#ffdbac';
        this.ctx.fillRect(x + 10, y + 8, 20, 16);
        
        // 繪製胡子 (棕色)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 14, y + 16, 12, 4);
        
        // 繪製鼻子
        this.ctx.fillStyle = '#ffdbac';
        this.ctx.fillRect(x + 18, y + 14, 4, 4);
        
        // 繪製眼睛
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 13, y + 12, 3, 3);
        this.ctx.fillRect(x + 24, y + 12, 3, 3);
        
        // 繪製身體 (藍色)
        this.ctx.fillStyle = '#4444ff';
        this.ctx.fillRect(x + 10, y + 24, 20, 12);
        
        // 繪製肚子 (肉色)
        this.ctx.fillStyle = '#ffdbac';
        this.ctx.fillRect(x + 14, y + 26, 12, 8);
        
        // 繪製手 (肉色)
        this.ctx.fillStyle = '#ffdbac';
        this.ctx.fillRect(x + 4, y + 26, 6, 8);
        this.ctx.fillRect(x + 30, y + 26, 6, 8);
        
        // 繪製褲子 (藍色)
        this.ctx.fillStyle = '#2c5aa0';
        this.ctx.fillRect(x + 10, y + 36, 8, 8);
        this.ctx.fillRect(x + 22, y + 36, 8, 8);
        
        // 繪製靴子 (棕色)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 8, y + 40, 10, 6);
        this.ctx.fillRect(x + 22, y + 40, 10, 6);
        
        // 繪製陰影
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + w/2, this.groundY + 6, w/2, 4, 0, 0, 2*Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    // 碰撞檢測
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // 碰撞到其他對象
    takeDamage() {
        if (!this.invulnerable) {
            this.lives--;
            this.invulnerable = true;
            this.invulnerabilityTime = 2000; // 2秒無敵時間
            
            // 播放受傷音效
            if (this.soundEnabled) {
                this.playSound('damage');
            }
            
            return this.lives <= 0;
        }
        return false;
    }

    // 收集道具
    collectPowerUp(type) {
        this.powerUpActive = true;
        this.powerUpType = type;
        
        // 播放道具音效
        if (this.soundEnabled) {
            this.playSound('powerup');
        }
        
        switch (type) {
            case 'mushroom':
                this.lives = Math.min(this.lives + 1, 9);
                break;
            case 'star':
                // 無敵狀態
                this.invulnerable = true;
                this.invulnerabilityTime = 10000; // 10秒
                break;
        }
    }

    // 播放音效
    playSound(soundType) {
        // 這裡可以添加音效播放邏輯
        console.log(`Playing sound: ${soundType}`);
    }

    // 設置音效
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    // 重置位置
    reset() {
        this.x = 50;
        this.y = this.groundY - this.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isMoving = false;
        this.state = 'idle';
        this.invulnerable = false;
        this.powerUpActive = false;
        this.powerUpType = null;
    }

    // 獲取當前狀態
    getState() {
        return {
            x: this.x,
            y: this.y,
            lives: this.lives,
            score: 0, // 將由遊戲主體設置
            coins: 0, // 將由遊戲主體設置
            isJumping: this.isJumping,
            isMoving: this.isMoving,
            state: this.state
        };
    }

    // 設置位置
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // 設置大小
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    // 設置移動速度
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }

    // 設置跳躍力度
    setJumpPower(power) {
        this.jumpPower = power;
    }

    // 獲取瑪莉歐的邊界框
    getBoundingBox() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    // 檢查是否與其他對象碰撞
    collidesWith(other) {
        const marioBox = this.getBoundingBox();
        const otherBox = other.getBoundingBox();
        
        return marioBox.left < otherBox.right &&
               marioBox.right > otherBox.left &&
               marioBox.top < otherBox.bottom &&
               marioBox.bottom > otherBox.top;
    }

    // 特殊能力（如果有道具）
    useSpecialAbility() {
        if (this.powerUpActive && this.powerUpType === 'fireball') {
            // 發射火球
            return true;
        }
        return false;
    }

    // 動畫特效
    addSpecialEffect(effect) {
        // 添加特效，如顆粒、火焰等
        console.log(`Adding effect: ${effect}`);
    }

    // 獲取當前的視覺狀態
    getVisualState() {
        return {
            opacity: this.opacity,
            state: this.state,
            facingDirection: this.facingDirection,
            hasPowerUp: this.powerUpActive,
            powerUpType: this.powerUpType
        };
    }
}

// 導出瑪莉歐類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mario;
}