/**
 * 現代化UI系統
 * 3A級遊戲的用戶界面管理系統
 */
class ModernUISystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = this.canvas.getContext('2d');
        
        // UI狀態
        this.currentScreen = 'game'; // 'game', 'progression', 'inventory', 'settings'
        this.activeModal = null;
        this.uiElements = [];
        
        // 動畫系統
        this.animations = {
            fadeIn: { duration: 300, elements: [] },
            slideIn: { duration: 400, elements: [] },
            scaleIn: { duration: 250, elements: [] },
            pulse: { duration: 1000, elements: [] }
        };
        
        // 響應式設計
        this.responsiveBreakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        };
        
        // 當前屏幕尺寸
        this.screenSize = this.getScreenSize();
        
        // 顏色主題
        this.themes = {
            default: {
                primary: '#4ECDC4',
                secondary: '#45B7D1',
                accent: '#FF6B6B',
                background: 'rgba(0, 0, 0, 0.8)',
                surface: 'rgba(255, 255, 255, 0.1)',
                text: '#FFFFFF',
                textSecondary: '#CCCCCC',
                success: '#32CD32',
                warning: '#FFD700',
                error: '#FF4444'
            },
            dark: {
                primary: '#00CED1',
                secondary: '#4169E1',
                accent: '#FF1493',
                background: 'rgba(20, 20, 20, 0.95)',
                surface: 'rgba(40, 40, 40, 0.8)',
                text: '#F0F0F0',
                textSecondary: '#B0B0B0',
                success: '#00FF7F',
                warning: '#FFD700',
                error: '#FF6347'
            }
        };
        
        this.currentTheme = this.themes.default;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createBaseUI();
    }
    
    getScreenSize() {
        const width = window.innerWidth;
        if (width <= this.responsiveBreakpoints.mobile) return 'mobile';
        if (width <= this.responsiveBreakpoints.tablet) return 'tablet';
        return 'desktop';
    }
    
    setupEventListeners() {
        // 視窗大小變化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        });
    }
    
    handleResize() {
        this.screenSize = this.getScreenSize();
        this.updateResponsiveElements();
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'Escape':
                this.closeCurrentModal();
                break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    this.previousElement();
                } else {
                    this.nextElement();
                }
                break;
            case 'Enter':
                this.activateCurrentElement();
                break;
        }
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        const pos = this.getTouchPosition(touch);
        
        // 檢查UI元素點擊
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            const element = this.uiElements[i];
            if (element.visible && this.isPointInElement(pos, element)) {
                this.clickElement(element, pos);
                break;
            }
        }
    }
    
    getTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
    
    isPointInElement(pos, element) {
        return pos.x >= element.x && pos.x <= element.x + element.width &&
               pos.y >= element.y && pos.y <= element.y + element.height;
    }
    
    clickElement(element, pos) {
        if (element.onClick) {
            element.onClick(pos);
        }
        
        // 觸發點擊動畫
        this.triggerAnimation('scaleIn', element.id);
        
        // 觸覺反饋
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    // ==================== 進度系統UI ====================
    
    showProgressionScreen() {
        this.currentScreen = 'progression';
        this.createProgressionUI();
        this.animateScreenTransition('fadeIn');
    }
    
    createProgressionUI() {
        this.clearUI();
        
        const progress = this.game.progression.getProgressData();
        
        // 背景遮罩
        this.addUIElement({
            id: 'background',
            type: 'background',
            x: 0, y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            background: 'rgba(0, 0, 0, 0.9)',
            onClick: () => this.closeProgressionScreen()
        });
        
        // 標題
        this.addUIElement({
            id: 'title',
            type: 'text',
            x: this.canvas.width / 2,
            y: 80,
            text: '🎮 角色進度',
            fontSize: this.getResponsiveFontSize('title'),
            color: this.currentTheme.text,
            alignment: 'center'
        });
        
        // 角色信息面板
        this.createCharacterPanel(progress.player);
        
        // 技能樹面板
        this.createSkillTreePanel(progress.skillTree);
        
        // 裝備面板
        this.createEquipmentPanel(progress.equipment);
        
        // 成就面板
        this.createAchievementsPanel(progress.player.achievements);
        
        // 關閉按鈕
        this.addUIElement({
            id: 'closeBtn',
            type: 'button',
            x: this.canvas.width - 60,
            y: 30,
            width: 40,
            height: 40,
            background: this.currentTheme.accent,
            text: '✕',
            fontSize: 20,
            color: '#FFFFFF',
            onClick: () => this.closeProgressionScreen()
        });
    }
    
    createCharacterPanel(player) {
        const panelWidth = this.getResponsiveWidth(300, 400, 500);
        const panelHeight = this.getResponsiveHeight(200, 250, 300);
        const x = 50;
        const y = 150;
        
        // 面板背景
        this.addUIElement({
            id: 'characterPanel',
            type: 'panel',
            x: x,
            y: y,
            width: panelWidth,
            height: panelHeight,
            background: this.currentTheme.surface,
            border: `2px solid ${this.currentTheme.primary}`,
            borderRadius: 15,
            shadow: true
        });
        
        // 等級
        this.addUIElement({
            id: 'level',
            type: 'text',
            x: x + 20,
            y: y + 30,
            text: `Level ${player.level}`,
            fontSize: this.getResponsiveFontSize('heading'),
            color: this.currentTheme.text,
            fontWeight: 'bold'
        });
        
        // 經驗值條
        const expBarWidth = panelWidth - 40;
        const expPercentage = player.experience / player.experienceToNext;
        
        this.addUIElement({
            id: 'expBar',
            type: 'progressBar',
            x: x + 20,
            y: y + 50,
            width: expBarWidth,
            height: 20,
            progress: expPercentage,
            background: 'rgba(255, 255, 255, 0.2)',
            fillColor: this.currentTheme.primary,
            text: `${player.experience}/${player.experienceToNext} EXP`
        });
        
        // 屬性
        const attributes = ['strength', 'agility', 'endurance', 'luck'];
        attributes.forEach((attr, index) => {
            const attrY = y + 90 + index * 30;
            const value = player.stats[attr];
            
            this.addUIElement({
                id: `stat_${attr}`,
                type: 'text',
                x: x + 20,
                y: attrY,
                text: `${this.getStatIcon(attr)} ${attr.toUpperCase()}: ${value}`,
                fontSize: this.getResponsiveFontSize('body'),
                color: this.currentTheme.textSecondary
            });
        });
        
        // 技能點數
        this.addUIElement({
            id: 'skillPoints',
            type: 'text',
            x: x + 20,
            y: y + panelHeight - 40,
            text: `🎯 技能點數: ${player.skillPoints}`,
            fontSize: this.getResponsiveFontSize('body'),
            color: this.currentTheme.accent,
            fontWeight: 'bold'
        });
    }
    
    createSkillTreePanel(skillTree) {
        const panelWidth = this.getResponsiveWidth(400, 500, 600);
        const panelHeight = this.getResponsiveHeight(350, 400, 450);
        const x = this.canvas.width - panelWidth - 50;
        const y = 150;
        
        // 面板背景
        this.addUIElement({
            id: 'skillPanel',
            type: 'panel',
            x: x,
            y: y,
            width: panelWidth,
            height: panelHeight,
            background: this.currentTheme.surface,
            border: `2px solid ${this.currentTheme.secondary}`,
            borderRadius: 15,
            shadow: true
        });
        
        // 標題
        this.addUIElement({
            id: 'skillTitle',
            type: 'text',
            x: x + panelWidth / 2,
            y: y + 30,
            text: '🌳 技能樹',
            fontSize: this.getResponsiveFontSize('heading'),
            color: this.currentTheme.text,
            alignment: 'center',
            fontWeight: 'bold'
        });
        
        // 技能類別
        let currentY = y + 60;
        Object.keys(skillTree).forEach(category => {
            const categoryData = skillTree[category];
            
            // 類別標題
            this.addUIElement({
                id: `category_${category}`,
                type: 'text',
                x: x + 20,
                y: currentY,
                text: `${categoryData.icon} ${categoryData.name}`,
                fontSize: this.getResponsiveFontSize('subheading'),
                color: this.currentTheme.text,
                fontWeight: 'bold'
            });
            
            currentY += 30;
            
            // 技能
            Object.keys(categoryData.skills).forEach(skillName => {
                const skill = categoryData.skills[skillName];
                const skillY = currentY;
                
                this.addUIElement({
                    id: `skill_${category}_${skillName}`,
                    type: 'skillButton',
                    x: x + 30,
                    y: skillY,
                    width: panelWidth - 60,
                    height: 60,
                    skill: skill,
                    category: category,
                    skillName: skillName,
                    onClick: () => this.learnSkill(category, skillName)
                });
                
                currentY += 70;
            });
            
            currentY += 20; // 類別間距
        });
    }
    
    createEquipmentPanel(equipment) {
        const panelWidth = this.getResponsiveWidth(280, 320, 360);
        const panelHeight = this.getResponsiveHeight(200, 240, 280);
        const x = 50;
        const y = this.canvas.height - panelHeight - 50;
        
        // 面板背景
        this.addUIElement({
            id: 'equipmentPanel',
            type: 'panel',
            x: x,
            y: y,
            width: panelWidth,
            height: panelHeight,
            background: this.currentTheme.surface,
            border: `2px solid ${this.currentTheme.accent}`,
            borderRadius: 15,
            shadow: true
        });
        
        // 標題
        this.addUIElement({
            id: 'equipmentTitle',
            type: 'text',
            x: x + panelWidth / 2,
            y: y + 25,
            text: '🎒 裝備',
            fontSize: this.getResponsiveFontSize('heading'),
            color: this.currentTheme.text,
            alignment: 'center',
            fontWeight: 'bold'
        });
        
        // 裝備類型
        let currentY = y + 50;
        Object.keys(equipment).forEach(equipmentType => {
            const typeData = equipment[equipmentType];
            const currentItem = this.game.progression.playerData.equipment[equipmentType];
            
            this.addUIElement({
                id: `equipment_${equipmentType}`,
                type: 'equipmentSlot',
                x: x + 20,
                y: currentY,
                width: panelWidth - 40,
                height: 40,
                equipmentType: equipmentType,
                currentItem: currentItem,
                items: typeData,
                onClick: () => this.showEquipmentOptions(equipmentType)
            });
            
            currentY += 50;
        });
    }
    
    createAchievementsPanel(achievements) {
        const panelWidth = this.getResponsiveWidth(280, 320, 360);
        const panelHeight = this.getResponsiveHeight(200, 240, 280);
        const x = this.canvas.width - panelWidth - 50;
        const y = this.canvas.height - panelHeight - 50;
        
        // 面板背景
        this.addUIElement({
            id: 'achievementsPanel',
            type: 'panel',
            x: x,
            y: y,
            width: panelWidth,
            height: panelHeight,
            background: this.currentTheme.surface,
            border: `2px solid ${this.currentTheme.warning}`,
            borderRadius: 15,
            shadow: true
        });
        
        // 標題
        this.addUIElement({
            id: 'achievementsTitle',
            type: 'text',
            x: x + panelWidth / 2,
            y: y + 25,
            text: '🏆 成就',
            fontSize: this.getResponsiveFontSize('heading'),
            color: this.currentTheme.text,
            alignment: 'center',
            fontWeight: 'bold'
        });
        
        // 成就列表
        let currentY = y + 50;
        const maxAchievements = 3; // 只顯示最近的3個成就
        const recentAchievements = achievements.slice(-maxAchievements);
        
        if (recentAchievements.length > 0) {
            recentAchievements.forEach((achievementKey, index) => {
                const achievement = this.game.progression.achievements[achievementKey];
                
                this.addUIElement({
                    id: `achievement_${index}`,
                    type: 'achievementBadge',
                    x: x + 20,
                    y: currentY,
                    width: panelWidth - 40,
                    height: 40,
                    achievement: achievement,
                    onClick: () => this.showAchievementDetails(achievement)
                });
                
                currentY += 50;
            });
        } else {
            this.addUIElement({
                id: 'noAchievements',
                type: 'text',
                x: x + panelWidth / 2,
                y: y + panelHeight / 2,
                text: '還沒有獲得成就',
                fontSize: this.getResponsiveFontSize('body'),
                color: this.currentTheme.textSecondary,
                alignment: 'center'
            });
        }
    }
    
    // ==================== 響應式設計方法 ====================
    
    getResponsiveFontSize(type) {
        const sizeMap = {
            title: { mobile: 24, tablet: 32, desktop: 40 },
            heading: { mobile: 18, tablet: 22, desktop: 26 },
            subheading: { mobile: 16, tablet: 20, desktop: 24 },
            body: { mobile: 12, tablet: 14, desktop: 16 }
        };
        
        const sizes = sizeMap[type] || sizeMap.body;
        return sizes[this.screenSize] || sizes.desktop;
    }
    
    getResponsiveWidth(minWidth, midWidth, maxWidth) {
        const widthMap = {
            mobile: minWidth,
            tablet: midWidth,
            desktop: maxWidth
        };
        
        return widthMap[this.screenSize] || maxWidth;
    }
    
    getResponsiveHeight(minHeight, midHeight, maxHeight) {
        const heightMap = {
            mobile: minHeight,
            tablet: midHeight,
            desktop: maxHeight
        };
        
        return heightMap[this.screenSize] || maxHeight;
    }
    
    getStatIcon(stat) {
        const iconMap = {
            strength: '💪',
            agility: '⚡',
            endurance: '🛡️',
            luck: '🍀'
        };
        
        return iconMap[stat] || '📊';
    }
    
    updateResponsiveElements() {
        // 重新創建UI元素以適應新尺寸
        if (this.currentScreen !== 'game') {
            this.createProgressionUI();
        }
    }
    
    // ==================== UI元素管理 ====================
    
    addUIElement(element) {
        this.uiElements.push({
            ...element,
            id: element.id || `element_${Date.now()}`,
            visible: true,
            animated: false,
            animationProgress: 0
        });
    }
    
    removeUIElement(id) {
        this.uiElements = this.uiElements.filter(el => el.id !== id);
    }
    
    clearUI() {
        this.uiElements = [];
    }
    
    // ==================== 動畫系統 ====================
    
    triggerAnimation(type, elementId, duration = null) {
        const animation = this.animations[type];
        if (!animation) return;
        
        const element = this.uiElements.find(el => el.id === elementId);
        if (!element) return;
        
        element.animated = true;
        element.animationProgress = 0;
        element.animationType = type;
        element.animationDuration = duration || animation.duration;
        
        animation.elements.push(elementId);
    }
    
    updateAnimations(deltaTime) {
        this.uiElements.forEach(element => {
            if (element.animated) {
                element.animationProgress += deltaTime;
                const progress = Math.min(1, element.animationProgress / element.animationDuration);
                
                switch(element.animationType) {
                    case 'fadeIn':
                        element.opacity = progress;
                        break;
                    case 'slideIn':
                        element.x = element.originalX - (1 - progress) * 100;
                        break;
                    case 'scaleIn':
                        element.scale = progress;
                        break;
                }
                
                if (progress >= 1) {
                    element.animated = false;
                }
            }
        });
    }
    
    animateScreenTransition(type) {
        this.uiElements.forEach(element => {
            if (element.type !== 'background') {
                this.triggerAnimation(type, element.id);
            }
        });
    }
    
    // ==================== 事件處理 ====================
    
    closeProgressionScreen() {
        this.currentScreen = 'game';
        this.clearUI();
        this.createGameUI();
    }
    
    learnSkill(category, skillName) {
        const success = this.game.progression.learnSkill(category, skillName);
        
        if (success) {
            this.showSkillUnlockedNotification(category, skillName);
            this.createProgressionUI(); // 重新載入UI
        } else {
            this.showNotification('技能點數不足或已滿級！', 'error');
        }
    }
    
    showSkillUnlockedNotification(category, skillName) {
        const skill = this.game.progression.skillTree[category].skills[skillName];
        this.showNotification(`🚀 解鎖技能: ${skill.name}`, 'success');
    }
    
    showNotification(message, type = 'info') {
        // 創建通知
        const notification = {
            id: `notification_${Date.now()}`,
            type: 'notification',
            x: this.canvas.width - 300,
            y: 50,
            width: 280,
            height: 60,
            message: message,
            type: type,
            timestamp: Date.now(),
            onClick: () => this.removeUIElement(`notification_${Date.now()}`)
        };
        
        this.addUIElement(notification);
        
        // 自動消失
        setTimeout(() => {
            this.removeUIElement(notification.id);
        }, 3000);
    }
    
    // ==================== 遊戲界面UI ====================
    
    createGameUI() {
        this.clearUI();
        
        // 遊戲HUD元素
        this.createGameHUD();
        
        // 進度按鈕
        this.addUIElement({
            id: 'progressionBtn',
            type: 'button',
            x: 20,
            y: this.canvas.height - 80,
            width: 120,
            height: 50,
            background: this.currentTheme.primary,
            text: '📈 進度',
            fontSize: this.getResponsiveFontSize('body'),
            color: '#FFFFFF',
            onClick: () => this.showProgressionScreen()
        });
    }
    
    createGameHUD() {
        const progress = this.game.progression.playerData;
        
        // 等級顯示
        this.addUIElement({
            id: 'hudLevel',
            type: 'text',
            x: 20,
            y: 30,
            text: `Lv.${progress.level}`,
            fontSize: this.getResponsiveFontSize('body'),
            color: this.currentTheme.text,
            fontWeight: 'bold'
        });
        
        // 經驗值條
        this.addUIElement({
            id: 'hudExpBar',
            type: 'progressBar',
            x: 20,
            y: 50,
            width: 150,
            height: 8,
            progress: progress.experience / progress.experienceToNext,
            background: 'rgba(255, 255, 255, 0.2)',
            fillColor: this.currentTheme.primary
        });
        
        // 技能點數
        this.addUIElement({
            id: 'hudSkillPoints',
            type: 'text',
            x: 180,
            y: 30,
            text: `🎯 ${progress.skillPoints}`,
            fontSize: this.getResponsiveFontSize('body'),
            color: this.currentTheme.accent,
            fontWeight: 'bold'
        });
    }
    
    // ==================== 渲染系統 ====================
    
    render() {
        // 更新動畫
        this.updateAnimations(16); // 假設60fps
        
        // 渲染所有UI元素
        this.uiElements.forEach(element => {
            if (element.visible) {
                this.renderElement(element);
            }
        });
    }
    
    renderElement(element) {
        this.ctx.save();
        
        // 應用變換
        if (element.scale) {
            this.ctx.scale(element.scale, element.scale);
        }
        
        // 設置透明度
        this.ctx.globalAlpha = element.opacity || 1;
        
        switch(element.type) {
            case 'background':
                this.renderBackground(element);
                break;
            case 'text':
                this.renderText(element);
                break;
            case 'button':
                this.renderButton(element);
                break;
            case 'panel':
                this.renderPanel(element);
                break;
            case 'skillButton':
                this.renderSkillButton(element);
                break;
            case 'equipmentSlot':
                this.renderEquipmentSlot(element);
                break;
            case 'achievementBadge':
                this.renderAchievementBadge(element);
                break;
            case 'progressBar':
                this.renderProgressBar(element);
                break;
            case 'notification':
                this.renderNotification(element);
                break;
        }
        
        this.ctx.restore();
    }
    
    renderBackground(element) {
        this.ctx.fillStyle = element.background;
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
    }
    
    renderText(element) {
        this.ctx.fillStyle = element.color;
        this.ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px Arial`;
        this.ctx.textAlign = element.alignment || 'left';
        this.ctx.fillText(element.text, element.x, element.y);
    }
    
    renderButton(element) {
        // 背景
        this.ctx.fillStyle = element.background;
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 邊框
        if (element.border) {
            this.ctx.strokeStyle = element.border;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        
        // 文字
        this.ctx.fillStyle = element.color;
        this.ctx.font = `bold ${element.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            element.text,
            element.x + element.width / 2,
            element.y + element.height / 2 + element.fontSize / 3
        );
    }
    
    renderPanel(element) {
        // 背景
        this.ctx.fillStyle = element.background;
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 陰影
        if (element.shadow) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 5;
            this.ctx.fillRect(element.x, element.y, element.width, element.height);
            this.ctx.shadowColor = 'transparent';
        }
        
        // 邊框
        if (element.border) {
            this.ctx.strokeStyle = element.border;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        
        // 圓角
        if (element.borderRadius) {
            this.drawRoundedRect(element.x, element.y, element.width, element.height, element.borderRadius);
        }
    }
    
    renderSkillButton(element) {
        const skill = element.skill;
        const canLearn = this.game.progression.canLearnSkill(element.category, element.skillName);
        
        // 背景顏色根據狀態
        const bgColor = canLearn ? this.currentTheme.success : 'rgba(128, 128, 128, 0.3)';
        const textColor = canLearn ? '#FFFFFF' : this.currentTheme.textSecondary;
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 技能名稱
        this.ctx.fillStyle = textColor;
        this.ctx.font = `bold ${this.getResponsiveFontSize('body')}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(skill.name, element.x + 10, element.y + 25);
        
        // 技能等級
        this.ctx.font = `${this.getResponsiveFontSize('body')}px Arial`;
        this.ctx.fillText(`Level ${skill.level}/${skill.max}`, element.x + 10, element.y + 45);
        
        // 成本
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${skill.cost} SP`, element.x + element.width - 10, element.y + 45);
    }
    
    renderEquipmentSlot(element) {
        const equipmentType = element.equipmentType;
        const currentItem = element.currentItem;
        
        // 槽位背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 當前裝備
        if (currentItem) {
            const item = element.items[currentItem];
            this.ctx.fillStyle = this.getRarityColor(item.rarity);
            this.ctx.fillRect(element.x, element.y, element.width, element.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = `${this.getResponsiveFontSize('body')}px Arial`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.name, element.x + 10, element.y + 25);
        } else {
            this.ctx.fillStyle = this.currentTheme.textSecondary;
            this.ctx.font = `${this.getResponsiveFontSize('body')}px Arial`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`點擊選擇 ${equipmentType}`, element.x + 10, element.y + 25);
        }
    }
    
    renderAchievementBadge(element) {
        const achievement = element.achievement;
        
        // 背景
        this.ctx.fillStyle = this.currentTheme.warning;
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 圖標
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${this.getResponsiveFontSize('body')}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(achievement.icon, element.x + 10, element.y + 25);
        
        // 名稱
        this.ctx.fillText(achievement.name, element.x + 40, element.y + 25);
    }
    
    renderProgressBar(element) {
        // 背景
        this.ctx.fillStyle = element.background;
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 進度
        const progressWidth = element.width * element.progress;
        this.ctx.fillStyle = element.fillColor || this.currentTheme.primary;
        this.ctx.fillRect(element.x, element.y, progressWidth, element.height);
        
        // 文字
        if (element.text) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = `${this.getResponsiveFontSize('small')}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                element.text,
                element.x + element.width / 2,
                element.y + element.height / 2 + 4
            );
        }
    }
    
    renderNotification(element) {
        // 背景
        this.ctx.fillStyle = this.getNotificationColor(element.type);
        this.ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // 文字
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `${this.getResponsiveFontSize('body')}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(element.message, element.x + 10, element.y + 35);
    }
    
    // ==================== 輔助方法 ====================
    
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    getRarityColor(rarity) {
        const colors = {
            common: '#808080',
            uncommon: '#00FF00',
            rare: '#0080FF',
            epic: '#8000FF',
            legendary: '#FF8000'
        };
        
        return colors[rarity] || colors.common;
    }
    
    getNotificationColor(type) {
        const colors = {
            success: this.currentTheme.success,
            error: this.currentTheme.error,
            warning: this.currentTheme.warning,
            info: this.currentTheme.primary
        };
        
        return colors[type] || colors.info;
    }
    
    createBaseUI() {
        // 創建基礎遊戲界面
        this.createGameUI();
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernUISystem;
}