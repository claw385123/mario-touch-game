/**
 * 3A級動態天氣系統
 * 豐富的環境天氣效果系統
 */
class WeatherSystem {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        
        // 天氣狀態
        this.currentWeather = 'clear'; // 'clear', 'rain', 'snow', 'fog', 'storm', 'wind'
        this.weatherIntensity = 0; // 0-1
        this.weatherTransition = 0; // 天氣變化進度
        this.transitionSpeed = 0.02;
        
        // 天氣參數
        this.weatherParams = {
            clear: {
                name: '晴天',
                particleDensity: 0,
                windSpeed: 0,
                visibility: 1.0,
                fogDensity: 0,
                colors: {
                    sky: ['#87CEEB', '#98FB98'],
                    overlay: 'rgba(255, 255, 255, 0)'
                }
            },
            rain: {
                name: '雨天',
                particleDensity: 150,
                windSpeed: 2,
                visibility: 0.8,
                fogDensity: 0.1,
                colors: {
                    sky: ['#708090', '#2F4F4F'],
                    overlay: 'rgba(30, 144, 255, 0.1)'
                }
            },
            snow: {
                name: '雪天',
                particleDensity: 100,
                windSpeed: 1,
                visibility: 0.7,
                fogDensity: 0.15,
                colors: {
                    sky: ['#E6E6FA', '#F0F8FF'],
                    overlay: 'rgba(255, 250, 250, 0.2)'
                }
            },
            fog: {
                name: '霧天',
                particleDensity: 20,
                windSpeed: 0.5,
                visibility: 0.4,
                fogDensity: 0.4,
                colors: {
                    sky: ['#D3D3D3', '#F5F5F5'],
                    overlay: 'rgba(169, 169, 169, 0.3)'
                }
            },
            storm: {
                name: '暴風雨',
                particleDensity: 200,
                windSpeed: 4,
                visibility: 0.3,
                fogDensity: 0.3,
                colors: {
                    sky: ['#2F2F2F', '#000000'],
                    overlay: 'rgba(75, 0, 130, 0.2)'
                }
            },
            wind: {
                name: '強風',
                particleDensity: 80,
                windSpeed: 3,
                visibility: 0.9,
                fogDensity: 0.05,
                colors: {
                    sky: ['#87CEEB', '#F0E68C'],
                    overlay: 'rgba(255, 255, 224, 0.1)'
                }
            }
        };
        
        // 粒子系統
        this.particles = [];
        this.lightning = {
            active: false,
            x: 0,
            y: 0,
            duration: 200,
            startTime: 0,
            branches: []
        };
        
        // 風力效果
        this.windParticles = [];
        
