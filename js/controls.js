/**
 * 觸控控制系統
 * 管理手機觸控、鍵盤輸入和手勢識別
 */
class Controls {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.context = canvas.getContext('2d');
        
        // 觸控狀態
        this.touches = new Map();
        this.touchStart = null;
        this.isSwiping = false;
        this.swipeThreshold = 30; // 滑動閾值
        this.lastTouchTime = 0;
        
        // 手勢狀態
        this.gestureStart = null;
        this.gestureEnd = null;
        this.longPressTimeout = null;
        this.isLongPress = false;
        
        // 響應區域
        this.zones = {
            left: { x: 0, y: 0, width: 100, height: this.canvas.height },
            right: { x: this.canvas.width - 100, y: 0, width: 100, height: this.canvas.height },
            jump: { x: 100, y: 0, width: this.canvas.width - 200, height: this.canvas.height }
        };
        
        // 控制視覺反饋
        this.visualFeedback = {
            left: { active: false, opacity: 0 },
            right: { active: false, opacity: 0 },
            jump: { active: false, opacity: 0 }
        };
        
        // 靈敏度設定
        this.sensitivity = 5;
        this.assistMode = false;
        
        // 初始化
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.updateZones();
    }

    setupEventListeners() {
        // 觸控事件
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
        
        // 防止默認行為
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
        this.canvas.addEventListener('touchend', (e) => e.preventDefault());
        
        // 滑鼠事件（用於測試）
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // 視窗大小變化
        window.addEventListener('resize', this.updateZones.bind(this));
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    this.triggerJump();
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.triggerMove('left');
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.triggerMove('right');
                    break;
                case 'Escape':
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.triggerStopMove('left');
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.triggerStopMove('right');
                    break;
            }
        });
    }

    updateZones() {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.zones.left = {
            x: 0, y: 0,
            width: Math.min(150, this.canvas.width * 0.2),
            height: this.canvas.height
        };
        
        this.zones.right = {
            x: this.canvas.width - Math.min(150, this.canvas.width * 0.2),
            y: 0,
            width: Math.min(150, this.canvas.width * 0.2),
            height: this.canvas.height
        };
        
        this.zones.jump = {
            x: Math.min(150, this.canvas.width * 0.2),
            y: 0,
            width: this.canvas.width - Math.min(150, this.canvas.width * 0.2) * 2,
            height: this.canvas.height
        };
    }

    // 觸控事件處理
    handleTouchStart(e) {
        const touch = e.touches[0];
        const pos = this.getTouchPosition(touch);
        
        this.touchStart = pos;
        this.gestureStart = pos;
        this.touches.set(touch.identifier, pos);
        
        // 檢查長按
        this.setupLongPress(pos);
        
        // 更新最後觸控時間
        this.lastTouchTime = Date.now();
        
        // 處理手勢
        this.handleGestureStart(pos);
        
        e.preventDefault();
    }

    handleTouchMove(e) {
        const touch = e.touches[0];
        if (!touch) return;
        
        const pos = this.getTouchPosition(touch);
        this.touches.set(touch.identifier, pos);
        
        // 取消長按如果正在移動
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
        
        // 檢查是否為滑動
        this.checkSwipe(pos);
        
        e.preventDefault();
    }

    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        if (!touch) return;
        
        const pos = this.getTouchPosition(touch);
        
        // 取消長按
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
        
        // 處理手勢結束
        this.handleGestureEnd(pos);
        
        // 清理觸控
        this.touches.delete(touch.identifier);
        
        if (this.touches.size === 0) {
            this.touchStart = null;
            this.isSwiping = false;
            this.stopAllMovement();
        }
        
        e.preventDefault();
    }

    // 滑鼠事件處理（測試用）
    handleMouseDown(e) {
        const pos = this.getMousePosition(e);
        this.touchStart = pos;
        this.gestureStart = pos;
    }

    handleMouseMove(e) {
        const pos = this.getMousePosition(e);
        
        if (this.touchStart && !this.longPressTimeout) {
            this.checkSwipe(pos);
        }
    }

    handleMouseUp(e) {
        const pos = this.getMousePosition(e);
        this.handleGestureEnd(pos);
        this.touchStart = null;
        this.isSwiping = false;
        this.stopAllMovement();
    }

    getTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    setupLongPress(pos) {
        this.longPressTimeout = setTimeout(() => {
            this.isLongPress = true;
            this.handleLongPress(pos);
        }, 500); // 500ms 長按
    }

    handleLongPress(pos) {
        // 長按可以觸發特殊功能
        if (this.assistMode) {
            this.triggerJump();
            this.playHapticFeedback();
        }
    }

    checkSwipe(currentPos) {
        if (!this.touchStart) return;
        
        const deltaX = currentPos.x - this.touchStart.x;
        const deltaY = currentPos.y - this.touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > this.swipeThreshold) {
            this.isSwiping = true;
            
            // 決定滑動方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑動
                if (deltaX > 0) {
                    this.triggerMove('right');
                    this.setVisualFeedback('right', true);
                } else {
                    this.triggerMove('left');
                    this.setVisualFeedback('left', true);
                }
            }
        }
    }

    handleGestureStart(pos) {
        // 判斷觸控區域
        if (this.isInZone(pos, this.zones.jump)) {
            // 跳躍區域 - 單擊跳躍
            if (Date.now() - this.lastTouchTime < 300) {
                // 雙擊
                this.triggerDoubleTap(pos);
            } else {
                // 單擊 - 跳躍
                this.triggerJump();
                this.setVisualFeedback('jump', true);
            }
        } else if (this.isInZone(pos, this.zones.left)) {
            this.triggerMove('left');
            this.setVisualFeedback('left', true);
        } else if (this.isInZone(pos, this.zones.right)) {
            this.triggerMove('right');
            this.setVisualFeedback('right', true);
        }
    }

    handleGestureEnd(pos) {
        if (!this.isSwiping) {
            // 不是滑動手勢，檢查是否為點擊
            if (this.gestureStart && this.gestureEnd) {
                const distance = Math.sqrt(
                    Math.pow(this.gestureEnd.x - this.gestureStart.x, 2) +
                    Math.pow(this.gestureEnd.y - this.gestureStart.y, 2)
                );
                
                if (distance < 10) {
                    // 點擊
                    this.handleTap(pos);
                }
            }
        }
        
        this.gestureStart = null;
        this.gestureEnd = null;
        this.isLongPress = false;
        
        // 停止移動
        this.stopAllMovement();
    }

    handleTap(pos) {
        if (this.isInZone(pos, this.zones.jump)) {
            this.triggerJump();
        }
    }

    triggerDoubleTap(pos) {
        // 雙擊可以觸發特殊技能
        this.triggerJump();
        this.triggerJump(); // 雙跳
        
        // 視覺效果
        this.setVisualFeedback('jump', true);
        this.playHapticFeedback();
    }

    triggerJump() {
        document.dispatchEvent(new CustomEvent('marioJump'));
        this.playHapticFeedback();
    }

    triggerMove(direction) {
        document.dispatchEvent(new CustomEvent('marioMove' + direction.charAt(0).toUpperCase() + direction.slice(1)));
        this.playHapticFeedback();
    }

    triggerStopMove(direction) {
        document.dispatchEvent(new CustomEvent('marioMove' + direction.charAt(0).toUpperCase() + direction.slice(1), {
            detail: { stop: true }
        }));
    }

    stopAllMovement() {
        document.dispatchEvent(new CustomEvent('marioStopMove'));
        
        // 重置視覺反饋
        Object.keys(this.visualFeedback).forEach(zone => {
            this.setVisualFeedback(zone, false);
        });
    }

    togglePause() {
        document.dispatchEvent(new CustomEvent('togglePause'));
    }

    // 視覺反饋
    setVisualFeedback(zone, active) {
        if (this.visualFeedback[zone]) {
            this.visualFeedback[zone].active = active;
            if (active) {
                this.visualFeedback[zone].opacity = 1;
            }
        }
    }

    // 觸覺反饋
    playHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    // 區域檢測
    isInZone(pos, zone) {
        return pos.x >= zone.x &&
               pos.x <= zone.x + zone.width &&
               pos.y >= zone.y &&
               pos.y <= zone.y + zone.height;
    }

    // 更新視覺反饋
    updateVisualFeedback(deltaTime) {
        Object.keys(this.visualFeedback).forEach(zone => {
            const feedback = this.visualFeedback[zone];
            if (feedback.active) {
                feedback.opacity -= deltaTime * 0.005;
                if (feedback.opacity <= 0) {
                    feedback.active = false;
                    feedback.opacity = 0;
                }
            }
        });
    }

    // 繪製觸控指示器
    drawTouchIndicators() {
        const ctx = this.context;
        
        // 繪製區域指示器
        this.drawZoneIndicator('left', '#4ECDC4', 0.2);
        this.drawZoneIndicator('jump', '#FFB74D', 0.1);
        this.drawZoneIndicator('right', '#4ECDC4', 0.2);
        
        // 繪製觸控反饋
        this.drawTouchFeedback();
    }

    drawZoneIndicator(zoneName, color, alpha) {
        const zone = this.zones[zoneName];
        const ctx = this.context;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        ctx.restore();
        
        // 繪製邊框
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha * 2;
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        ctx.restore();
    }

    drawTouchFeedback() {
        const ctx = this.context;
        
        Object.keys(this.visualFeedback).forEach(zone => {
            const feedback = this.visualFeedback[zone];
            if (feedback.active && feedback.opacity > 0) {
                const zone = this.zones[zone];
                
                ctx.save();
                ctx.globalAlpha = feedback.opacity * 0.5;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
                ctx.restore();
            }
        });
    }

    // 設置靈敏度
    setSensitivity(level) {
        this.sensitivity = Math.max(1, Math.min(10, level));
        
        // 根據靈敏度調整滑動閾值
        this.swipeThreshold = 30 - (this.sensitivity - 5) * 5;
        this.swipeThreshold = Math.max(15, this.swipeThreshold);
    }

    // 設置輔助模式
    setAssistMode(enabled) {
        this.assistMode = enabled;
        
        if (enabled) {
            // 輔助模式 - 更寬的觸控區域
            this.zones.left.width = this.canvas.width * 0.25;
            this.zones.right.width = this.canvas.width * 0.25;
            this.zones.jump.x = this.canvas.width * 0.25;
            this.zones.jump.width = this.canvas.width * 0.5;
        } else {
            this.updateZones();
        }
    }

    // 獲取觸控狀態
    getTouchState() {
        return {
            isSwiping: this.isSwiping,
            touchCount: this.touches.size,
            activeZones: Object.keys(this.visualFeedback).filter(
                zone => this.visualFeedback[zone].active
            )
        };
    }

    // 清理
    destroy() {
        // 移除事件監聽器
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
        
        // 清理長按計時器
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
        }
    }
}

// 導出Controls類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
}