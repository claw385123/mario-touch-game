/**
 * 3A級音效與音樂系統
 * 完整的遊戲音頻體驗
 */
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.muted = false;
        
        // 音頻初始化
        this.init();
    }
    
    init() {
        try {
            // 初始化 Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 創建音效
            this.createSounds();
            
            // 設置音樂循環
            this.setupMusicLoop();
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    createSounds() {
        // 遊戲音效
        this.sounds = {
            // UI 音效
            buttonClick: this.generateTone(800, 0.1, 'sine'),
            buttonHover: this.generateTone(600, 0.05, 'triangle'),
            menuOpen: this.generateTone(400, 0.3, 'sawtooth'),
            menuClose: this.generateTone(300, 0.2, 'sawtooth'),
            
            // 瑪莉歐動作音效
            jump: this.generateJumpSound(),
            doubleJump: this.generateDoubleJumpSound(),
            land: this.generateLandSound(),
            powerUp: this.generatePowerUpSound(),
            coin: this.generateCoinSound(),
            damage: this.generateDamageSound(),
            death: this.generateDeathSound(),
            
            // 環境音效
            levelStart: this.generateLevelStartSound(),
            levelComplete: this.generateLevelCompleteSound(),
            secretFound: this.generateSecretFoundSound(),
            
            // 敵人音效
            enemyDefeated: this.generateEnemyDefeatedSound(),
            enemyApproach: this.generateEnemyApproachSound(),
            
            // 道具音效
            mushroom: this.generateMushroomSound(),
            star: this.generateStarSound(),
            fire: this.generateFireSound(),
            
            // 環境音效
            footstep: this.generateFootstepSound(),
            waterSplash: this.generateWaterSplashSound(),
            fireBreath: this.generateFireBreathSound()
        };
        
        // 背景音樂
        this.music = {
            mainTheme: this.generateMainTheme(),
            level1: this.generateLevel1Music(),
            level2: this.generateLevel2Music(),
            level3: this.generateLevel3Music(),
            boss: this.generateBossMusic(),
            victory: this.generateVictoryMusic(),
            gameOver: this.generateGameOverMusic()
        };
    }
    
    // ==================== 音效生成 ====================
    
    generateTone(frequency, duration, waveType = 'sine') {
        return (context) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(frequency, context.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * this.sfxVolume * 0.3, context.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + duration);
        };
    }
    
    generateJumpSound() {
        return (context) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(400, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, context.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
        };
    }
    
    generateDoubleJumpSound() {
        return (context) => {
            // 兩層音調
            this.generateTone(600, 0.2, 'sine')(context);
            setTimeout(() => this.generateTone(800, 0.15, 'triangle')(context), 50);
        };
    }
    
    generateLandSound() {
        return (context) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(200, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.1);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.2);
        };
    }
    
    generatePowerUpSound() {
        return (context) => {
            const frequencies = [330, 440, 550, 660, 880];
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.1, 'sine')(context);
                }, index * 80);
            });
        };
    }
    
    generateCoinSound() {
        return (context) => {
            // 清脆的鈴聲
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(1000, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1500, context.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
        };
    }
    
    generateDamageSound() {
        return (context) => {
            // 低沉的衝擊聲
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.setValueAtTime(150, context.currentTime);
            oscillator.frequency.linearRampToValueAtTime(80, context.currentTime + 0.3);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, context.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.5);
        };
    }
    
    generateDeathSound() {
        return (context) => {
            // 悲傷的下行音階
            const frequencies = [800, 600, 400, 300, 200, 150];
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.4, 'sawtooth')(context);
                }, index * 150);
            });
        };
    }
    
    generateLevelCompleteSound() {
        return (context) => {
            // 勝利的旋律
            const melody = [523, 659, 784, 1047, 784, 659, 523];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.5, 'sine')(context);
                }, index * 200);
            });
        };
    }
    
    generateEnemyDefeatedSound() {
        return (context) => {
            // 短促的打擊聲
            this.generateTone(300, 0.1, 'square')(context);
            setTimeout(() => this.generateTone(250, 0.15, 'triangle')(context), 50);
        };
    }
    
    generateMainTheme() {
        return (context) => {
            // 主題音樂（簡化版本）
            const melody = [
                { freq: 523, duration: 0.5 },
                { freq: 659, duration: 0.5 },
                { freq: 784, duration: 0.5 },
                { freq: 1047, duration: 1.0 },
                { freq: 784, duration: 0.5 },
                { freq: 659, duration: 0.5 },
                { freq: 523, duration: 1.0 }
            ];
            
            let time = 0;
            melody.forEach(note => {
                setTimeout(() => {
                    this.generateTone(note.freq, note.duration, 'sine')(context);
                }, time * 1000);
                time += note.duration;
            });
        };
    }
    
    generateLevel1Music() {
        return (context) => {
            // 輕快的關卡音樂
            const melody = [440, 523, 659, 523, 440, 523, 659, 784];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.8, 'triangle')(context);
                }, index * 400);
            });
        };
    }
    
    generateLevel2Music() {
        return (context) => {
            // 略帶挑戰性的音樂
            const melody = [554, 659, 740, 659, 554, 659, 740, 831];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.6, 'sawtooth')(context);
                }, index * 350);
            });
        };
    }
    
    generateLevel3Music() {
        return (context) => {
            // 緊張的音樂
            const melody = [587, 698, 831, 698, 587, 698, 831, 932];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.7, 'square')(context);
                }, index * 300);
            });
        };
    }
    
    generateBossMusic() {
        return (context) => {
            // 激烈的Boss戰音樂
            const melody = [330, 440, 330, 554, 440, 330, 415, 330];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.9, 'sawtooth')(context);
                }, index * 250);
            });
        };
    }
    
    generateVictoryMusic() {
        return (context) => {
            // 勝利音效
            const melody = [523, 659, 784, 1047, 1319, 1047, 784, 1319, 1047, 784, 659, 523];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.4, 'sine')(context);
                }, index * 150);
            });
        };
    }
    
    generateGameOverMusic() {
        return (context) => {
            // 失敗音效
            const melody = [415, 349, 293, 247, 207];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    this.generateTone(freq, 0.8, 'sawtooth')(context);
                }, index * 300);
            });
        };
    }
    
    // 輔助音效生成方法
    generateDoubleJumpSound() { return this.generateTone(800, 0.2, 'triangle'); }
    generateLevelStartSound() { return this.generateTone(600, 0.5, 'sine'); }
    generateSecretFoundSound() { return this.generateTone(1200, 0.3, 'sine'); }
    generateEnemyApproachSound() { return this.generateTone(200, 0.1, 'square'); }
    generateMushroomSound() { return this.generatePowerUpSound(); }
    generateStarSound() { return this.generatePowerUpSound(); }
    generateFireSound() { return this.generateTone(300, 0.4, 'sawtooth'); }
    generateFootstepSound() { return this.generateTone(150, 0.1, 'square'); }
    generateWaterSplashSound() { return this.generateTone(400, 0.3, 'sine'); }
    generateFireBreathSound() { return this.generateTone(250, 0.6, 'sawtooth'); }
    
    // ==================== 音樂播放控制 ====================
    
    setupMusicLoop() {
        // 設置音樂循環
        this.currentMusicLoop = null;
    }
    
    playMusic(musicName, loop = true) {
        if (!this.audioContext || this.muted) return;
        
        // 停止當前音樂
        this.stopMusic();
        
        const musicGenerator = this.music[musicName];
        if (musicGenerator) {
            this.currentMusic = {
                name: musicName,
                loop: loop,
                playing: true
            };
            
            if (loop) {
                this.currentMusicLoop = setInterval(() => {
                    if (this.currentMusic && this.currentMusic.playing) {
                        musicGenerator(this.audioContext);
                    }
                }, 8000); // 8秒循環
            } else {
                musicGenerator(this.audioContext);
            }
        }
    }
    
    stopMusic() {
        if (this.currentMusicLoop) {
            clearInterval(this.currentMusicLoop);
            this.currentMusicLoop = null;
        }
        
        if (this.currentMusic) {
            this.currentMusic.playing = false;
        }
    }
    
    playSound(soundName) {
        if (!this.audioContext || this.muted) return;
        
        const soundGenerator = this.sounds[soundName];
        if (soundGenerator) {
            soundGenerator(this.audioContext);
        }
    }
    
    // ==================== 音量控制 ====================
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    mute() {
        this.muted = true;
        this.stopMusic();
        this.saveSettings();
    }
    
    unmute() {
        this.muted = false;
        this.saveSettings();
    }
    
    toggleMute() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
    
    // ==================== 3D 空間音效 ====================
    
    playSound3D(soundName, x, y, listenerX = 0, listenerY = 0) {
        if (!this.audioContext || this.muted) return;
        
        // 計算距離
        const distance = Math.sqrt(Math.pow(x - listenerX, 2) + Math.pow(y - listenerY, 2));
        const maxDistance = 500; // 最大聽距
        
        if (distance > maxDistance) return;
        
        // 距離衰減
        const volume = Math.max(0, 1 - (distance / maxDistance));
        
        // 創建帶有立體聲定位的音效
        const soundGenerator = this.sounds[soundName];
        if (soundGenerator) {
            const context = this.audioContext;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            const panner = context.createStereoPanner();
            
            oscillator.connect(gainNode);
            gainNode.connect(panner);
            panner.connect(context.destination);
            
            // 立體聲定位
            const pan = Math.max(-1, Math.min(1, (x - listenerX) / maxDistance));
            panner.pan.setValueAtTime(pan, context.currentTime);
            
            // 音量衰減
            gainNode.gain.setValueAtTime(volume * this.masterVolume * this.sfxVolume, context.currentTime);
            
            // 播放基本音效（簡化版本）
            soundGenerator(context);
        }
    }
    
    // ==================== 設置保存 ====================
    
    saveSettings() {
        try {
            const settings = {
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                muted: this.muted
            };
            localStorage.setItem('marioAudioSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save audio settings:', error);
        }
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('marioAudioSettings'));
            if (settings) {
                this.masterVolume = settings.masterVolume ?? this.masterVolume;
                this.musicVolume = settings.musicVolume ?? this.musicVolume;
                this.sfxVolume = settings.sfxVolume ?? this.sfxVolume;
                this.muted = settings.muted ?? this.muted;
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
    }
    
    // ==================== 便捷方法 ====================
    
    // 遊戲事件對應的音效
    playUISound(type) {
        this.playSound(`button${type.charAt(0).toUpperCase() + type.slice(1)}`);
    }
    
    playGameSound(type, data = {}) {
        switch(type) {
            case 'jump':
                this.playSound('jump');
                break;
            case 'doubleJump':
                this.playSound('doubleJump');
                break;
            case 'land':
                this.playSound('land');
                break;
            case 'coin':
                this.playSound('coin');
                break;
            case 'powerUp':
                this.playSound('powerUp');
                break;
            case 'damage':
                this.playSound('damage');
                break;
            case 'death':
                this.playSound('death');
                break;
            case 'enemyDefeated':
                this.playSound('enemyDefeated');
                break;
            case 'levelComplete':
                this.playSound('levelComplete');
                break;
            case 'levelStart':
                this.playSound('levelStart');
                break;
        }
    }
    
    // 3D 音效便捷方法
    playSoundAtPosition(soundName, gameX, gameY, cameraX = 0, cameraY = 0) {
        this.playSound3D(soundName, gameX, gameY, cameraX, cameraY);
    }
    
    // 獲取當前狀態
    getStatus() {
        return {
            currentMusic: this.currentMusic?.name,
            playing: this.currentMusic?.playing,
            muted: this.muted,
            volumes: {
                master: this.masterVolume,
                music: this.musicVolume,
                sfx: this.sfxVolume
            }
        };
    }
    
    // 清理資源
    destroy() {
        this.stopMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}