        // 天氣變化計時器
        this.weatherTimer = 0;
        this.weatherChangeInterval = 60000; // 60秒
        this.autoWeatherChange = true;
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 根據遊戲事件改變天氣
        if (this.game) {
            document.addEventListener('levelComplete', () => this.onLevelComplete());
            document.addEventListener('enemyDefeated', () => this.onEnemyDefeated());
            document.addEventListener('powerUpCollected', () => this.onPowerUpCollected());
        }
    }
    
    // ==================== 天氣控制 ====================
    
    setWeather(weatherType, intensity = 1) {
        if (this.weatherParams[weatherType]) {
            this.currentWeather = weatherType;
            this.weatherIntensity = intensity;
            this.weatherTransition = 0;
            this.updateParticleCount();
            
            console.log(`Weather changed to: ${this.weatherParams[weatherType].name}`);
        }
    }
    
    randomizeWeather() {
        const weatherTypes = Object.keys(this.weatherParams);
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        const intensity = 0.3 + Math.random() * 0.7; // 0.3-1.0
        
        this.setWeather(randomWeather, intensity);
    }
    
    updateWeather() {
        this.weatherTimer += 16; // 假設60fps
        
        // 自動天氣變化
        if (this.autoWeatherChange && this.weatherTimer >= this.weatherChangeInterval) {
            this.randomizeWeather();
            this.weatherTimer = 0;
        }
        
        // 天氣過渡動畫
        if (this.weatherTransition < 1) {
            this.weatherTransition += this.transitionSpeed;
        }
        
        // 閃電效果
        if (this.lightning.active) {
            this.updateLightning();
        }
    }
    
    // ==================== 粒子系統 ====================
    
    createParticles() {
        this.particles = [];
        
        switch (this.currentWeather) {
            case 'rain':
                this.createRainParticles();
                break;
            case 'snow':
                this.createSnowParticles();
                break;
            case 'fog':
                this.createFogParticles();
                break;
            case 'storm':
                this.createStormParticles();
                break;
            case 'wind':
                this.createWindParticles();
                break;
        }
    }
    
    createRainParticles() {
        const density = this.weatherParams.rain.particleDensity * this.weatherIntensity;
        
        for (let i = 0; i < density; i++) {
            this.particles.push({
                type: 'rain',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 8 + Math.random() * 4,
                vy: 12 + Math.random() * 8,
                length: 10 + Math.random() * 10,
                opacity: 0.3 + Math.random() * 0.4,
                wind: this.weatherParams.rain.windSpeed
            });
        }
    }
    
    createSnowParticles() {
        const density = this.weatherParams.snow.particleDensity * this.weatherIntensity;
        
        for (let i = 0; i < density; i++) {
            this.particles.push({
                type: 'snow',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: 2 + Math.random() * 3,
                size: 2 + Math.random() * 4,
                opacity: 0.4 + Math.random() * 0.3,
                wind: this.weatherParams.snow.windSpeed,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    createFogParticles() {
        const density = this.weatherParams.fog.particleDensity * this.weatherIntensity;
        
        for (let i = 0; i < density; i++) {
            this.particles.push({
                type: 'fog',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 0.5,
                size: 20 + Math.random() * 60,
                opacity: 0.1 + Math.random() * 0.2,
                wind: this.weatherParams.fog.windSpeed
            });
        }
    }
    
    createStormParticles() {
        // 暴風雨 = 大雨 + 強風 + 閃電
        this.createRainParticles();
        
        // 添加閃電
        if (Math.random() < 0.1) {
            this.createLightning();
        }
    }
    
    createWindParticles() {
        const density = this.weatherParams.wind.particleDensity * this.weatherIntensity;
        
        for (let i = 0; i < density; i++) {
            this.particles.push({
                type: 'wind',
                x: -50,
                y: Math.random() * this.canvas.height,
                vx: 5 + Math.random() * 5,
                vy: (Math.random() - 0.5) * 3,
                size: 3 + Math.random() * 8,
                opacity: 0.2 + Math.random() * 0.3,
                wind: this.weatherParams.wind.windSpeed,
                trail: []
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            // 應用風力
            particle.vx += particle.wind * 0.1;
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 特殊粒子的動畫
            if (particle.type === 'snow') {
                particle.rotation += particle.rotationSpeed;
            }
            
            if (particle.type === 'fog') {
                // 霧的緩慢移動
                particle.opacity += (Math.random() - 0.5) * 0.02;
                particle.opacity = Math.max(0.05, Math.min(0.3, particle.opacity));
            }
            
            if (particle.type === 'wind') {
                // 風粒子尾跡
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > 5) {
                    particle.trail.shift();
                }
            }
            
            // 邊界處理
            if (particle.x > this.canvas.width + 100 || 
                particle.y > this.canvas.height + 100 ||
                particle.x < -100) {
                
                // 重新生成粒子
                this.respawnParticle(particle);
            }
            
            return true;
        });
    }
    
    respawnParticle(particle) {
        switch (particle.type) {
            case 'rain':
                particle.x = Math.random() * this.canvas.width;
                particle.y = -10;
                particle.vy = 12 + Math.random() * 8;
                break;
            case 'snow':
                particle.x = Math.random() * this.canvas.width;
                particle.y = -10;
                particle.vy = 2 + Math.random() * 3;
                particle.rotation = Math.random() * Math.PI * 2;
                break;
            case 'wind':
                particle.x = -50;
                particle.y = Math.random() * this.canvas.height;
                particle.vy = (Math.random() - 0.5) * 3;
                particle.trail = [];
                break;
            case 'fog':
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
                particle.vx = (Math.random() - 0.5) * 1;
                particle.vy = (Math.random() - 0.5) * 0.5;
                break;
        }
    }
    
    updateParticleCount() {
        // 根據天氣強度調整粒子數量
        const targetCount = this.weatherParams[this.currentWeather].particleDensity * this.weatherIntensity;
        const currentCount = this.particles.length;
        
        if (currentCount < targetCount) {
            // 添加粒子
            for (let i = 0; i < targetCount - currentCount; i++) {
                this.createParticles();
            }
        } else if (currentCount > targetCount) {
            // 移除多餘粒子
            this.particles = this.particles.slice(0, targetCount);
        }
    }
    
    // ==================== 閃電系統 ====================
    
    createLightning() {
        this.lightning.active = true;
        this.lightning.startTime = Date.now();
        this.lightning.x = Math.random() * this.canvas.width;
        this.lightning.y = 0;
        
        // 生成閃電分支
        this.lightning.branches = [];
        this.generateLightningBranches(this.lightning.x, this.lightning.y, 0);
    }
    
    generateLightningBranches(x, y, depth) {
        if (depth > 3) return;
        
        const branchCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < branchCount; i++) {
            const newX = x + (Math.random() - 0.5) * 100;
            const newY = y + 50 + Math.random() * 100;
            
            this.lightning.branches.push({
                x1: x,
                y1: y,
                x2: newX,
                y2: newY,
                width: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2
            });
            
            if (Math.random() < 0.3) {
                this.generateLightningBranches(newX, newY, depth + 1);
            }
        }
    }
    
    updateLightning() {
        const elapsed = Date.now() - this.lightning.startTime;
        
        if (elapsed > this.lightning.duration) {
            this.lightning.active = false;
        }
    }
    
    // ==================== 渲染系統 ====================
    
    render() {
        this.renderBackground();
        this.renderParticles();
        this.renderLightning();
        this.renderOverlay();
        this.renderUI();
    }
    
    renderBackground() {
        const params = this.weatherParams[this.currentWeather];
        const alpha = this.weatherTransition;
        
        // 天空顏色過渡
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.interpolateColor(params.colors.sky[0], '#87CEEB', 1 - alpha));
        gradient.addColorStop(0.7, this.interpolateColor(params.colors.sky[1], '#98FB98', 1 - alpha));
        gradient.addColorStop(1, '#8B4513');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新雲朵
        this.updateClouds();
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.opacity * this.weatherTransition;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            switch (particle.type) {
                case 'rain':
                    this.renderRainParticle(particle);
                    break;
                case 'snow':
                    this.renderSnowParticle(particle);
                    break;
                case 'fog':
                    this.renderFogParticle(particle);
                    break;
                case 'wind':
                    this.renderWindParticle(particle);
                    break;
            }
            
            this.ctx.restore();
        });
    }
    
    renderRainParticle(particle) {
        this.ctx.strokeStyle = '#4169E1';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(particle.x - particle.vx * 0.3, particle.y - particle.length);
        this.ctx.stroke();
    }
    
    renderSnowParticle(particle) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderFogParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, 'rgba(169, 169, 169, 0.3)');
        gradient.addColorStop(1, 'rgba(169, 169, 169, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2
        );
    }
    
    renderWindParticle(particle) {
        // 繪製尾跡
        if (particle.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            particle.trail.forEach((point, index) => {
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            
            this.ctx.stroke();
        }
        
        // 繪製風粒子
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderLightning() {
        if (!this.lightning.active) return;
        
        const elapsed = Date.now() - this.lightning.startTime;
        const alpha = Math.max(0, 1 - elapsed / this.lightning.duration);
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#87CEEB';
        this.ctx.shadowBlur = 20;
        
        // 主閃電
        this.ctx.beginPath();
        this.ctx.moveTo(this.lightning.x, this.lightning.y);
        this.ctx.lineTo(this.lightning.x, this.canvas.height);
        this.ctx.stroke();
        
        // 閃電分支
        this.lightning.branches.forEach(branch => {
            this.ctx.lineWidth = branch.width;
            this.ctx.globalAlpha = branch.opacity * alpha;
            this.ctx.beginPath();
            this.ctx.moveTo(branch.x1, branch.y1);
            this.ctx.lineTo(branch.x2, branch.y2);
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }
    
    renderOverlay() {
        const params = this.weatherParams[this.currentWeather];
        const alpha = params.colors.overlay ? 
            (parseFloat(params.colors.overlay.split(',')[3]) || 0.1) * this.weatherTransition : 0;
        
        if (alpha > 0) {
            this.ctx.fillStyle = params.colors.overlay;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 霧效果
        if (this.currentWeather === 'fog' || this.weatherParams[this.currentWeather].fogDensity > 0) {
            const fogDensity = this.weatherParams[this.currentWeather].fogDensity * this.weatherTransition;
            this.renderFogOverlay(fogDensity);
        }
    }
    
    renderFogOverlay(density) {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, `rgba(169, 169, 169, ${density * 0.3})`);
        gradient.addColorStop(1, `rgba(169, 169, 169, ${density})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderUI() {
        // 顯示當前天氣信息
        if (this.weatherTransition > 0.5) {
            const params = this.weatherParams[this.currentWeather];
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, this.canvas.height - 40, 200, 30);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`${params.name} (${Math.round(this.weatherIntensity * 100)}%)`, 20, this.canvas.height - 20);
        }
    }
    
    // ==================== 雲朵系統 ====================
    
    updateClouds() {
        // 根據天氣類型調整雲朵
        const cloudParams = this.getCloudParams();
        this.renderClouds(cloudParams);
    }
    
    getCloudParams() {
        const params = this.weatherParams[this.currentWeather];
        const intensity = this.weatherIntensity;
        
        switch (this.currentWeather) {
            case 'clear':
                return { count: 3, opacity: 0.6, size: 1 };
            case 'rain':
                return { count: 8, opacity: 0.8, size: 1.2 };
            case 'snow':
                return { count: 6, opacity: 0.7, size: 1.1 };
            case 'fog':
                return { count: 2, opacity: 0.9, size: 1.5 };
            case 'storm':
                return { count: 12, opacity: 0.9, size: 1.3 };
            case 'wind':
                return { count: 4, opacity: 0.5, size: 0.8 };
            default:
                return { count: 3, opacity: 0.6, size: 1 };
        }
    }
    
    renderClouds(params) {
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < params.count; i++) {
            const x = (time * 20 * (i % 2 === 0 ? 1 : -1) + i * 200) % (this.canvas.width + 200) - 100;
            const y = 50 + Math.sin(time + i) * 20;
            const size = params.size * (50 + i * 20);
            
            this.ctx.save();
            this.ctx.globalAlpha = params.opacity * this.weatherTransition;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.4, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.arc(x - size * 0.4, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    // ==================== 工具方法 ====================
    
    interpolateColor(color1, color2, factor) {
        // 簡化的顏色插值
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // ==================== 事件處理 ====================
    
    onLevelComplete() {
        // 關卡完成時改變為晴天
        this.setWeather('clear');
    }
    
    onEnemyDefeated() {
        // 擊敗敵人時小機率觸發閃電
        if (this.currentWeather === 'storm' && Math.random() < 0.3) {
            this.createLightning();
        }
    }
    
    onPowerUpCollected() {
        // 收集道具時短暫改變天氣
        this.setWeather('clear', 1);
    }
    
    // ==================== 公共方法 ====================
    
    update(deltaTime) {
        this.updateWeather();
        this.updateParticles();
    }
    
    getCurrentWeather() {
        return this.currentWeather;
    }
    
    getWeatherIntensity() {
        return this.weatherIntensity;
    }
    
    getWeatherName() {
        return this.weatherParams[this.currentWeather].name;
    }
    
    setAutoWeatherChange(enabled) {
        this.autoWeatherChange = enabled;
    }
    
    getStats() {
        return {
            currentWeather: this.currentWeather,
            intensity: this.weatherIntensity,
            particleCount: this.particles.length,
            lightningActive: this.lightning.active,
            autoChange: this.autoWeatherChange
        };
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherSystem;
}