/**
 * 動態關卡生成系統
 * 3A級遊戲的核心內容生成系統
 */
class LevelGenerator {
    constructor(game) {
        this.game = game;
        this.currentLevel = null;
        this.levelNumber = 1;
        this.difficultyCurve = 1.0;
        
        // 關卡模板
        this.levelTemplates = {
            beginner: {
                name: '初學者樂園',
                minPlayerLevel: 1,
                characteristics: {
                    platformSpacing: { min: 150, max: 250 },
                    enemyDensity: 0.3,
                    coinDensity: 0.8,
                    hazardDensity: 0.1,
                    platformTypes: ['ground', 'normal'],
                    hazards: [],
                    enemies: ['goomba'],
                    collectibles: ['coin', 'mushroom']
                }
            },
            intermediate: {
                name: '冒險家之路',
                minPlayerLevel: 5,
                characteristics: {
                    platformSpacing: { min: 200, max: 350 },
                    enemyDensity: 0.6,
                    coinDensity: 0.7,
                    hazardDensity: 0.3,
                    platformTypes: ['ground', 'normal', 'moving'],
                    hazards: ['lava', 'spikes'],
                    enemies: ['goomba', 'koopa'],
                    collectibles: ['coin', 'mushroom', 'star']
                }
            },
            advanced: {
                name: '挑戰者地圖',
                minPlayerLevel: 10,
                characteristics: {
                    platformSpacing: { min: 250, max: 450 },
                    enemyDensity: 0.8,
                    coinDensity: 0.6,
                    hazardDensity: 0.5,
                    platformTypes: ['ground', 'normal', 'moving', 'breakable', 'conveyor'],
                    hazards: ['lava', 'spikes', 'water'],
                    enemies: ['goomba', 'koopa', 'piranha', 'thwomp'],
                    collectibles: ['coin', 'mushroom', 'star', 'gem']
                }
            },
            expert: {
                name: '大師試煉',
                minPlayerLevel: 20,
                characteristics: {
                    platformSpacing: { min: 300, max: 550 },
                    enemyDensity: 1.0,
                    coinDensity: 0.5,
                    hazardDensity: 0.7,
                    platformTypes: ['ground', 'normal', 'moving', 'breakable', 'conveyor', 'disappearing'],
                    hazards: ['lava', 'spikes', 'water', 'electric'],
                    enemies: ['goomba', 'koopa', 'piranha', 'thwomp', 'hammerBro'],
                    collectibles: ['coin', 'mushroom', 'star', 'gem', 'key']
                }
            }
        };
        
        // 敵人定義
        this.enemies = {
            goomba: {
                name: 'Goomba',
                health: 1,
                speed: 1,
                damage: 1,
                size: { width: 40, height: 40 },
                behavior: 'patrol',
                worth: 200,
                spawnWeight: 3
            },
            koopa: {
                name: 'Koopa',
                health: 2,
                speed: 1.5,
                damage: 2,
                size: { width: 35, height: 45 },
                behavior: 'patrol',
                worth: 300,
                spawnWeight: 2
            },
            piranha: {
                name: 'Piranha',
                health: 1,
                speed: 2,
                damage: 3,
                size: { width: 30, height: 50 },
                behavior: 'emergent',
                worth: 400,
                spawnWeight: 1
            },
            thwomp: {
                name: 'Thwomp',
                health: 3,
                speed: 0,
                damage: 5,
                size: { width: 80, height: 80 },
                behavior: 'falling',
                worth: 500,
                spawnWeight: 0.5
            },
            hammerBro: {
                name: 'Hammer Bro',
                health: 4,
                speed: 2,
                damage: 4,
                size: { width: 45, height: 50 },
                behavior: 'ranged',
                worth: 800,
                spawnWeight: 0.3
            }
        };
        
        // 道具定義
        this.collectibles = {
            coin: {
                name: '金幣',
                value: 100,
                size: { width: 20, height: 20 },
                animation: 'spin',
                rarity: 'common',
                spawnWeight: 5
            },
            mushroom: {
                name: '蘑菇',
                value: 200,
                size: { width: 30, height: 30 },
                animation: 'bounce',
                effect: 'heal',
                rarity: 'uncommon',
                spawnWeight: 2
            },
            star: {
                name: '星星',
                value: 500,
                size: { width: 25, height: 25 },
                animation: 'glow',
                effect: 'invincibility',
                rarity: 'rare',
                spawnWeight: 0.5
            },
            gem: {
                name: '寶石',
                value: 1000,
                size: { width: 22, height: 22 },
                animation: 'sparkle',
                rarity: 'epic',
                spawnWeight: 0.2
            },
            key: {
                name: '鑰匙',
                value: 0,
                size: { width: 24, height: 24 },
                animation: 'pulse',
                effect: 'unlock',
                rarity: 'legendary',
                spawnWeight: 0.1
            }
        };
        
        // 平台類型
        this.platforms = {
            ground: {
                name: '地面',
                solid: true,
                breakable: false,
                moveable: false,
                color: '#8B4513'
            },
            normal: {
                name: '普通平台',
                solid: true,
                breakable: false,
                moveable: false,
                color: '#654321'
            },
            moving: {
                name: '移動平台',
                solid: true,
                breakable: false,
                moveable: true,
                movement: 'horizontal',
                color: '#4169E1'
            },
            breakable: {
                name: '易碎平台',
                solid: true,
                breakable: true,
                moveable: false,
                hp: 1,
                color: '#8B0000'
            },
            conveyor: {
                name: '傳送帶',
                solid: true,
                breakable: false,
                moveable: false,
                push: { x: 2, y: 0 },
                color: '#2F4F4F'
            },
            disappearing: {
                name: '消失平台',
                solid: true,
                breakable: false,
                moveable: false,
                disappearing: true,
                timer: 3000,
                color: '#9370DB'
            }
        };
        
        // 危險區域
        this.hazards = {
            lava: {
                name: '岩漿',
                damage: 10,
                effect: 'burn',
                color: '#FF4500',
                animated: true
            },
            spikes: {
                name: '尖刺',
                damage: 5,
                effect: 'pierce',
                color: '#696969'
            },
            water: {
                name: '水面',
                damage: 0,
                effect: 'slow',
                color: '#4169E1'
            },
            electric: {
                name: '電流',
                damage: 8,
                effect: 'stun',
                color: '#FFD700',
                animated: true
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('levelComplete', (e) => this.onLevelComplete(e.detail));
        document.addEventListener('playerDeath', () => this.onPlayerDeath());
    }
    
    generateLevel(playerLevel = 1, levelNumber = 1) {
        console.log(`🎮 Generating level ${levelNumber} for player level ${playerLevel}`);
        
        this.levelNumber = levelNumber;
        this.currentLevel = {
            id: `level_${levelNumber}_${Date.now()}`,
            number: levelNumber,
            playerLevel: playerLevel,
            platforms: [],
            enemies: [],
            collectibles: [],
            hazards: [],
            startPoint: { x: 50, y: 400 },
            endPoint: { x: 3000, y: 400 },
            theme: this.chooseTheme(playerLevel),
            characteristics: this.getLevelCharacteristics(playerLevel),
            timeLimit: this.calculateTimeLimit(playerLevel),
            objectives: this.generateObjectives(playerLevel),
            name: this.generateLevelName(playerLevel),
            description: this.generateLevelDescription(),
            rewards: this.calculateRewards(playerLevel),
            difficulty: this.calculateDifficulty(playerLevel, levelNumber)
        };
        
        // 生成關卡內容
        this.generatePlatforms();
        this.generateHazards();
        this.generateEnemies();
        this.generateCollectibles();
        this.generateSpecialElements();
        
        console.log(`✅ Level generated: ${this.currentLevel.name}`);
        console.log(`   Platforms: ${this.currentLevel.platforms.length}`);
        console.log(`   Enemies: ${this.currentLevel.enemies.length}`);
        console.log(`   Collectibles: ${this.currentLevel.collectibles.length}`);
        console.log(`   Hazards: ${this.currentLevel.hazards.length}`);
        
        return this.currentLevel;
    }
    
    chooseTheme(playerLevel) {
        const themes = [
            { name: 'grassland', minLevel: 1, maxLevel: 5, weight: 1.0 },
            { name: 'forest', minLevel: 3, maxLevel: 10, weight: 0.8 },
            { name: 'desert', minLevel: 6, maxLevel: 15, weight: 0.7 },
            { name: 'ice', minLevel: 8, maxLevel: 18, weight: 0.6 },
            { name: 'volcano', minLevel: 12, maxLevel: 25, weight: 0.5 },
            { name: 'space', minLevel: 15, maxLevel: 30, weight: 0.4 },
            { name: 'mystery', minLevel: 18, maxLevel: 35, weight: 0.3 }
        ];
        
        const availableThemes = themes.filter(theme => 
            playerLevel >= theme.minLevel && playerLevel <= theme.maxLevel
        );
        
        const totalWeight = availableThemes.reduce((sum, theme) => sum + theme.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const theme of availableThemes) {
            random -= theme.weight;
            if (random <= 0) {
                return theme.name;
            }
        }
        
        return 'grassland'; // fallback
    }
    
    getLevelCharacteristics(playerLevel) {
        // 根據玩家等級選擇合適的模板
        let template = 'beginner';
        if (playerLevel >= 20) template = 'expert';
        else if (playerLevel >= 10) template = 'advanced';
        else if (playerLevel >= 5) template = 'intermediate';
        
        const base = this.levelTemplates[template];
        const difficultyMultiplier = 1 + (playerLevel - base.minPlayerLevel) * 0.1;
        
        return {
            ...base.characteristics,
            difficultyMultiplier: difficultyMultiplier,
            platformSpacing: {
                min: Math.max(100, base.characteristics.platformSpacing.min * (2 - difficultyMultiplier)),
                max: base.characteristics.platformSpacing.max * (2 - difficultyMultiplier)
            }
        };
    }
    
    generatePlatforms() {
        const chars = this.currentLevel.characteristics;
        const levelLength = 3000;
        const groundY = 450;
        
        // 創建起始平台
        this.currentLevel.platforms.push({
            x: 0,
            y: groundY,
            width: 200,
            height: 50,
            type: 'ground',
            id: 'start_platform'
        });
        
        let currentX = 200;
        let currentY = groundY;
        let platformCount = 0;
        
        while (currentX < levelLength - 200) {
            platformCount++;
            
            // 決定平台類型
            const platformType = this.choosePlatformType();
            
            // 計算間距
            const spacing = this.randomBetween(
                chars.platformSpacing.min,
                chars.platformSpacing.max
            ) * chars.difficultyMultiplier;
            
            // 計算高度變化
            const heightVariation = this.randomBetween(-100, 100);
            currentY = Math.max(200, Math.min(500, currentY + heightVariation));
            
            // 創建平台
            const platform = {
                x: currentX,
                y: currentY,
                width: this.randomBetween(100, 200),
                height: 20,
                type: platformType,
                id: `platform_${platformCount}`,
                properties: this.getPlatformProperties(platformType)
            };
            
            this.currentLevel.platforms.push(platform);
            
            // 特殊平台邏輯
            if (platformType === 'moving') {
                platform.properties.movement = this.randomBetween(1, 3);
                platform.properties.direction = Math.random() < 0.5 ? 'left' : 'right';
            }
            
            currentX += platform.width + spacing;
        }
        
        // 創建終點平台
        this.currentLevel.platforms.push({
            x: levelLength - 100,
            y: groundY,
            width: 150,
            height: 50,
            type: 'ground',
            id: 'end_platform'
        });
        
        this.currentLevel.endPoint.x = levelLength - 50;
    }
    
    choosePlatformType() {
        const chars = this.currentLevel.characteristics;
        const weights = {};
        
        chars.platformTypes.forEach(type => {
            switch(type) {
                case 'ground': weights[type] = 2.0; break;
                case 'normal': weights[type] = 1.5; break;
                case 'moving': weights[type] = 0.3; break;
                case 'breakable': weights[type] = 0.2; break;
                case 'conveyor': weights[type] = 0.1; break;
                case 'disappearing': weights[type] = 0.05; break;
            }
        });
        
        return this.weightedChoice(weights);
    }
    
    getPlatformProperties(type) {
        switch(type) {
            case 'breakable':
                return { hp: 1, breaking: false };
            case 'moving':
                return { 
                    movement: 1, 
                    direction: 'right', 
                    range: 200,
                    originalX: 0
                };
            case 'conveyor':
                return { push: { x: 2, y: 0 } };
            case 'disappearing':
                return { 
                    disappearing: true, 
                    timer: 3000,
                    visible: true,
                    timeLeft: 3000
                };
            default:
                return {};
        }
    }
    
    generateHazards() {
        const chars = this.currentLevel.characteristics;
        const platformCount = this.currentLevel.platforms.length;
        const hazardCount = Math.floor(platformCount * chars.hazardDensity);
        
        for (let i = 0; i < hazardCount; i++) {
            const hazardType = this.weightedChoice(this.getHazardWeights(chars.hazards));
            const platform = this.getRandomPlatform();
            
            if (platform && platform.type !== 'ground') {
                const hazard = {
                    x: platform.x + this.randomBetween(10, platform.width - 40),
                    y: platform.y + platform.height,
                    width: this.randomBetween(20, 40),
                    height: 30,
                    type: hazardType,
                    id: `hazard_${i}`,
                    properties: this.getHazardProperties(hazardType)
                };
                
                this.currentLevel.hazards.push(hazard);
            }
        }
    }
    
    getHazardWeights(availableHazards) {
        const weights = {};
        availableHazards.forEach(hazard => {
            switch(hazard) {
                case 'lava': weights[hazard] = 3.0; break;
                case 'spikes': weights[hazard] = 2.0; break;
                case 'water': weights[hazard] = 1.5; break;
                case 'electric': weights[hazard] = 0.5; break;
            }
        });
        return weights;
    }
    
    getHazardProperties(type) {
        switch(type) {
            case 'lava':
                return { 
                    animated: true, 
                    animationSpeed: 0.1,
                    phases: ['normal', 'eruption']
                };
            case 'electric':
                return {
                    animated: true,
                    animationSpeed: 0.15,
                    activeTime: 2000,
                    inactiveTime: 1000
                };
            case 'water':
                return { 
                    gravity: 0.3,
                    maxDepth: 50 
                };
            default:
                return {};
        }
    }
    
    generateEnemies() {
        const chars = this.currentLevel.characteristics;
        const enemyCount = Math.floor(this.currentLevel.platforms.length * chars.enemyDensity);
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = this.weightedChoice(this.getEnemyWeights(chars.enemies));
            const platform = this.getRandomPlatform();
            
            if (platform) {
                const enemy = {
                    x: platform.x + this.randomBetween(20, platform.width - 60),
                    y: platform.y - this.enemies[enemyType].size.height,
                    type: enemyType,
                    id: `enemy_${i}`,
                    properties: this.getEnemyProperties(enemyType),
                    health: this.enemies[enemyType].health,
                    facing: Math.random() < 0.5 ? 'left' : 'right'
                };
                
                this.currentLevel.enemies.push(enemy);
            }
        }
    }
    
    getEnemyWeights(availableEnemies) {
        const weights = {};
        availableEnemies.forEach(enemy => {
            weights[enemy] = this.enemies[enemy] ? this.enemies[enemy].spawnWeight : 1.0;
        });
        return weights;
    }
    
    getEnemyProperties(type) {
        const base = this.enemies[type];
        return {
            speed: base.speed,
            patrolRange: this.randomBetween(100, 300),
            originalX: 0,
            lastUpdate: Date.now(),
            pattern: base.behavior,
            attackCooldown: 0,
            stompable: type !== 'hammerBro'
        };
    }
    
    generateCollectibles() {
        const chars = this.currentLevel.characteristics;
        const collectibleCount = Math.floor(this.currentLevel.platforms.length * chars.coinDensity);
        
        for (let i = 0; i < collectibleCount; i++) {
            const collectibleType = this.weightedChoice(this.getCollectibleWeights(chars.collectibles));
            const position = this.getCollectiblePosition();
            
            const collectible = {
                x: position.x,
                y: position.y,
                type: collectibleType,
                id: `collectible_${i}`,
                collected: false,
                value: this.collectibles[collectibleType].value,
                properties: this.getCollectibleProperties(collectibleType)
            };
            
            this.currentLevel.collectibles.push(collectible);
        }
    }
    
    getCollectibleWeights(availableCollectibles) {
        const weights = {};
        availableCollectibles.forEach(collectible => {
            weights[collectible] = this.collectibles[collectible] ? 
                this.collectibles[collectible].spawnWeight : 1.0;
        });
        return weights;
    }
    
    getCollectiblePosition() {
        const platforms = this.currentLevel.platforms.filter(p => p.type !== 'ground');
        if (platforms.length === 0) return { x: 100, y: 300 };
        
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        return {
            x: platform.x + this.randomBetween(10, platform.width - 30),
            y: platform.y - this.randomBetween(30, 80)
        };
    }
    
    getCollectibleProperties(type) {
        const base = this.collectibles[type];
        return {
            animation: base.animation,
            effect: base.effect,
            bobOffset: Math.random() * Math.PI * 2,
            rotation: 0,
            glowIntensity: base.rarity === 'rare' || base.rarity === 'epic' || base.rarity === 'legendary' ? 1 : 0
        };
    }
    
    generateSpecialElements() {
        // 根據關卡主題添加特殊元素
        switch(this.currentLevel.theme) {
            case 'grassland':
                this.addFlowers();
                break;
            case 'forest':
                this.addTrees();
                break;
            case 'volcano':
                this.addEruptions();
                break;
            case 'space':
                this.addStars();
                break;
        }
    }
    
    addFlowers() {
        // 在平台上添加小花作為裝飾
        this.currentLevel.platforms.forEach(platform => {
            if (Math.random() < 0.3) {
                platform.decorations = platform.decorations || [];
                platform.decorations.push({
                    type: 'flower',
                    x: this.randomBetween(10, platform.width - 10),
                    color: this.randomChoice(['pink', 'yellow', 'white', 'purple'])
                });
            }
        });
    }
    
    addTrees() {
        // 添加樹作為背景裝飾
        this.currentLevel.decorations = this.currentLevel.decorations || [];
        for (let i = 0; i < 10; i++) {
            this.currentLevel.decorations.push({
                type: 'tree',
                x: this.randomBetween(0, 3000),
                y: 350 + this.randomBetween(-50, 50),
                height: this.randomBetween(80, 150)
            });
        }
    }
    
    addEruptions() {
        // 添加火山爆發效果
        this.currentLevel.hazards.push({
            x: 800,
            y: 420,
            width: 100,
            height: 50,
            type: 'eruption',
            id: 'eruption_1',
            properties: {
                interval: 5000,
                lastEruption: 0,
                active: false
            }
        });
    }
    
    addStars() {
        // 添加星星背景
        this.currentLevel.background = this.currentLevel.background || {};
        this.currentLevel.background.stars = [];
        for (let i = 0; i < 50; i++) {
            this.currentLevel.background.stars.push({
                x: this.randomBetween(0, 3000),
                y: this.randomBetween(0, 200),
                size: this.randomBetween(1, 3),
                twinkle: Math.random()
            });
        }
    }
    
    // 輔助方法
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    weightedChoice(weights) {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const [choice, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return choice;
            }
        }
        
        return Object.keys(weights)[0]; // fallback
    }
    
