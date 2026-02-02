/**
 * 瑪莉歐觸控遊戲主程序
 * 管理所有遊戲組件、UI界面和遊戲流程
 */
class MarioTouchGame {
    constructor() {
        // DOM元素
        this.canvas = null;
        this.gameContainer = null;
        this.loadingScreen = null;
        this.gameMenu = null;
        this.gameCanvas = null;
        
        // 遊戲組件
        this.game = null;
        this.controls = null;
        
        // UI狀態
        this.currentScreen = 'loading'; // 'loading', 'menu', 'playing', 'gameOver'
        this.settings = {
            volume: 50,
            sensitivity: 5,
            assistMode: false
        };
        
        // 統計數據
        this.stats = {
            gamesPlayed: 0,
            totalScore: 0,
            totalCoins: 0,
            totalTime: 0
        };
        
        // 初始化
        this.init();
    }

    init() {
        console.log('🍄 開始初始化觸控瑪莉歐遊戲...');
        
        // 等待DOM加載完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            // 獲取DOM元素
            this.canvas = document.getElementById('gameCanvas');
            this.gameContainer = document.getElementById('gameContainer');
            this.loadingScreen = document.getElementById('loadingScreen');
            this.gameMenu = document.getElementById('gameMenu');
            
            if (!this.canvas) {
                throw new Error('找不到遊戲畫布元素');
            }
            
            // 設置畫布
            this.setupCanvas();
            
            // 初始化遊戲組件
            this.initGameComponents();
            
            // 設置UI事件
            this.setupUIEvents();
            
            // 設置事件監聽器
            this.setupEventListeners();
            
            // 載入設置
            this.loadSettings();
            
            // 開始載入動畫
            this.startLoadingAnimation();
            
            // 完成初始化
            setTimeout(() => {
                this.completeInitialization();
            }, 3000);
            
        } catch (error) {
            console.error('❌ 初始化失敗:', error);
            this.showError('遊戲初始化失敗，請重新整理頁面');
        }
    }

    setupCanvas() {
        // 設置畫布尺寸
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 120; // 扣除標題欄高度
        
        // 設置畫布樣式
        this.canvas.style.touchAction = 'none';
        this.canvas.style.userSelect = 'none';
        
        // 防止上下文菜單
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    initGameComponents() {
        // 初始化遊戲邏輯
        this.game = new Game(this.canvas);
        
        // 初始化控制系統
        this.controls = new Controls(this.canvas, this.game);
        
        // 初始化進度系統（3A級Progression System）
        this.progression = new ProgressionSystem(this.game);
        this.game.progression = this.progression;
        
        // 初始化關卡生成系統（3A級Content Generation）
        this.levelGenerator = new LevelGenerator(this.game);
        this.game.levelGenerator = this.levelGenerator;
        
        // 初始化視覺效果系統（3A級Visual Effects）
        this.visualEffects = new VisualEffectsSystem(this.canvas);
        this.game.visualEffects = this.visualEffects;
        
        // 初始化現代化UI系統（3A級UI System）
        this.uiSystem = new ModernUISystem(this.game);
        this.game.uiSystem = this.uiSystem;
        
        // 初始化音效系統（3A級Audio System）
        this.audioSystem = new AudioSystem();
        this.game.audioSystem = this.audioSystem;
        
        // 初始化天氣系統（3A級Weather System）
        this.weatherSystem = new WeatherSystem(this.canvas, this.game);
        this.game.weatherSystem = this.weatherSystem;
    }

    setupUIEvents() {
        // 主菜單按鈕
        const startBtn = document.getElementById('startBtn');
        const instructionsBtn = document.getElementById('instructionsBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => this.showInstructions());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // 彈窗事件
        this.setupModalEvents();
        
        // 設定滑桿
        this.setupSettingsControls();
    }

    setupModalEvents() {
        // 操作說明彈窗
        const instructionsModal = document.getElementById('instructionsModal');
        const instructionsCloseBtns = instructionsModal?.querySelectorAll('.modal-close-btn, .close-btn');
        
        instructionsCloseBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.hideModal('instructionsModal'));
        });

        // 遊戲結束彈窗
        const gameOverModal = document.getElementById('gameOverModal');
        const restartBtn = document.getElementById('restartBtn');
        const menuBtn = document.getElementById('menuBtn');
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.goToMenu());
        }

        // 設定彈窗
        const settingsModal = document.getElementById('settingsModal');
        const settingsCloseBtns = settingsModal?.querySelectorAll('.modal-close-btn, .close-btn');
        
        settingsCloseBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal('settingsModal');
                this.saveSettings();
            });
        });
        
        // 點擊外部關閉彈窗
        [instructionsModal, gameOverModal, settingsModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modal.id);
                    }
                });
            }
        });
    }

    setupSettingsControls() {
        // 音量控制
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.settings.volume = value;
                volumeValue.textContent = value + '%';
                this.updateAudioSettings();
            });
        }
        
        // 靈敏度控制
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const sensitivityValue = document.getElementById('sensitivityValue');
        
        if (sensitivitySlider && sensitivityValue) {
            const sensitivityNames = ['極低', '很低', '低', '偏低', '中', '偏高', '高', '很高', '極高', '超級'];
            
            sensitivitySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.settings.sensitivity = value;
                sensitivityValue.textContent = sensitivityNames[value - 1];
                this.controls?.setSensitivity(value);
            });
        }
        
        // 輔助模式
        const assistMode = document.getElementById('assistMode');
        if (assistMode) {
            assistMode.addEventListener('change', (e) => {
                this.settings.assistMode = e.target.checked;
                this.controls?.setAssistMode(e.target.checked);
            });
        }
    }

    setupEventListeners() {
        // 遊戲事件
        document.addEventListener('marioJump', () => {
            this.updateGameStats();
        });
        
        document.addEventListener('gameOver', (e) => {
            this.handleGameOver(e.detail);
        });
        
        document.addEventListener('togglePause', () => {
            this.togglePause();
        });
        
        // 窗口大小變化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 可見性變化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    startLoadingAnimation() {
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            // 模擬載入進度
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20 + 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressBar.style.width = progress + '%';
            }, 200);
        }
    }

    completeInitialization() {
        console.log('✅ 遊戲初始化完成');
        
        // 隱藏載入畫面
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }
        
        // 顯示主菜單
        if (this.gameContainer) {
            this.gameContainer.style.display = 'block';
        }
        
        if (this.gameMenu) {
            this.gameMenu.style.display = 'flex';
        }
        
        this.currentScreen = 'menu';
        
        // 應用設置
        this.applySettings();
    }

    startGame() {
        console.log('🚀 開始遊戲');
        
        // 重置遊戲
        this.game?.reset();
        
        // 更新UI
        this.hideMenu();
        this.updateScoreDisplay();
        
        // 開始遊戲
        this.game?.start();
        this.currentScreen = 'playing';
        
        // 更新統計
        this.stats.gamesPlayed++;
        
        // 隱藏控制說明
        this.hideControlsInfo();
    }

    showInstructions() {
        this.showModal('instructionsModal');
    }

    showSettings() {
        this.showModal('settingsModal');
        
        // 更新設定顯示
        this.updateSettingsDisplay();
    }

    togglePause() {
        if (this.currentScreen === 'playing') {
            if (this.game?.gameState === 'playing') {
                this.game.pause();
                this.showPauseOverlay();
            } else if (this.game?.gameState === 'paused') {
                this.game.resume();
                this.hidePauseOverlay();
            }
        }
    }

    restartGame() {
        this.hideModal('gameOverModal');
        this.startGame();
    }

    goToMenu() {
        this.hideModal('gameOverModal');
        this.showMenu();
        this.currentScreen = 'menu';
    }

    showMenu() {
        if (this.gameMenu) {
            this.gameMenu.style.display = 'flex';
        }
        
        // 停止遊戲
        if (this.game) {
            this.game.reset();
        }
        
        // 顯示控制說明
        this.showControlsInfo();
    }

    hideMenu() {
        if (this.gameMenu) {
            this.gameMenu.style.display = 'none';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showControlsInfo() {
        const controls = document.getElementById('gameControls');
        if (controls) {
            controls.style.display = 'block';
            controls.classList.add('visible');
        }
    }

    hideControlsInfo() {
        const controls = document.getElementById('gameControls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    showPauseOverlay() {
        // 創建暫停覆蓋層
        const overlay = document.createElement('div');
        overlay.id = 'pauseOverlay';
        overlay.className = 'pause-overlay';
        overlay.innerHTML = `
            <div class="pause-content">
                <h2>⏸️ 遊戲暫停</h2>
                <p>點擊任意位置繼續</p>
                <button onclick="app.resumeGame()">繼續</button>
            </div>
        `;
        
        // 添加樣式
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        document.body.appendChild(overlay);
        
        // 點擊繼續
        overlay.addEventListener('click', () => this.resumeGame());
    }

    hidePauseOverlay() {
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    resumeGame() {
        this.hidePauseOverlay();
        if (this.game?.gameState === 'paused') {
            this.game.resume();
        }
    }

    handleGameOver(gameData) {
        console.log('🎮 遊戲結束:', gameData);
        
        // 更新統計
        this.stats.totalScore += gameData.score;
        this.stats.totalCoins += gameData.coins;
        this.stats.totalTime += gameData.time;
        
        // 顯示遊戲結束彈窗
        this.updateGameOverModal(gameData);
        this.showModal('gameOverModal');
        
        this.currentScreen = 'gameOver';
    }

    updateGameOverModal(gameData) {
        document.getElementById('finalScore').textContent = gameData.score;
        document.getElementById('finalCoins').textContent = gameData.coins;
        document.getElementById('finalTime').textContent = gameData.time + '秒';
        
        // 設置遊戲結束標題
        const title = document.getElementById('gameOverTitle');
        if (gameData.score > 5000) {
            title.textContent = '🏆 驚人的表現！';
        } else if (gameData.score > 2000) {
            title.textContent = '👍 做得很好！';
        } else {
            title.textContent = '🎮 遊戲結束';
        }
    }

    updateGameStats() {
        if (this.game && this.currentScreen === 'playing') {
            const gameState = this.game.getGameState();
            
            // 更新分數顯示
            document.getElementById('scoreValue').textContent = gameState.score;
            document.getElementById('coinsValue').textContent = gameState.coins;
            document.getElementById('livesValue').textContent = gameState.marioLives;
        }
    }

    updateScoreDisplay() {
        this.updateGameStats();
    }

    updateSettingsDisplay() {
        // 更新音量控制
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        if (volumeSlider && volumeValue) {
            volumeSlider.value = this.settings.volume;
            volumeValue.textContent = this.settings.volume + '%';
        }
        
        // 更新靈敏度控制
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const sensitivityValue = document.getElementById('sensitivityValue');
        if (sensitivitySlider && sensitivityValue) {
            const sensitivityNames = ['極低', '很低', '低', '偏低', '中', '偏高', '高', '很高', '極高', '超級'];
            sensitivitySlider.value = this.settings.sensitivity;
            sensitivityValue.textContent = sensitivityNames[this.settings.sensitivity - 1];
        }
        
        // 更新輔助模式
        const assistMode = document.getElementById('assistMode');
        if (assistMode) {
            assistMode.checked = this.settings.assistMode;
        }
    }

    applySettings() {
        // 應用音量設置
        this.updateAudioSettings();
        
        // 應用靈敏度設置
        if (this.controls) {
            this.controls.setSensitivity(this.settings.sensitivity);
            this.controls.setAssistMode(this.settings.assistMode);
        }
    }

    updateAudioSettings() {
        // 更新音量設置
        if (this.game) {
            this.game.soundEnabled = this.settings.volume > 0;
        }
    }

    handleResize() {
        // 調整畫布尺寸
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight - 120;
        }
        
        // 更新控制區域
        if (this.controls) {
            this.controls.updateZones();
        }
        
        // 處理遊戲重置
        if (this.game && this.currentScreen === 'playing') {
            this.game.handleResize();
        }
    }

    handleVisibilityChange() {
        if (document.hidden && this.currentScreen === 'playing') {
            // 頁面不可見時自動暫停
            this.togglePause();
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('marioGameSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            
            const savedStats = localStorage.getItem('marioGameStats');
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.warn('無法載入設置:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('marioGameSettings', JSON.stringify(this.settings));
            localStorage.setItem('marioGameStats', JSON.stringify(this.stats));
            console.log('✅ 設置已保存');
        } catch (error) {
            console.warn('無法保存設置:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>❌ 錯誤</h3>
            <p>${message}</p>
            <button onclick="location.reload()">重新整理</button>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
        `;
        
        document.body.appendChild(errorDiv);
    }

    // 獲取遊戲統計
    getStats() {
        return { ...this.stats };
    }

    // 清理資源
    destroy() {
        if (this.controls) {
            this.controls.destroy();
        }
        
        if (this.game) {
            this.game.pause();
        }
        
        // 保存設置
        this.saveSettings();
    }
}

// 全局實例
let marioGame = null;

// 初始化遊戲
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        marioGame = new MarioTouchGame();
        window.app = marioGame; // 供調試使用
    });
} else {
    marioGame = new MarioTouchGame();
    window.app = marioGame;
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarioTouchGame;
}