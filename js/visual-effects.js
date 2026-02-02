/**
 * 視覺效果與粒子系統
 * 3A級遊戲的視覺表現系統
 */
class VisualEffectsSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 粒子系統
        this.particles = [];
        this.effects = [];
        this.postProcessing = {
            bloom: false,
            vignette: true,
            blur: 0,
            colorShift: 0
        };
        
        // 屏幕效果
        this.screenShake = {
            intensity: 0,
            duration: 0,
            x: 0,
            y: 0,
            decay: 0.9
        };
        
        // 光暈效果
        this.glows = [];
        
        // 景深效果
        this.depthOfField = {
            focus: { x: 0, y: 0 },
            strength: 0,
            radius: 100
        };
        
        // 色彩濾鏡
        this.colorFilters = {
            sepia: 0,
            grayscale: 0,
            invert: 0,
            brightness: 0,
            contrast: 0,
            hue: 0
        };
        
        // 材質系統
        this.materials = {};
        
        this.init();
    }
    
    init() {
        this.setupMaterials();
    }
    
    setupMaterials() {
        this.materials = {
            fire: {
                color: { r: 255, g: 100, b: 0 },
                opacity: 0.8,
                animation: 'flicker',
                sound: 'fire'
            },
            ice: {
                color: { r: 150, g: 200, b: 255 },
                opacity: 0.9,
                animation: 'crystal',
                sound: 'ice'
            },
            lightning: {
                color: { r: 255, g: 255, b: 100 },
                opacity: 1.0,
                animation: 'electric',
                sound: 'electric'
            },
            magic: {
                color: { r: 200, g: 100, b: 255 },
                opacity: 0.7,
                animation: 'sparkle',
                sound: 'magic'
            },
            water: {
                color: { r: 50, g: 150, b: 255 },
                opacity: 0.6,
                animation: 'ripple',
                sound: 'water'
            },
            stone: {
                color: { r: 139, g: 69, b: 19 },
                opacity: 1.0,
                animation: 'crumble',
                sound: 'stone'
            }
        };
    }
    
    // ==================== 粒子系統 ====================
    
    createParticle(x, y, type, options = {}) {
        const particle = {
            x: x,
            y: y,
            vx: options.vx || 0,
            vy: options.vy || 0,
            ax: options.ax || 0,
            ay: options.ay || 0,
            life: options.life || 1000,
            maxLife: options.life || 1000,
            size: options.size || 5,
            color: options.color || '#FFFFFF',
            opacity: options.opacity || 1,
            material: options.material || null,
            type: type,
            properties: options.properties || {},
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || 0,
            scale: options.scale || 1,
            scaleSpeed: options.scaleSpeed || 0,
            glow: options.glow || false,
            trail: options.trail || false,
            linkedTo: options.linkedTo || null,
            customDraw: options.customDraw || null
        };
        
        this.particles.push(particle);
        return particle;
    }
    
    createExplosion(x, y, options = {}) {
        const {
            count = 20,
            radius = 50,
            speed = 5,
            colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
            material = 'fire',
            size = [3, 8]
        } = options;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = radius + Math.random() * 30;
            const speedVar = speed + Math.random() * 2;
            
            this.createParticle(
                x + Math.cos(angle) * distance * 0.1,
                y + Math.sin(angle) * distance * 0.1,
                'explosion',
                {
                    vx: Math.cos(angle) * speedVar,
                    vy: Math.sin(angle) * speedVar,
                    life: 800 + Math.random() * 400,
                    size: size[0] + Math.random() * (size[1] - size[0]),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    material: material,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                }
            );
        }
        
        // 添加核心火焰
        this.createParticle(x, y, 'core', {
            size: 20,
            color: '#FFD700',
            life: 300,
            material: 'fire',
            scale: 1,
            scaleSpeed: -0.01
        });
    }
    
    createSparkles(x, y, count = 15, color = '#FFFFFF') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.createParticle(x, y, 'sparkle', {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 1500 + Math.random() * 500,
                size: 2 + Math.random() * 3,
                color: color,
                glow: true,
                customDraw: (ctx, particle) => this.drawSparkle(ctx, particle)
            });
        }
    }
    
    createTrail(x, y, color = '#4ECDC4') {
        this.createParticle(x, y, 'trail', {
            life: 500,
            size: 8,
            color: color,
            opacity: 0.6,
            scale: 1,
            scaleSpeed: -0.01,
            customDraw: (ctx, particle) => this.drawTrail(ctx, particle)
        });
    }
    
    createSmoke(x, y, intensity = 1) {
        const count = Math.floor(intensity * 5);
        
        for (let i = 0; i < count; i++) {
            this.createParticle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                'smoke',
                {
                    vx: (Math.random() - 0.5) * 2,
                    vy: -1 - Math.random() * 2,
                    life: 2000 + Math.random() * 1000,
                    size: 5 + Math.random() * 10,
                    color: '#808080',
                    opacity: 0.4,
                    scale: 1,
                    scaleSpeed: 0.005,
                    customDraw: (ctx, particle) => this.drawSmoke(ctx, particle)
                }
            );
        }
    }
    
    createWaterSplash(x, y, direction = 'up') {
        const count = 8;
        
        for (let i = 0; i < count; i++) {
            const angle = direction === 'up' ? 
                (-Math.PI / 2 + (Math.random() - 0.5)) : 
                (Math.random() * Math.PI);
            const speed = 3 + Math.random() * 2;
            
            this.createParticle(
                x + (Math.random() - 0.5) * 10,
                y,
                'water',
                {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 800,
                    size: 3 + Math.random() * 3,
                    color: '#4ECDC4',
                    material: 'water',
                    customDraw: (ctx, particle) => this.drawWaterDrop(ctx, particle)
                }
            );
        }
    }
    
    // ==================== 屏幕效果 ====================
    
    triggerScreenShake(intensity = 10, duration = 500) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
        this.screenShake.duration = Math.max(this.screenShake.duration, duration);
        
        this.screenShake.x = (Math.random() - 0.5) * intensity;
        this.screenShake.y = (Math.random() - 0.5) * intensity;
    }
    
    triggerFlash(intensity = 1, duration = 100) {
        const flash = {
            type: 'flash',
            intensity: intensity,
            duration: duration,
            startTime: Date.now()
        };
        
        this.effects.push(flash);
    }
    
    triggerColorShift(duration = 2000) {
        const colorShift = {
            type: 'colorShift',
            duration: duration,
            startTime: Date.now(),
            phases: [
                { sepia: 0.3, brightness: 0.2 },
                { hue: 180, saturation: 0.5 },
                { invert: 0.5, contrast: 0.3 },
                { sepia: 0, brightness: 0, hue: 0, invert: 0, contrast: 0 }
            ],
            currentPhase: 0
        };
        
        this.effects.push(colorShift);
    }
    
    // ==================== 光暈效果 ====================
    
    createGlow(x, y, radius, color, intensity = 1) {
        const glow = {
            x: x,
            y: y,
            radius: radius,
            color: color,
            intensity: intensity,
            life: 1000,
            maxLife: 1000,
            pulse: Math.random() * Math.PI * 2
        };
        
        this.glows.push(glow);
        return glow;
    }
    
    updateGlow(glow, deltaTime) {
        glow.life -= deltaTime;
        glow.pulse += deltaTime * 0.01;
        glow.radius += Math.sin(glow.pulse) * 0.5;
    }
    
    // ==================== 渲染系統 ====================
    
    update(deltaTime) {
        // 更新粒子
        this.updateParticles(deltaTime);
        
        // 更新效果
        this.updateEffects(deltaTime);
        
        // 更新屏幕震動
        this.updateScreenShake(deltaTime);
        
        // 更新光暈
        this.updateGlows(deltaTime);
        
        // 更新後處理效果
        this.updatePostProcessing(deltaTime);
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            // 更新粒子生命
            particle.life -= deltaTime;
            if (particle.life <= 0) return false;
            
            // 更新物理
            particle.vx += particle.ax * deltaTime * 0.001;
            particle.vy += particle.ay * deltaTime * 0.001;
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            
            // 更新動畫
            particle.rotation += particle.rotationSpeed * deltaTime * 0.001;
            particle.scale += particle.scaleSpeed * deltaTime * 0.001;
            particle.scale = Math.max(0.1, particle.scale);
            
            // 應用材質效果
            if (particle.material) {
                this.applyMaterialEffect(particle, deltaTime);
            }
            
            return true;
        });
    }
    
    updateEffects(deltaTime) {
        this.effects = this.effects.filter(effect => {
            const elapsed = Date.now() - effect.startTime;
            
            switch(effect.type) {
                case 'flash':
                    const flashProgress = elapsed / effect.duration;
                    effect.intensity = (1 - flashProgress) * 1;
                    return flashProgress < 1;
                    
                case 'colorShift':
                    return this.updateColorShiftEffect(effect, deltaTime);
            }
            
            return elapsed < effect.duration;
        });
    }
    
    updateColorShiftEffect(effect, deltaTime) {
        const elapsed = Date.now() - effect.startTime;
        const phaseProgress = elapsed / (effect.duration / effect.phases.length);
        const currentPhaseIndex = Math.floor(phaseProgress);
        const phaseTransition = phaseProgress - currentPhaseIndex;
        
        if (currentPhaseIndex >= effect.phases.length) {
            // 重置顏色
            Object.keys(this.colorFilters).forEach(key => {
                this.colorFilters[key] = 0;
            });
            return false;
        }
        
        const currentPhase = effect.phases[currentPhaseIndex];
        const nextPhase = effect.phases[Math.min(currentPhaseIndex + 1, effect.phases.length - 1)];
        
        // 過渡到當前階段
        Object.keys(currentPhase).forEach(key => {
            this.colorFilters[key] = currentPhase[key] * phaseTransition;
        });
        
        return true;
    }
    
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            this.screenShake.intensity *= this.screenShake.decay;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
            
            if (this.screenShake.duration <= 0) {
                this.screenShake.intensity = 0;
                this.screenShake.x = 0;
                this.screenShake.y = 0;
            }
        }
    }
    
    updateGlows(deltaTime) {
        this.glows = this.glows.filter(glow => {
            this.updateGlow(glow, deltaTime);
            return glow.life > 0;
        });
    }
    
    updatePostProcessing(deltaTime) {
        // 更新後處理效果參數
        if (this.postProcessing.blur > 0) {
            this.postProcessing.blur = Math.max(0, this.postProcessing.blur - deltaTime * 0.001);
        }
    }
    
    applyMaterialEffect(particle, deltaTime) {
        const material = this.materials[particle.material];
        if (!material) return;
        
        switch(material.animation) {
            case 'flicker':
                particle.opacity = material.opacity * (0.7 + Math.random() * 0.3);
                break;
            case 'sparkle':
                particle.opacity = material.opacity * (0.5 + Math.random() * 0.5);
                particle.size += Math.sin(Date.now() * 0.01) * 0.1;
                break;
            case 'ripple':
                particle.opacity = material.opacity * (0.8 + Math.sin(Date.now() * 0.005) * 0.2);
                break;
        }
    }
    
    // ==================== 繪製系統 ====================
    
    render() {
        this.ctx.save();
        
        // 應用屏幕震動
        if (this.screenShake.intensity > 0) {
            this.ctx.translate(this.screenShake.x, this.screenShake.y);
        }
        
        // 繪製光暈
        this.renderGlows();
        
        // 繪製粒子
        this.renderParticles();
        
        // 繪製後處理效果
        this.renderPostProcessing();
        
        this.ctx.restore();
    }
    
    renderGlows() {
        this.glows.forEach(glow => {
            const alpha = glow.life / glow.maxLife;
            const gradient = this.ctx.createRadialGradient(
                glow.x, glow.y, 0,
                glow.x, glow.y, glow.radius
            );
            
            gradient.addColorStop(0, `${glow.color}${Math.floor(glow.intensity * 255).toString(16)}`);
            gradient.addColorStop(0.5, `${glow.color}${Math.floor(glow.intensity * 0.3 * 255).toString(16)}`);
            gradient.addColorStop(1, `${glow.color}00`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                glow.x - glow.radius,
                glow.y - glow.radius,
                glow.radius * 2,
                glow.radius * 2
            );
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            // 應用透明度
            this.ctx.globalAlpha = particle.opacity * (particle.life / particle.maxLife);
            
            // 應用變換
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            this.ctx.scale(particle.scale, particle.scale);
            
            // 自定義繪製或默認繪製
            if (particle.customDraw) {
                particle.customDraw(this.ctx, particle);
            } else {
                this.drawDefaultParticle(particle);
            }
            
            this.ctx.restore();
        });
    }
    
    renderPostProcessing() {
        this.effects.forEach(effect => {
            switch(effect.type) {
                case 'flash':
                    this.ctx.globalAlpha = effect.intensity;
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    break;
            }
        });
    }
    
    // ==================== 繪製方法 ====================
    
    drawDefaultParticle(particle) {
        this.ctx.fillStyle = particle.color;
        
        if (particle.glow) {
            // 繪製發光效果
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawSparkle(ctx, particle) {
        const size = particle.size;
        
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
        
        // 內層星星
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, 0);
        ctx.lineTo(size * 0.5, 0);
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(0, size * 0.5);
        ctx.stroke();
    }
    
    drawTrail(ctx, particle) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSmoke(ctx, particle) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, 'rgba(128, 128, 128, 0.3)');
        gradient.addColorStop(0.5, 'rgba(128, 128, 128, 0.1)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawWaterDrop(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-particle.size * 0.3, -particle.size * 0.2, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // ==================== 特殊效果 ====================
    
    createLevelCompleteEffect(x, y) {
        // 創建關卡完成特效
        this.createSparkles(x, y, 50, '#FFD700');
        this.createGlow(x, y, 200, '#FFD700', 0.5);
        this.triggerFlash(0.8, 200);
        this.triggerColorShift(3000);
        
        // 添加粒子爆炸
        this.createExplosion(x, y, {
            count: 30,
            radius: 100,
            speed: 8,
            colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32'],
            material: 'magic',
            size: [5, 15]
        });
    }
    
    createPowerUpEffect(x, y, type) {
        const colors = {
            mushroom: '#FF6B6B',
            star: '#FFD700',
            fire: '#FF4500',
            ice: '#87CEEB'
        };
        
        const color = colors[type] || '#FFFFFF';
        
        this.createSparkles(x, y, 20, color);
        this.createGlow(x, y, 100, color, 0.7);
        this.createTrail(x, y, color);
    }
    
    createDamageEffect(x, y) {
        this.createExplosion(x, y, {
            count: 15,
            radius: 50,
            speed: 3,
            colors: ['#FF0000', '#FF4500', '#8B0000'],
            material: 'fire',
            size: [3, 6]
        });
        
        this.createSmoke(x, y, 2);
        this.triggerScreenShake(8, 300);
    }
    
    // ==================== 清理和重置 ====================
    
    clearAll() {
        this.particles = [];
        this.effects = [];
        this.glows = [];
        
        // 重置後處理
        Object.keys(this.colorFilters).forEach(key => {
            this.colorFilters[key] = 0;
        });
    }
    
    getParticleCount() {
        return this.particles.length;
    }
    
    getActiveEffects() {
        return {
            particles: this.particles.length,
            effects: this.effects.length,
            glows: this.glows.length,
            screenShake: this.screenShake.intensity > 0
        };
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffectsSystem;
}