    getRandomPlatform() {
        const platforms = this.currentLevel.platforms.filter(p => p.type !== 'ground');
        return platforms.length > 0 ? platforms[Math.floor(Math.random() * platforms.length)] : null;
    }
    
    generateLevelName(playerLevel) {
        const prefixes = ['翠綠', '神秘', '熾熱', '冰霜', '星辰', '深邃', '古老', '魔法', '冒險', '挑戰'];
        const suffixes = ['草原', '森林', '峽谷', '洞穴', '火山', '冰川', '星空', '迷宮', '競技場', '王座'];
        
        if (playerLevel >= 20) {
            return `🏆 大師級 ${this.randomChoice(suffixes)}`;
        } else if (playerLevel >= 15) {
            return `⭐ 專家級 ${this.randomChoice(suffixes)}`;
        } else if (playerLevel >= 10) {
            return `💫 進階 ${this.randomChoice(suffixes)}`;
        } else if (playerLevel >= 5) {
            return `✨ 中級 ${this.randomChoice(suffixes)}`;
        } else {
            return `🌟 初級 ${this.randomChoice(suffixes)}`;
        }
    }
    
    generateLevelDescription() {
        const descriptions = [
            '經典的平台跳躍冒險，等待著勇敢的瑪莉歐！',
            '充滿挑戰的關卡，需要運用所有技能才能通關！',
            '美麗的風景與危險並存，考驗你的技巧！',
            '全新的環境，新的敵人和挑戰等待著你！',
            '這是一個真正考驗玩家實力的關卡！'
        ];
        return this.randomChoice(descriptions);
    }
    
