/**
 * 3A級AI系統
 * 智能敵人行為和遊戲AI邏輯
 */
class AISystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        
        // AI狀態
        this.entities = [];
        this.behaviorTrees = {};
        this.pathfinder = null;
        this.aiEnabled = true;
        this.updateRate = 16; // ms
        
        // 記憶系統
        this.aiMemory = {
            playerPositions: [],
            threats: [],
            opportunities: [],
            lastUpdate: 0
        };
        
        // 敵人類型AI配置
        this.aiConfigs = {
            goomba: {
                name: 'Goomba',
                behavior: 'patrol',
                aggression: 0.3,
                intelligence: 0.2,
                awareness: 0.4,
                evasion: 0.1,
                patterns: ['patrol', 'chase', 'flee', 'hide'],
                reactions: {
                    damage: 'flee',
                    level_start: 'patrol',
                    player_close: 'chase'
                }
            },
            koopa: {
                name: 'Koopa',
                behavior: 'defensive',
                aggression: 0.5,
                intelligence: 0.4,
                awareness: 0.6,
                evasion: 0.3,
                patterns: ['defend', 'counter', 'retreat', 'ambush'],
                reactions: {
                    damage: 'counter',
                    player_close: 'defend',
                    allied_under_attack: 'counter'
                }
            },
            piranha: {
                name: 'Piranha',
                behavior: 'predator',
                aggression: 0.8,
                intelligence: 0.6,
                awareness: 0.9,
                evasion: 0.7,
                patterns: ['lurk', 'ambush', 'pursue', 'retreat'],
                reactions: {
                    player_approaching: 'ambush',
                    player_distracted: 'pursue',
                    player_far: 'lurk'
                }
            },
            thwomp: {
                name: 'Thwomp',
                behavior: 'trap',
                aggression: 0.9,
                intelligence: 0.1,
                awareness: 0.8,
                evasion: 0.0,
                patterns: ['idle', 'trigger', 'fall', 'reset'],
                reactions: {
                    player_above: 'trigger',
                    player_hit: 'fall',
                    reset_complete: 'idle'
                }
            },
            hammerBro: {
                name: 'Hammer Bro',
                behavior: 'ranged',
                aggression: 0.9,
                intelligence: 0.8,
                awareness: 0.9,
                evasion: 0.6,
                patterns: ['ranged_combat', 'flank', 'evade', 'retreat'],
                reactions: {
                    player_close: 'ranged_combat',
                    player_far: 'flank',
                    player_weak: 'retreat'
                }
            }
        };
        
        // 行為樹節點類型
        this.behaviorNodes = {
            SEQUENCE: 'sequence',
            SELECTOR: 'selector',
            PARALLEL: 'parallel',
            CONDITION: 'condition',
            ACTION: 'action',
            DECORATOR: 'decorator'
        };
        
        this.init();
    }
    
    init() {
        this.createBehaviorTrees();
        this.setupPathfinding();
        this.startAIUpdateLoop();
    }
    
    // ==================== 行為樹系統 ====================
    
    createBehaviorTrees() {
        // 為每種敵人類型創建行為樹
        Object.keys(this.aiConfigs).forEach(enemyType => {
            this.behaviorTrees[enemyType] = this.createBehaviorTree(this.aiConfigs[enemyType]);
        });
    }
    
    createBehaviorTree(config) {
        const tree = {
            name: `${config.name}_BehaviorTree`,
            root: null,
            config: config
        };
        
        // 根據行為類型創建不同的根節點
        switch (config.behavior) {
            case 'patrol':
                tree.root = this.createPatrolBehavior(config);
                break;
            case 'defensive':
                tree.root = this.createDefensiveBehavior(config);
                break;
            case 'predator':
                tree.root = this.createPredatorBehavior(config);
                break;
            case 'trap':
                tree.root = this.createTrapBehavior(config);
                break;
            case 'ranged':
                tree.root = this.createRangedBehavior(config);
                break;
        }
        
        return tree;
    }
    
    createPatrolBehavior(config) {
        return {
            type: this.behaviorNodes.SEQUENCE,
            children: [
                {
                    type: this.behaviorNodes.SELECTOR,
                    children: [
                        this.createPlayerCloseCondition(config),
                        this.createDefaultPatrolAction(config)
                    ]
                },
                this.createUpdatePatrolAction(config)
            ]
        };
    }
    
    createDefensiveBehavior(config) {
        return {
            type: this.behaviorNodes.SEQUENCE,
            children: [
                {
                    type: this.behaviorNodes.PARALLEL,
                    children: [
                        this.createThreatDetection(config),
                        this.createDefensivePosture(config)
                    ]
                },
                this.createCounterAction(config)
            ]
        };
    }
    
    createPredatorBehavior(config) {
        return {
            type: this.behaviorNodes.SEQUENCE,
            children: [
                {
                    type: this.behaviorNodes.SELECTOR,
                    children: [
                        this.createAmbushCondition(config),
                        this.createPursuitCondition(config),
                        this.createHuntAction(config)
                    ]
                },
                this.createAttackPattern(config)
            ]
        };
    }
    
    createTrapBehavior(config) {
        return {
            type: this.behaviorNodes.SELECTOR,
            children: [
                this.createTriggerCondition(config),
                this.createResetAction(config)
            ]
        };
    }
    
    createRangedBehavior(config) {
        return {
            type: this.behaviorNodes.SEQUENCE,
            children: [
                {
                    type: this.behaviorNodes.PARALLEL,
                    children: [
                        this.createDistanceCalculation(config),
                        this.createEvasionPattern(config)
                    ]
                },
                this.createRangedAttackAction(config)
            ]
        };
    }
    
    // ==================== 行為樹節點創建 ====================
    
    createPlayerCloseCondition(config) {
        return {
            type: this.behaviorNodes.CONDITION,
            name: 'PlayerClose',
            evaluate: (entity, context) => {
                const player = this.game.mario;
                if (!player) return false;
                
                const distance = Math.sqrt(
                    Math.pow(player.x - entity.x, 2) + 
                    Math.pow(player.y - entity.y, 2)
                );
                
                return distance < config.awareness * 200;
            },
            onTrue: () => {
                this.triggerAIEvent(entity, 'player_close');
            }
        };
    }
    
    createDefaultPatrolAction(config) {
        return {
            type: this.behaviorNodes.ACTION,
            name: 'Patrol',
            execute: (entity, context) => {
                const patrolRange = 100;
                const speed = config.intelligence * 2;
                
                if (!entity.aiState) {
                    entity.aiState = {
                        direction: Math.random() < 0.5 ? 1 : -1,
                        targetX: entity.x + (Math.random() - 0.5) * patrolRange,
                        lastDirectionChange: Date.now()
                    };
                }
                
                // 隨機改變方向
                const now = Date.now();
                if (now - entity.aiState.lastDirectionChange > 3000 + Math.random() * 2000) {
                    entity.aiState.direction *= -1;
                    entity.aiState.targetX = entity.x + entity.aiState.direction * patrolRange;
                    entity.aiState.lastDirectionChange = now;
                }
                
                // 移動
                entity.x += entity.aiState.direction * speed;
                
                // 邊界檢查
                if (entity.x < entity.aiState.targetX - 20 && entity.aiState.direction > 0) {
                    entity.aiState.direction = -1;
                } else if (entity.x > entity.aiState.targetX + 20 && entity.aiState.direction < 0) {
                    entity.aiState.direction = 1;
                }
                
                return this.behaviorNodes.ACTION.RUNNING;
            }
        };
    }
    
    createThreatDetection(config) {
        return {
            type: this.behaviorNodes.CONDITION,
            name: 'ThreatDetected',
            evaluate: (entity, context) => {
                // 檢查玩家攻擊範圍
                const player = this.game.mario;
                if (!player) return false;
                
                const isAttacking = player.state === 'jumping' || 
                                   this.isPlayerInRange(entity, player, 80);
                
                if (isAttacking && Math.random() < config.aggression) {
                    this.addToMemory('threats', {
                        type: 'player_attack',
                        entity: entity,
                        intensity: config.aggression,
                        timestamp: Date.now()
                    });
                    return true;
                }
                
                return false;
            }
        };
    }
    
    createCounterAction(config) {
        return {
            type: this.behaviorNodes.ACTION,
            name: 'Counter',
            execute: (entity, context) => {
                // 防禦姿態
                entity.state = 'defending';
                entity.velocityX = 0;
                
                // 準備反擊
                if (!entity.aiState) {
                    entity.aiState = {
                        defending: true,
                        counterReady: false,
                        reactionTime: config.intelligence * 500
                    };
                }
                
                // 隨機反擊
                if (Math.random() < 0.1 && entity.aiState.reactionTime <= 0) {
                    entity.aiState.counterReady = true;
                    this.triggerAIEvent(entity, 'ready_to_counter');
                }
                
                entity.aiState.reactionTime -= 16; // 假設60fps
                
                return this.behaviorNodes.ACTION.RUNNING;
            }
        };
    }
    
    createAmbushCondition(config) {
        return {
            type: this.behaviorNodes.CONDITION,
            name: 'AmbushReady',
            evaluate: (entity, context) => {
                const player = this.game.mario;
                if (!player) return false;
                
                // 檢查玩家是否在獵食範圍內且沒有察覺
                const distance = this.getDistance(entity, player);
                const isDistracted = player.state !== 'alert';
                
                if (distance < config.awareness * 150 && isDistracted && Math.random() < 0.8) {
                    return true;
                }
                
                return false;
            }
        };
    }
    
    createPursuitCondition(config) {
        return {
            type: this.behaviorNodes.CONDITION,
            name: 'PursuitTarget',
            evaluate: (entity, context) => {
                const player = this.game.mario;
                if (!player) return false;
                
                const distance = this.getDistance(entity, player);
                
                // 檢查玩家是否在視線範圍內
                if (distance < config.intelligence * 300 && Math.random() < config.aggression) {
                    this.addToMemory('opportunities', {
                        type: 'pursuit',
                        target: player,
                        distance: distance,
                        timestamp: Date.now()
                    });
                    return true;
                }
                
                return false;
            }
        };
    }
    
    createHuntAction(config) {
        return {
            type: this.behaviorNodes.ACTION,
            name: 'Hunt',
            execute: (entity, context) => {
                const player = this.game.mario;
                if (!player) return this.behaviorNodes.ACTION.FAILURE;
                
                const speed = config.intelligence * 3;
                const direction = Math.sign(player.x - entity.x);
                
                // 智能追蹤（不完全直線追蹤）
                if (!entity.aiState) {
                    entity.aiState = {
                        lastPlayerX: player.x,
                        predictionOffset: Math.random() * 50 - 25
                    };
                }
                
                // 預測玩家位置
                const predictedX = player.x + entity.aiState.predictionOffset;
                const moveDirection = Math.sign(predictedX - entity.x);
                
                entity.x += moveDirection * speed;
                entity.velocityX = moveDirection * speed;
                
                // 儲存玩家位置到記憶
                entity.aiState.lastPlayerX = player.x;
                
                return this.behaviorNodes.ACTION.RUNNING;
            }
        };
    }
    
    createAttackPattern(config) {
        return {
            type: this.behaviorNodes.ACTION,
            name: 'Attack',
            execute: (entity, context) => {
                const player = this.game.mario;
                if (!player) return this.behaviorNodes.ACTION.FAILURE;
                
                const distance = this.getDistance(entity, player);
                
                // 攻擊策略
                if (distance < 60) {
                    // 近距離攻擊
                    if (Math.random() < config.aggression * 0.8) {
                        entity.state = 'attacking';
                        this.triggerAIEvent(entity, 'melee_attack');
                        return this.behaviorNodes.ACTION.SUCCESS;
                    }
                } else if (distance < 150) {
                    // 遠程攻擊
                    if (Math.random() < config.aggression * 0.3) {
                        entity.state = 'ranged_attacking';
                        this.triggerAIEvent(entity, 'ranged_attack');
                        return this.behaviorNodes.ACTION.SUCCESS;
                    }
                }
                
                return this.behaviorNodes.ACTION.RUNNING;
            }
        };
    }
    
    // ==================== 路徑尋找系統 ====================
    
    setupPathfinding() {
        this.pathfinder = new AStarPathfinder(this.canvas.width, this.canvas.height);
    }
    
    findPath(startX, startY, endX, endY, obstacles = []) {
        const startNode = { x: Math.floor(startX / 50), y: Math.floor(startY / 50) };
        const endNode = { x: Math.floor(endX / 50), y: Math.floor(endY / 50) };
        
        // 轉換障礙物為網格
        const gridObstacles = obstacles.map(obs => ({
            x: Math.floor(obs.x / 50),
            y: Math.floor(obs.y / 50)
        }));
        
        return this.pathfinder.findPath(startNode, endNode, gridObstacles);
    }
    
    // ==================== AI更新循環 ====================
    
    startAIUpdateLoop() {
        setInterval(() => {
            if (this.aiEnabled) {
                this.updateAI();
            }
        }, this.updateRate);
    }
    
    updateAI() {
        // 更新AI記憶
        this.updateAIMemory();
        
        // 更新所有AI實體
        this.entities.forEach(entity => {
            if (entity.aiEnabled !== false) {
                this.updateEntityAI(entity);
            }
        });
    }
    
    updateEntityAI(entity) {
        if (!entity.type || !this.behaviorTrees[entity.type]) return;
        
        const behaviorTree = this.behaviorTrees[entity.type];
        const context = this.createAIContext(entity);
        
        // 執行行為樹
        this.executeBehaviorTree(behaviorTree.root, entity, context);
        
        // 更新實體狀態
        this.updateEntityState(entity);
    }
    
    executeBehaviorTree(node, entity, context) {
        if (!node) return this.behaviorNodes.ACTION.FAILURE;
        
        switch (node.type) {
            case this.behaviorNodes.SEQUENCE:
                return this.executeSequence(node, entity, context);
            case this.behaviorNodes.SELECTOR:
                return this.executeSelector(node, entity, context);
            case this.behaviorNodes.PARALLEL:
                return this.executeParallel(node, entity, context);
            case this.behaviorNodes.CONDITION:
                return this.executeCondition(node, entity, context);
            case this.behaviorNodes.ACTION:
                return this.executeAction(node, entity, context);
            default:
                return this.behaviorNodes.ACTION.FAILURE;
        }
    }
    
    executeSequence(node, entity, context) {
        for (let child of node.children) {
            const result = this.executeBehaviorTree(child, entity, context);
            if (result === this.behaviorNodes.ACTION.FAILURE) {
                return this.behaviorNodes.ACTION.FAILURE;
            }
        }
        return this.behaviorNodes.ACTION.SUCCESS;
    }
    
    executeSelector(node, entity, context) {
        for (let child of node.children) {
            const result = this.executeBehaviorTree(child, entity, context);
            if (result === this.behaviorNodes.ACTION.SUCCESS) {
                return this.behaviorNodes.ACTION.SUCCESS;
            }
        }
        return this.behaviorNodes.ACTION.FAILURE;
    }
    
    executeParallel(node, entity, context) {
        let runningCount = 0;
        for (let child of node.children) {
            const result = this.executeBehaviorTree(child, entity, context);
            if (result === this.behaviorNodes.ACTION.RUNNING) {
                runningCount++;
            } else if (result === this.behaviorNodes.ACTION.FAILURE) {
                return this.behaviorNodes.ACTION.FAILURE;
            }
        }
        return runningCount > 0 ? this.behaviorNodes.ACTION.RUNNING : this.behaviorNodes.ACTION.SUCCESS;
    }
    
    executeCondition(node, entity, context) {
        const result = node.evaluate(entity, context);
        if (result) {
            if (node.onTrue) node.onTrue(entity);
            return this.behaviorNodes.ACTION.SUCCESS;
        }
        return this.behaviorNodes.ACTION.FAILURE;
    }
    
    executeAction(node, entity, context) {
        if (!node.execute) return this.behaviorNodes.ACTION.FAILURE;
        return node.execute(entity, context);
    }
    
    // ==================== AI工具方法 ====================
    
    createAIContext(entity) {
        return {
            entity: entity,
            game: this.game,
            canvas: this.canvas,
            config: this.aiConfigs[entity.type] || {},
            memory: this.aiMemory,
            environment: this.getEnvironmentContext(entity)
        };
    }
    
    getEnvironmentContext(entity) {
        return {
            platform: this.getPlatformAt(entity.x, entity.y),
            nearbyEntities: this.getNearbyEntities(entity),
            player: this.game.mario,
            obstacles: this.getNearbyObstacles(entity)
        };
    }
    
    getPlatformAt(x, y) {
        return this.game.platforms?.find(p => 
            x >= p.x && x <= p.x + p.width && 
            y >= p.y && y <= p.y + p.height
        );
    }
    
    getNearbyEntities(entity, radius = 200) {
        return this.entities.filter(e => 
            e !== entity && 
            Math.sqrt(Math.pow(e.x - entity.x, 2) + Math.pow(e.y - entity.y, 2)) < radius
        );
    }
    
    getNearbyObstacles(entity) {
        // 返回附近的障礙物
        return this.game.platforms?.filter(p => 
            Math.abs(p.x - entity.x) < 100 && 
            Math.abs(p.y - entity.y) < 100
        ) || [];
    }
    
    isPlayerInRange(entity, player, range) {
        const distance = this.getDistance(entity, player);
        return distance < range;
    }
    
    getDistance(entity1, entity2) {
        return Math.sqrt(
            Math.pow(entity1.x - entity2.x, 2) + 
            Math.pow(entity1.y - entity2.y, 2)
        );
    }
    
    // ==================== 記憶系統 ====================
    
    updateAIMemory() {
        const now = Date.now();
        
        // 清理過期的記憶（超過10秒）
        Object.keys(this.aiMemory).forEach(key => {
            if (Array.isArray(this.aiMemory[key])) {
                this.aiMemory[key] = this.aiMemory[key].filter(
                    item => now - item.timestamp < 10000
                );
            }
        });
        
        // 更新玩家位置記憶
        if (this.game.mario) {
            this.aiMemory.playerPositions.push({
                x: this.game.mario.x,
                y: this.game.mario.y,
                timestamp: now
            });
            
            // 限制玩家位置記錄數量
            if (this.aiMemory.playerPositions.length > 10) {
                this.aiMemory.playerPositions.shift();
            }
        }
    }
    
    addToMemory(type, data) {
        if (this.aiMemory[type]) {
            this.aiMemory[type].push({
                ...data,
                timestamp: Date.now()
            });
        }
    }
    
    getFromMemory(type, filter = null) {
        if (!this.aiMemory[type]) return [];
        
        if (filter) {
            return this.aiMemory[type].filter(filter);
        }
        
        return this.aiMemory[type];
    }
    
    // ==================== AI事件系統 ====================
    
    triggerAIEvent(entity, eventType) {
        // 觸發AI事件，如音效、動畫等
        document.dispatchEvent(new CustomEvent('aiEvent', {
            detail: {
                entity: entity,
                eventType: eventType,
                timestamp: Date.now()
            }
        }));
        
        console.log(`🤖 AI Event: ${entity.type} -> ${eventType}`);
    }
    
    // ==================== 實體管理 ====================
    
    addEntity(entity) {
        entity.aiEnabled = true;
        entity.aiState = null;
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    
    updateEntityState(entity) {
        // 清理無效的AI狀態
        if (entity.aiState && entity.aiState.lastUpdate) {
            const age = Date.now() - entity.aiState.lastUpdate;
            if (age > 30000) { // 30秒清理
                entity.aiState = null;
            }
        }
        
        if (!entity.aiState) entity.aiState = {};
        entity.aiState.lastUpdate = Date.now();
    }
    
    // ==================== 公共接口 ====================
    
    enableAI() {
        this.aiEnabled = true;
    }
    
    disableAI() {
        this.aiEnabled = false;
    }
    
    setAIUpdateRate(rate) {
        this.updateRate = Math.max(1, rate);
    }
    
    getEntities() {
        return this.entities;
    }
    
    getAIStats() {
        return {
            enabled: this.aiEnabled,
            entityCount: this.entities.length,
            memorySize: {
                playerPositions: this.aiMemory.playerPositions.length,
                threats: this.aiMemory.threats.length,
                opportunities: this.aiMemory.opportunities.length
            },
            updateRate: this.updateRate
        };
    }
}

