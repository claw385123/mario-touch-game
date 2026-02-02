/**
 * 角色升級與裝備系統
 * 3A級遊戲的核心 progression 系統
 */
class ProgressionSystem {
    constructor(game) {
        this.game = game;
        this.playerData = {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            totalExperience: 0,
            skillPoints: 0,
            achievements: [],
            stats: {
                strength: 10,      // 力量 - 影響跳躍高度和移動速度
                agility: 10,       // 敏捷 - 影響反應速度和連續跳躍
                endurance: 10,     // 耐力 - 影響生命值和恢復速度
                luck: 10          // 幸運 - 影響金幣獲取和道具掉落
            },
            equipment: {
                hat: null,         // 帽子
                suit: null,        // 衣服
                shoes: null        // 鞋子
            },
            inventory: [],
            collectibles: {
                coins: 0,
                gems: 0,
                stars: 0,
                shells: 0,
                keys: 0
            },
            specialItems: [],      // 特殊道具
            unlockedWorlds: ['start'], // 已解鎖的世界
            completedLevels: [],
            fastestTimes: {},
            highScores: {}
        };
        
        // 技能樹定義
        this.skillTree = {
            jumping: {
                name: '跳躍大師',
                icon: '🦘',
                skills: {
                    doubleJump: {
                        name: '二段跳',
                        level: 0, max: 5,
                        description: '解鎖二段跳能力',
                        cost: 5,
                        effect: (level) => ({
                            extraJumps: level
                        })
                    },
                    airControl: {
                        name: '空中控制',
                        level: 0, max: 5,
                        description: '在空中可以移動',
                        cost: 3,
                        effect: (level) => ({
                            airMobility: 0.3 + level * 0.1
                        })
                    },
                    wallJump: {
                        name: '牆跳',
                        level: 0, max: 3,
                        description: '可以在牆壁上跳躍',
                        cost: 8,
                        effect: (level) => ({
                            wallJump: level > 0,
                            wallJumpPower: 0.8 + level * 0.1
                        })
                    }
                }
            },
            combat: {
                name: '戰鬥專家',
                icon: '⚔️',
                skills: {
                    powerKick: {
                        name: '強力踢擊',
                        level: 0, max: 5,
                        description: '踢擊可以摧毀磚塊',
                        cost: 6,
                        effect: (level) => ({
                            kickPower: level * 2
                        })
                    },
                    comboAttack: {
                        name: '連擊攻擊',
                        level: 0, max: 3,
                        description: '連續攻擊造成額外傷害',
                        cost: 10,
                        effect: (level) => ({
                            comboMultiplier: 1 + level * 0.5
                        })
                    },
                    groundSlam: {
                        name: '重擊地面',
                        level: 0, max: 1,
                        description: '跳躍落地造成震波',
                        cost: 15,
                        effect: () => ({
                            groundSlam: true
                        })
                    }
                }
            },
            collection: {
                name: '收集大師',
                icon: '💎',
                skills: {
                    magnet: {
                        name: '磁鐵吸引',
                        level: 0, max: 5,
                        description: '自動吸引附近的道具',
                        cost: 4,
                        effect: (level) => ({
                            magnetRange: 50 + level * 25
                        })
                    },
                    doubleCoins: {
                        name: '雙倍金幣',
                        level: 0, max: 3,
                        description: '收集金幣獲得雙倍',
                        cost: 8,
                        effect: (level) => ({
                            coinMultiplier: 1 + level
                        })
                    },
                    treasureFinder: {
                        name: '尋寶大師',
                        level: 0, max: 5,
                        description: '更容易找到隱藏道具',
                        cost: 6,
                        effect: (level) => ({
                            hiddenItemsChance: 0.1 + level * 0.1
                        })
                    }
                }
            },
            survival: {
                name: '生存專家',
                icon: '🛡️',
                skills: {
                    extraLife: {
                        name: '額外生命',
                        level: 0, max: 3,
                        description: '最大生命值+1',
                        cost: 10,
                        effect: (level) => ({
                            maxLives: 3 + level
                        })
                    },
                    damageReduction: {
                        name: '傷害減免',
                        level: 0, max: 5,
                        description: '受到的傷害減少',
                        cost: 7,
                        effect: (level) => ({
                            damageReduction: level * 0.1
                        })
                    },
                    invulnerabilityFrames: {
                        name: '無敵時間',
                        level: 0, max: 3,
                        description: '受傷後無敵時間增加',
                        cost: 5,
                        effect: (level) => ({
                            invulnerabilityTime: 2000 + level * 500
                        })
                    }
                }
            }
        };
        
        // 裝備定義
        this.equipment = {
            hat: {
                redCap: {
                    name: '紅色帽子',
                    rarity: 'common',
                    stats: { agility: 2 },
                    effects: ['doubleJumpBasic'],
                    cost: 0,
                    unlocked: true
                },
                blueCap: {
                    name: '藍色帽子',
                    rarity: 'uncommon',
                    stats: { agility: 3, endurance: 1 },
                    effects: ['doubleJumpImproved', 'coinAttraction'],
                    cost: 50,
                    unlocked: false
                },
                goldCrown: {
                    name: '黃金皇冠',
                    rarity: 'legendary',
                    stats: { strength: 5, agility: 4, luck: 3 },
                    effects: ['doubleJumpAdvanced', 'coinAttractionStrong', 'damageReduction'],
                    cost: 500,
                    unlocked: false
                }
            },
            suit: {
                blueOveralls: {
                    name: '藍色工作服',
                    rarity: 'common',
                    stats: { endurance: 2, strength: 1 },
                    effects: ['basicProtection'],
                    cost: 0,
                    unlocked: true
                },
                fireSuit: {
                    name: '火焰服裝',
                    rarity: 'rare',
                    stats: { strength: 4, endurance: 3 },
                    effects: ['fireImmunity', 'fireTrail'],
                    cost: 200,
                    unlocked: false
                },
                rainbowSuit: {
                    name: '彩虹服裝',
                    rarity: 'legendary',
                    stats: { strength: 6, agility: 5, endurance: 4, luck: 5 },
                    effects: ['fireImmunity', 'lightningSpeed', 'invincibility'],
                    cost: 1000,
                    unlocked: false
                }
            },
            shoes: {
                redBoots: {
                    name: '紅色靴子',
                    rarity: 'common',
                    stats: { agility: 2 },
                    effects: ['improvedJump'],
                    cost: 0,
                    unlocked: true
                },
                rocketBoots: {
                    name: '火箭靴子',
                    rarity: 'epic',
                    stats: { agility: 5, strength: 2 },
                    effects: ['rocketJump', 'speedBoost'],
                    cost: 300,
                    unlocked: false
                },
                lightningBoots: {
                    name: '閃電靴子',
                    rarity: 'legendary',
                    stats: { agility: 8, strength: 3, luck: 4 },
                    effects: ['rocketJumpAdvanced', 'speedBoostAdvanced', 'lightningTrail'],
                    cost: 800,
                    unlocked: false
                }
            }
        };
        
        // 成就系統
        this.achievements = {
            firstSteps: {
                name: '第一步',
                description: '收集第一枚金幣',
                icon: '🪙',
                category: 'collection',
                condition: () => this.playerData.collectibles.coins >= 1,
                reward: { skillPoints: 1, exp: 50 }
            },
            coinMaster: {
                name: '金幣大師',
                description: '收集100枚金幣',
                icon: '💰',
                category: 'collection',
                condition: () => this.playerData.collectibles.coins >= 100,
                reward: { skillPoints: 5, exp: 500 }
            },
            jumper: {
                name: '跳躍者',
                description: '執行100次跳躍',
                icon: '🦘',
                category: 'skill',
                condition: () => this.getStat('totalJumps') >= 100,
                reward: { skillPoints: 3, exp: 300 }
            },
            explorer: {
                name: '探索者',
                description: '探索5個不同的區域',
                icon: '🗺️',
                category: 'exploration',
                condition: () => this.playerData.completedLevels.length >= 5,
                reward: { skillPoints: 3, exp: 300 }
            },
            survivor: {
                name: '生存者',
                description: '生存超過5分鐘',
                icon: '🛡️',
                category: 'survival',
                condition: () => this.getStat('survivalTime') >= 300000,
                reward: { skillPoints: 4, exp: 400 }
            },
            collector: {
                name: '收集家',
                description: '收集所有類型的道具',
                icon: '💎',
                category: 'collection',
                condition: () => {
                    return this.playerData.collectibles.gems > 0 &&
                           this.playerData.collectibles.stars > 0 &&
                           this.playerData.collectibles.shells > 0 &&
                           this.playerData.collectibles.keys > 0;
                },
                reward: { skillPoints: 5, exp: 500 }
            },
            speedRunner: {
                name: '速通者',
                description: '完成關卡時間少於30秒',
                icon: '⚡',
                category: 'performance',
                condition: () => Object.values(this.playerData.fastestTimes).some(time => time < 30000),
                reward: { skillPoints: 8, exp: 800 }
            },
            perfectionist: {
                name: '完美主義者',
                description: '獲得滿分通關',
                icon: '⭐',
                category: 'performance',
                condition: () => Object.values(this.playerData.highScores).some(score => score >= 1000),
                reward: { skillPoints: 10, exp: 1000 }
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('marioProgressionData');
            if (saved) {
                const data = JSON.parse(saved);
                this.playerData = { ...this.playerData, ...data };
            }
        } catch (e) {
            console.warn('Failed to load progression data:', e);
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('marioProgressionData', JSON.stringify(this.playerData));
        } catch (e) {
            console.warn('Failed to save progression data:', e);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('coinCollected', (e) => this.onCoinCollected(e.detail));
        document.addEventListener('enemyDefeated', (e) => this.onEnemyDefeated(e.detail));
        document.addEventListener('levelCompleted', (e) => this.onLevelCompleted(e.detail));
        document.addEventListener('marioJump', () => this.addStat('totalJumps', 1));
        document.addEventListener('gameStart', () => this.startGameTimer());
    }
    
    // 經驗值系統
    addExperience(amount) {
        this.playerData.totalExperience += amount;
        this.playerData.experience += amount;
        
        let leveledUp = false;
        while (this.playerData.experience >= this.playerData.experienceToNext) {
            this.levelUp();
            leveledUp = true;
        }
        
        if (leveledUp) {
            this.showLevelUpAnimation();
        }
        
        this.saveData();
        this.updateUI();
    }
    
    levelUp() {
        this.playerData.level++;
        this.playerData.experience -= this.playerData.experienceToNext;
        this.playerData.experienceToNext = Math.floor(this.playerData.experienceToNext * 1.2);
        this.playerData.skillPoints += 3;
        
        // 提升基礎屬性
        this.playerData.stats.strength += 2;
        this.playerData.stats.agility += 2;
        this.playerData.stats.endurance += 2;
        this.playerData.stats.luck += 1;
        
        // 檢查新解鎖的裝備
        this.checkUnlockedEquipment();
        
        this.saveData();
    }
    
    // 技能樹系統
    canLearnSkill(category, skillName) {
        const skill = this.skillTree[category].skills[skillName];
        return skill.level < skill.max && this.playerData.skillPoints >= skill.cost;
    }
    
    learnSkill(category, skillName) {
        if (!this.canLearnSkill(category, skillName)) return false;
        
        const skill = this.skillTree[category].skills[skillName];
        skill.level++;
        this.playerData.skillPoints -= skill.cost;
        
        // 應用技能效果
        this.applySkillEffect(category, skillName, skill.level);
        
        this.saveData();
        this.updateUI();
        this.showSkillUnlockedAnimation(category, skillName);
        
        return true;
    }
    
    applySkillEffect(category, skillName, level) {
        const skill = this.skillTree[category].skills[skillName];
        const effect = skill.effect(level);
        
        // 將效果應用到瑪莉歐角色
        if (this.game.mario) {
            Object.keys(effect).forEach(key => {
                this.game.mario.skills = this.game.mario.skills || {};
                this.game.mario.skills[key] = effect[key];
            });
        }
        
        console.log(`Applied skill effect: ${skillName} level ${level}`, effect);
    }
    
    // 裝備系統
    equipItem(type, itemName) {
        const item = this.equipment[type][itemName];
        if (!item || !item.unlocked) return false;
        
        this.playerData.equipment[type] = itemName;
        
        // 應用裝備效果
        this.applyEquipmentEffects(item);
        
        this.saveData();
        this.updateUI();
        
        return true;
    }
    
    applyEquipmentEffects(equipment) {
        // 應用裝備效果到角色
        equipment.stats && Object.keys(equipment.stats).forEach(stat => {
            if (this.playerData.stats[stat] !== undefined) {
                this.playerData.stats[stat] += equipment.stats[stat];
            }
        });
        
        // 觸發特殊效果
        equipment.effects && equipment.effects.forEach(effect => {
            this.triggerEquipmentEffect(effect);
        });
    }
    
    triggerEquipmentEffect(effectName) {
        console.log(`Equipment effect triggered: ${effectName}`);
        // 實現各種特殊效果
        switch(effectName) {
            case 'doubleJumpBasic':
            case 'doubleJumpImproved':
            case 'doubleJumpAdvanced':
                if (this.game.mario) {
                    this.game.mario.doubleJumpAvailable = true;
                }
                break;
            case 'fireImmunity':
                if (this.game.mario) {
                    this.game.mario.fireImmune = true;
                }
                break;
            case 'rocketJump':
            case 'rocketJumpAdvanced':
                if (this.game.mario) {
                    this.game.mario.rocketJump = true;
                }
                break;
        }
    }
    
    checkUnlockedEquipment() {
        // 根據等級解鎖新裝備
        Object.keys(this.equipment).forEach(type => {
            Object.keys(this.equipment[type]).forEach(itemName => {
                const item = this.equipment[type][itemName];
                if (!item.unlocked && item.cost > 0) {
                    // 簡單的解鎖邏輯，可以根據需要調整
                    if (this.playerData.level >= Math.floor(item.cost / 50)) {
                        item.unlocked = true;
                    }
                }
            });
        });
    }
    
    // 成就系統
    checkAchievements() {
        Object.keys(this.achievements).forEach(achievementKey => {
            const achievement = this.achievements[achievementKey];
            if (!this.playerData.achievements.includes(achievementKey) && 
                achievement.condition()) {
                this.unlockAchievement(achievementKey);
            }
        });
    }
    
    unlockAchievement(achievementKey) {
        const achievement = this.achievements[achievementKey];
        this.playerData.achievements.push(achievementKey);
        
        // 發放獎勵
        if (achievement.reward.skillPoints) {
            this.playerData.skillPoints += achievement.reward.skillPoints;
        }
        if (achievement.reward.exp) {
            this.addExperience(achievement.reward.exp);
        }
        
        this.saveData();
        this.showAchievementUnlocked(achievement);
    }
    
    // 道具收集系統
    collectItem(type, amount = 1) {
        if (this.playerData.collectibles[type] !== undefined) {
            const multiplier = this.getCoinMultiplier();
            const actualAmount = type === 'coins' ? amount * multiplier : amount;
            
            this.playerData.collectibles[type] += actualAmount;
            this.checkAchievements();
            this.saveData();
            this.updateUI();
        }
    }
    
    getCoinMultiplier() {
        // 檢查雙倍金幣技能
        const collectionSkill = this.skillTree.collection.skills.doubleCoins;
        if (collectionSkill.level > 0) {
            return 1 + collectionSkill.level;
        }
        return 1;
    }
    
    // 統計系統
    addStat(statName, amount) {
        this.playerData.stats[statName] = (this.playerData.stats[statName] || 0) + amount;
    }
    
    getStat(statName) {
        return this.playerData.stats[statName] || 0;
    }
    
    // 事件處理
    onCoinCollected(detail) {
        this.collectItem('coins', detail.amount || 1);
        this.addExperience(10);
    }
    
    onEnemyDefeated(detail) {
        this.addExperience(25);
        this.addStat('enemiesDefeated', 1);
    }
    
    onLevelCompleted(detail) {
        const { levelId, score, time } = detail;
        
        // 更新最快時間
        if (!this.playerData.fastestTimes[levelId] || time < this.playerData.fastestTimes[levelId]) {
            this.playerData.fastestTimes[levelId] = time;
        }
        
        // 更新最高分數
        if (!this.playerData.highScores[levelId] || score > this.playerData.highScores[levelId]) {
            this.playerData.highScores[levelId] = score;
        }
        
        // 添加完成記錄
        if (!this.playerData.completedLevels.includes(levelId)) {
            this.playerData.completedLevels.push(levelId);
        }
        
        // 獎勵經驗值
        const expReward = Math.floor(score / 10) + Math.floor(50000 / (time / 1000));
        this.addExperience(expReward);
        
        this.checkAchievements();
        this.saveData();
    }
    
    // UI 動畫效果
    showLevelUpAnimation() {
        console.log('🎉 Level Up! Now level', this.playerData.level);
        // 這裡可以添加視覺效果
    }
    
    showSkillUnlockedAnimation(category, skillName) {
        const skill = this.skillTree[category].skills[skillName];
        console.log(`🚀 Unlocked skill: ${skill.name} (Level ${skill.level}/${skill.max})`);
        // 這裡可以添加視覺效果
    }
    
    showAchievementUnlocked(achievement) {
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        // 這裡可以添加視覺效果
    }
    
    // UI 更新
    updateUI() {
        // 更新遊戲界面上的進度顯示
        if (this.game && this.game.marioGame) {
            const marioGame = this.game.marioGame;
            
            // 更新等級和經驗值顯示
            const levelElement = document.getElementById('playerLevel');
            const expElement = document.getElementById('playerExperience');
            const skillPointsElement = document.getElementById('skillPoints');
            
            if (levelElement) levelElement.textContent = this.playerData.level;
            if (expElement) expElement.textContent = `${this.playerData.experience}/${this.playerData.experienceToNext}`;
            if (skillPointsElement) skillPointsElement.textContent = this.playerData.skillPoints;
        }
    }
    
    // 獲取完整進度數據
    getProgressData() {
        return {
            player: this.playerData,
            skillTree: this.skillTree,
            equipment: this.equipment,
            achievements: this.achievements
        };
    }
    
    // 重置進度（用於測試）
    resetProgress() {
        this.playerData = {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            totalExperience: 0,
            skillPoints: 3,
            achievements: [],
            stats: {
                strength: 10,
                agility: 10,
                endurance: 10,
                luck: 10
            },
            equipment: { hat: null, suit: null, shoes: null },
            inventory: [],
            collectibles: {
                coins: 0,
                gems: 0,
                stars: 0,
                shells: 0,
                keys: 0
            },
            specialItems: [],
            unlockedWorlds: ['start'],
            completedLevels: [],
            fastestTimes: {},
            highScores: {}
        };
        
        // 重置技能樹
        Object.keys(this.skillTree).forEach(category => {
            Object.keys(this.skillTree[category].skills).forEach(skillName => {
                this.skillTree[category].skills[skillName].level = 0;
            });
        });
        
        // 重置裝備解鎖狀態
        Object.keys(this.equipment).forEach(type => {
            Object.keys(this.equipment[type]).forEach(itemName => {
                this.equipment[type][itemName].unlocked = this.equipment[type][itemName].cost === 0;
            });
        });
        
        this.saveData();
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressionSystem;
}