    calculateTimeLimit(playerLevel) {
        const baseTime = 180; // 3分鐘基礎時間
        const levelTimeBonus = this.levelNumber * 30; // 每關增加30秒
        const skillBonus = playerLevel * 5; // 技能等級加成
        
        return baseTime + levelTimeBonus + skillBonus;
    }
    
    calculateRewards(playerLevel) {
        return {
            experience: 200 + this.levelNumber * 50 + playerLevel * 20,
            coins: 50 + this.levelNumber * 20,
            skillPoints: Math.floor(this.levelNumber / 5),
            equipment: this.getRandomEquipment(playerLevel)
        };
    }
    
    getRandomEquipment(playerLevel) {
        const equipmentTypes = ['hat', 'suit', 'shoes'];
        const randomType = this.randomChoice(equipmentTypes);
        // 這裡可以根據玩家等級和運氣決定裝備
        return null; // 暫時返回null，後續可以實現
    }
    
    generateObjectives(playerLevel) {
        const objectives = [
            {
                type: 'reachEnd',
                description: '抵達關卡終點',
                completed: false,
                progress: 0,
                target: 1
            },
            {
                type: 'collectCoins',
                description: `收集 ${Math.floor(this.currentLevel.collectibles.length * 0.3)} 枚金幣`,
                completed: false,
                progress: 0,
                target: Math.floor(this.currentLevel.collectibles.length * 0.3)
            },
            {
                type: 'defeatEnemies',
                description: `擊敗 ${Math.floor(this.currentLevel.enemies.length * 0.5)} 個敵人`,
                completed: false,
                progress: 0,
                target: Math.floor(this.currentLevel.enemies.length * 0.5)
            }
        ];
        
        if (playerLevel >= 10) {
            objectives.push({
                type: 'timeChallenge',
                description: `${Math.floor(this.calculateTimeLimit(playerLevel) / 2)} 秒內通關`,
                completed: false,
                progress: 0,
                target: Math.floor(this.calculateTimeLimit(playerLevel) / 2)
            });
        }
        
        return objectives;
    }
    