// A*路徑尋找算法
class AStarPathfinder {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.gridSize = 50;
    }
    
    findPath(start, end, obstacles) {
        const openSet = [];
        const closedSet = [];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        // 初始化
        const startKey = this.nodeToKey(start);
        const endKey = this.nodeToKey(end);
        
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, end));
        openSet.push(startKey);
        
        while (openSet.length > 0) {
            // 找到fScore最小的節點
            let currentKey = openSet.reduce((min, node) => 
                (fScore.get(node) || Infinity) < (fScore.get(min) || Infinity) ? node : min
            );
            
            if (currentKey === endKey) {
                return this.reconstructPath(cameFrom, currentKey);
            }
            
            // 移除當前節點
            openSet.splice(openSet.indexOf(currentKey), 1);
            closedSet.push(currentKey);
            
            const current = this.keyToNode(currentKey);
            const neighbors = this.getNeighbors(current);
            
            for (let neighbor of neighbors) {
                const neighborKey = this.nodeToKey(neighbor);
                
                // 跳過障礙物和已訪問節點
                if (this.isObstacle(neighbor, obstacles) || closedSet.includes(neighborKey)) {
                    continue;
                }
                
                const tentativeGScore = gScore.get(currentKey) + this.distance(current, neighbor);
                
                if (!openSet.includes(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));
                    
                    if (!openSet.includes(neighborKey)) {
                        openSet.push(neighborKey);
                    }
                }
            }
        }
        
        return []; // 無路徑
    }
    
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 }
        ];
        
        for (let dir of directions) {
            const neighbor = {
                x: node.x + dir.x,
                y: node.y + dir.y
            };
            
            if (neighbor.x >= 0 && neighbor.x < this.width / this.gridSize &&
                neighbor.y >= 0 && neighbor.y < this.height / this.gridSize) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }
    
    isObstacle(node, obstacles) {
        return obstacles.some(obs => obs.x === node.x && obs.y === node.y);
    }
    
    nodeToKey(node) {
        return `${node.x},${node.y}`;
    }
    
    keyToNode(key) {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    }
    
    reconstructPath(cameFrom, current) {
        const path = [];
        let key = current;
        
        while (cameFrom.has(key)) {
            path.unshift(this.keyToNode(key));
            key = cameFrom.get(key);
        }
        
        return path;
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AISystem, AStarPathfinder };
}