    calculateDifficulty(playerLevel, levelNumber) {
        const baseDifficulty = 1.0;
        const levelMultiplier = 1 + (levelNumber - 1) * 0.1;
        const playerMultiplier = 1 + (playerLevel - 1) * 0.05;
        
        return Math.min(5.0, baseDifficulty * levelMultiplier * playerMultiplier);
    }
    
    // 事件處理
    onLevelComplete(detail) {
        console.log(`🎉 Level ${this.levelNumber} completed!`, detail);
        // 這裡可以處理關卡完成邏輯
    }
    
    onPlayerDeath() {
        console.log(`💀 Player died in level ${this.levelNumber}`);
        // 處理玩家死亡邏輯
    }
    
    // 獲取當前關卡
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    // 獲取關卡統計
    getLevelStats() {
        if (!this.currentLevel) return null;
        
        return {
            levelNumber: this.levelNumber,
            theme: this.currentLevel.theme,
            difficulty: this.currentLevel.difficulty,
            platformCount: this.currentLevel.platforms.length,
            enemyCount: this.currentLevel.enemies.length,
            collectibleCount: this.currentLevel.collectibles.length,
            hazardCount: this.currentLevel.hazards.length,
            timeLimit: this.currentLevel.timeLimit,
            objectives: this.currentLevel.objectives.length
        };
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelGenerator;
}