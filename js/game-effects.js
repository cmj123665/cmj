/**
 * Game Effects Library - 可爱浪漫高级画风
 * 所有小游戏共享的Canvas 2D高级绘制函数
 */

// ============ 粒子系统 ============
class ParticleSystem {
    constructor(maxParticles = 200) {
        this.particles = [];
        this.maxParticles = maxParticles;
    }

    emit(x, y, count, options = {}) {
        const {
            color = '#ffffff',
            colors = null,
            speed = 2,
            size = 3,
            sizeVariation = 2,
            life = 30,
            lifeVariation = 10,
            angle = null,
            angleSpread = Math.PI * 2,
            gravity = 0,
            fade = true
        } = options;

        for (let i = 0; i < count; i++) {
            const a = angle !== null
                ? angle + (Math.random() - 0.5) * angleSpread
                : Math.random() * Math.PI * 2;
            const s = speed * (0.5 + Math.random() * 0.5);

            this.particles.push({
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                size: size + (Math.random() - 0.5) * sizeVariation * 2,
                life: life + (Math.random() - 0.5) * lifeVariation * 2,
                maxLife: life,
                color: colors ? colors[Math.floor(Math.random() * colors.length)] : color,
                gravity,
                fade
            });
        }

        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        const prevAlpha = ctx.globalAlpha;
        for (const p of this.particles) {
            const alpha = p.fade ? Math.max(0, p.life / p.maxLife) : 1;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.size * alpha), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = prevAlpha;
    }

    clear() {
        this.particles = [];
    }
}

// ============ 绘制工具函数 ============

function drawGlowRect(ctx, x, y, w, h, color, glowRadius = 15) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowRadius;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function drawGradientCircle(ctx, x, y, r, color1, color2, glow = true) {
    ctx.save();
    if (glow) {
        ctx.shadowColor = color1;
        ctx.shadowBlur = r * 0.8;
    }
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawRoundedRect3D(ctx, x, y, w, h, r, color, highlight = true) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    roundRect(ctx, x + 2, y + 3, w, h, r);
    ctx.fill();

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, lighten(color, 25));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darken(color, 15));
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    if (highlight) {
        const highlightGrad = ctx.createLinearGradient(x, y, x, y + h * 0.5);
        highlightGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlightGrad;
        roundRect(ctx, x + 1, y + 1, w - 2, h * 0.5, Math.max(0, r - 1));
        ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
    ctx.stroke();
    ctx.restore();
}

function drawGlassPanel(ctx, x, y, w, h, radius = 12, opacity = 0.1) {
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius);
    ctx.stroke();
    ctx.restore();
}

function drawStarField(ctx, width, height, stars, speed = 0.5) {
    ctx.save();
    for (const star of stars) {
        star.y += speed * star.speed;
        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function createStars(count, width, height) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.2,
            alpha: Math.random() * 0.6 + 0.2,
            color: Math.random() > 0.7 ? '#a8b2d1' : '#e2e8f0'
        });
    }
    return stars;
}

function drawGrid(ctx, width, height, spacing = 40, color = 'rgba(255,255,255,0.05)') {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    ctx.restore();
}

let shakeIntensity = 0;
let shakeDuration = 0;

function triggerShake(intensity = 5, duration = 10) {
    shakeIntensity = intensity;
    shakeDuration = duration;
}

function applyShake(ctx) {
    if (shakeDuration > 0) {
        const dx = (Math.random() - 0.5) * shakeIntensity * 2;
        const dy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(dx, dy);
        shakeDuration--;
        shakeIntensity *= 0.9;
    }
}

// ============ 真正的飞机绘制 ============
function drawPlane(ctx, x, y, w, h, color, enginePower = 1) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;

    // 机身 - 圆润的椭圆
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.2, h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 机身高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.05, cy - h * 0.1, w * 0.1, h * 0.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 左翼
    ctx.fillStyle = darken(color, 10);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.1, cy - h * 0.1);
    ctx.lineTo(cx - w * 0.55, cy + h * 0.05);
    ctx.lineTo(cx - w * 0.55, cy + h * 0.15);
    ctx.lineTo(cx - w * 0.1, cy + h * 0.05);
    ctx.closePath();
    ctx.fill();

    // 左翼条纹装饰
    ctx.fillStyle = lighten(color, 20);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.15, cy - h * 0.05);
    ctx.lineTo(cx - w * 0.45, cy + h * 0.05);
    ctx.lineTo(cx - w * 0.45, cy + h * 0.1);
    ctx.lineTo(cx - w * 0.15, cy + h * 0.02);
    ctx.closePath();
    ctx.fill();

    // 右翼
    ctx.fillStyle = darken(color, 10);
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.1, cy - h * 0.1);
    ctx.lineTo(cx + w * 0.55, cy + h * 0.05);
    ctx.lineTo(cx + w * 0.55, cy + h * 0.15);
    ctx.lineTo(cx + w * 0.1, cy + h * 0.05);
    ctx.closePath();
    ctx.fill();

    // 右翼条纹装饰
    ctx.fillStyle = lighten(color, 20);
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.15, cy - h * 0.05);
    ctx.lineTo(cx + w * 0.45, cy + h * 0.05);
    ctx.lineTo(cx + w * 0.45, cy + h * 0.1);
    ctx.lineTo(cx + w * 0.15, cy + h * 0.02);
    ctx.closePath();
    ctx.fill();

    // 尾翼 - 水平
    ctx.fillStyle = darken(color, 15);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.15, cy + h * 0.25);
    ctx.lineTo(cx + w * 0.15, cy + h * 0.25);
    ctx.lineTo(cx + w * 0.1, cy + h * 0.38);
    ctx.lineTo(cx - w * 0.1, cy + h * 0.38);
    ctx.closePath();
    ctx.fill();

    // 尾翼 - 垂直
    ctx.fillStyle = darken(color, 20);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.03, cy + h * 0.25);
    ctx.lineTo(cx + w * 0.03, cy + h * 0.25);
    ctx.lineTo(cx + w * 0.02, cy + h * 0.42);
    ctx.lineTo(cx - w * 0.02, cy + h * 0.42);
    ctx.closePath();
    ctx.fill();

    // 驾驶舱
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.ellipse(cx, cy - h * 0.15, w * 0.08, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.02, cy - h * 0.18, w * 0.03, h * 0.04, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 机头螺旋桨
    ctx.fillStyle = '#fbbf24';
    const propAngle = Date.now() * 0.02;
    for (let i = 0; i < 3; i++) {
        const angle = propAngle + (i * Math.PI * 2 / 3);
        ctx.save();
        ctx.translate(cx, cy - h * 0.42);
        ctx.rotate(angle);
        ctx.fillRect(-w * 0.02, -h * 0.12, w * 0.04, h * 0.24);
        ctx.restore();
    }
    // 螺旋桨中心
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy - h * 0.42, w * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // 引擎火焰
    const flameLen = h * 0.25 * enginePower * (0.8 + Math.random() * 0.4);
    const flameGrad = ctx.createLinearGradient(cx, cy + h * 0.4, cx, cy + h * 0.4 + flameLen);
    flameGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    flameGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.5)');
    flameGrad.addColorStop(1, 'rgba(167, 139, 250, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.08, cy + h * 0.4);
    ctx.quadraticCurveTo(cx, cy + h * 0.4 + flameLen * 1.2, cx + w * 0.08, cy + h * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// ============ 真正的敌机绘制 ============
function drawEnemyPlane(ctx, x, y, w, h, color, rotation = 0) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rotation + Math.PI); // 敌人朝下

    // 敌机机身
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.25, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 敌机翅膀 - 后掠翼
    ctx.fillStyle = darken(color, 15);
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, -h * 0.1);
    ctx.lineTo(-w * 0.6, h * 0.1);
    ctx.lineTo(-w * 0.55, h * 0.2);
    ctx.lineTo(-w * 0.1, h * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.15, -h * 0.1);
    ctx.lineTo(w * 0.6, h * 0.1);
    ctx.lineTo(w * 0.55, h * 0.2);
    ctx.lineTo(w * 0.1, h * 0.05);
    ctx.closePath();
    ctx.fill();

    // 驾驶舱 - 红色邪恶感
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.1, w * 0.1, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(-w * 0.02, h * 0.07, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // 引擎发光
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-w * 0.12, -h * 0.35, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.12, -h * 0.35, w * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ============ 激光子弹 ============
function drawLaser(ctx, x, y, w, h, color, tail = 8) {
    ctx.save();
    const grad = ctx.createLinearGradient(x, y + h, x, y - tail);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(x, y - tail, w, h + tail);
    ctx.restore();
}

// ============ 真正的蛇绘制 ============
function drawSnake(ctx, segments, gridSize, color, direction) {
    if (segments.length === 0) return;
    ctx.save();

    const head = segments[0];
    const hx = head.x * gridSize + gridSize / 2;
    const hy = head.y * gridSize + gridSize / 2;
    const radius = gridSize * 0.38;

    // 身体（从尾部开始画，头部盖在上面）
    for (let i = segments.length - 1; i >= 1; i--) {
        const s = segments[i];
        const sx = s.x * gridSize + gridSize / 2;
        const sy = s.y * gridSize + gridSize / 2;
        const bodyColor = i % 2 === 0 ? color : darken(color, 8);

        // 身体圆
        const grad = ctx.createRadialGradient(sx - radius * 0.2, sy - radius * 0.2, 0, sx, sy, radius);
        grad.addColorStop(0, lighten(bodyColor, 15));
        grad.addColorStop(1, bodyColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // 鳞片纹理
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 0.6, 0.5, 2.5);
        ctx.stroke();
    }

    // 连接身体的线条（让蛇更连贯）
    ctx.strokeStyle = color;
    ctx.lineWidth = gridSize * 0.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = segments.length - 1; i >= 0; i--) {
        const s = segments[i];
        const sx = s.x * gridSize + gridSize / 2;
        const sy = s.y * gridSize + gridSize / 2;
        if (i === segments.length - 1) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 重新画身体圆（覆盖线条连接处）
    for (let i = segments.length - 1; i >= 1; i--) {
        const s = segments[i];
        const sx = s.x * gridSize + gridSize / 2;
        const sy = s.y * gridSize + gridSize / 2;
        const bodyColor = i % 2 === 0 ? color : darken(color, 8);
        const grad = ctx.createRadialGradient(sx - radius * 0.2, sy - radius * 0.2, 0, sx, sy, radius);
        grad.addColorStop(0, lighten(bodyColor, 15));
        grad.addColorStop(1, bodyColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 头部
    const headGrad = ctx.createRadialGradient(hx - radius * 0.2, hy - radius * 0.2, 0, hx, hy, radius * 1.1);
    headGrad.addColorStop(0, lighten(color, 25));
    headGrad.addColorStop(1, color);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(hx, hy, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    // 头部高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(hx - radius * 0.15, hy - radius * 0.2, radius * 0.3, radius * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛方向
    const dir = direction || {dx: 0, dy: -1};
    const eyeOffset = radius * 0.35;
    const eyeX1 = hx + dir.dx * eyeOffset - dir.dy * eyeOffset * 0.5;
    const eyeY1 = hy + dir.dy * eyeOffset + dir.dx * eyeOffset * 0.5;
    const eyeX2 = hx + dir.dx * eyeOffset + dir.dy * eyeOffset * 0.5;
    const eyeY2 = hy + dir.dy * eyeOffset - dir.dx * eyeOffset * 0.5;

    // 眼白
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, radius * 0.22, 0, Math.PI * 2);
    ctx.arc(eyeX2, eyeY2, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 眼珠
    ctx.fillStyle = '#1e293b';
    const pupilOffset = radius * 0.06;
    ctx.beginPath();
    ctx.arc(eyeX1 + dir.dx * pupilOffset, eyeY1 + dir.dy * pupilOffset, radius * 0.1, 0, Math.PI * 2);
    ctx.arc(eyeX2 + dir.dx * pupilOffset, eyeY2 + dir.dy * pupilOffset, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛高光
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(eyeX1 - radius * 0.05, eyeY1 - radius * 0.08, radius * 0.05, 0, Math.PI * 2);
    ctx.arc(eyeX2 - radius * 0.05, eyeY2 - radius * 0.08, radius * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 舌头
    if (Math.random() > 0.7) {
        const tx = hx + dir.dx * radius * 1.3;
        const ty = hy + dir.dy * radius * 1.3;
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx + dir.dx * radius * 0.8, hy + dir.dy * radius * 0.8);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // 舌头分叉
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + dir.dy * 4 - dir.dx * 3, ty - dir.dx * 4 - dir.dy * 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - dir.dy * 4 - dir.dx * 3, ty + dir.dx * 4 - dir.dy * 3);
        ctx.stroke();
    }

    ctx.restore();
}

// ============ 真正的食物绘制 ============
function drawApple(ctx, x, y, size, pulse = 0) {
    ctx.save();
    const scale = 1 + Math.sin(pulse) * 0.08;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 苹果主体
    const grad = ctx.createRadialGradient(-size * 0.15, -size * 0.15, 0, 0, 0, size);
    grad.addColorStop(0, '#fca5a5');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#dc2626');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, size * 0.1, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 苹果顶凹
    ctx.fillStyle = darken('#dc2626', 10);
    ctx.beginPath();
    ctx.arc(0, -size * 0.3, size * 0.2, 0, Math.PI, false);
    ctx.fill();

    // 叶子
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(size * 0.15, -size * 0.5, size * 0.2, size * 0.1, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.2, -size * 0.1, size * 0.15, size * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawCandy(ctx, x, y, size, color1, color2, pulse = 0) {
    ctx.save();
    const scale = 1 + Math.sin(pulse) * 0.1;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.shadowColor = color1;
    ctx.shadowBlur = 15;

    // 糖果主体
    const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, 0, 0, 0, size);
    grad.addColorStop(0, lighten(color1, 30));
    grad.addColorStop(0.5, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 糖果条纹
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, i * 0.8, i * 0.8 + 0.4);
        ctx.stroke();
    }

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.15, -size * 0.15, size * 0.2, size * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ============ 糖果/宝石方块 ============
function drawCandyBlock(ctx, x, y, w, h, r, color) {
    ctx.save();

    // 底部阴影
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    roundRect(ctx, x + 2, y + 3, w, h, r);
    ctx.fill();

    // 主体
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, lighten(color, 20));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darken(color, 10));
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    // 内部光晕
    const innerGrad = ctx.createRadialGradient(x + w * 0.3, y + h * 0.3, 0, x + w * 0.5, y + h * 0.5, w * 0.6);
    innerGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    innerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = innerGrad;
    roundRect(ctx, x + 2, y + 2, w - 4, h - 4, Math.max(0, r - 2));
    ctx.fill();

    // 顶部高光
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, x + 3, y + 2, w - 6, h * 0.35, Math.max(0, r - 2));
    ctx.fill();

    // 边框
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
    ctx.stroke();

    // 小星星装饰
    if (w > 15) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        const sx = x + w * 0.75;
        const sy = y + h * 0.25;
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// ============ 云朵绘制 ============
function drawCloud(ctx, x, y, w, h, color = 'rgba(255,255,255,0.15)') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, h * 0.5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.25, y - h * 0.2, h * 0.4, 0, Math.PI * 2);
    ctx.arc(x + w * 0.5, y, h * 0.55, 0, Math.PI * 2);
    ctx.arc(x + w * 0.75, y - h * 0.15, h * 0.35, 0, Math.PI * 2);
    ctx.arc(x + w, y, h * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ============ 得分飘字 ============
class FloatText {
    constructor() {
        this.texts = [];
    }

    add(x, y, text, color = '#fbbf24') {
        this.texts.push({x, y, text, color, life: 40, maxLife: 40, vy: -1});
    }

    update() {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.y += t.vy;
            t.life--;
            if (t.life <= 0) this.texts.splice(i, 1);
        }
    }

    draw(ctx) {
        for (const t of this.texts) {
            const alpha = t.life / t.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = t.color;
            ctx.font = 'bold 16px sans-serif';
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 8;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        }
    }
}

// ============ 颜色工具 ============
function lighten(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darken(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ============ WebGL粒子背景（可爱浪漫风） ============
class WebGLParticles {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl', { alpha: true, antialias: false });
        if (!this.gl) return;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.time = 0;
        this.running = true;

        this.init();
        this.resize();
        this.bindEvents();
        this.animate();
    }

    init() {
        const gl = this.gl;

        const vs = `
            attribute vec2 a_position;
            attribute float a_size;
            attribute vec3 a_color;
            attribute float a_speed;
            attribute float a_offset;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            varying vec3 v_color;
            varying float v_alpha;

            void main() {
                v_color = a_color;
                float t = u_time * a_speed + a_offset;
                vec2 pos = a_position;
                pos.x += sin(t * 0.5) * 0.02;
                pos.y += cos(t * 0.3) * 0.015;
                pos += u_mouse * a_speed * 0.03;
                vec2 screenPos = pos * 2.0 - 1.0;
                screenPos.x *= u_resolution.y / u_resolution.x;
                gl_Position = vec4(screenPos, 0.0, 1.0);
                float pulse = 1.0 + sin(t * 2.0) * 0.3;
                gl_PointSize = a_size * pulse * (u_resolution.y / 800.0);
                v_alpha = 0.3 + 0.4 * sin(t) * sin(t);
            }
        `;

        const fs = `
            precision mediump float;
            varying vec3 v_color;
            varying float v_alpha;

            void main() {
                float dist = length(gl_PointCoord - 0.5) * 2.0;
                if (dist > 1.0) discard;
                float alpha = smoothstep(1.0, 0.2, dist) * v_alpha;
                gl_FragColor = vec4(v_color, alpha);
            }
        `;

        this.program = this.createProgram(vs, fs);
        gl.useProgram(this.program);

        this.particleCount = 800;
        const positions = [];
        const sizes = [];
        const colors = [];
        const speeds = [];
        const offsets = [];

        // 可爱浪漫的粉紫蓝调色板
        const palette = [
            [0.96, 0.66, 0.78],  // 粉红
            [0.77, 0.60, 0.96],  // 淡紫
            [0.69, 0.91, 0.96],  // 浅蓝
            [1.0, 0.85, 0.70],   // 暖黄
            [0.98, 0.75, 0.85]   // 桃粉
        ];

        for (let i = 0; i < this.particleCount; i++) {
            positions.push(Math.random(), Math.random());
            sizes.push(Math.random() * 6 + 2);
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors.push(...c);
            speeds.push(Math.random() * 0.3 + 0.1);
            offsets.push(Math.random() * Math.PI * 2);
        }

        this.createBuffer('a_position', positions, 2);
        this.createBuffer('a_size', sizes, 1);
        this.createBuffer('a_color', colors, 3);
        this.createBuffer('a_speed', speeds, 1);
        this.createBuffer('a_offset', offsets, 1);

        this.uTime = gl.getUniformLocation(this.program, 'u_time');
        this.uResolution = gl.getUniformLocation(this.program, 'u_resolution');
        this.uMouse = gl.getUniformLocation(this.program, 'u_mouse');

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    }

    createBuffer(name, data, size) {
        const gl = this.gl;
        const loc = gl.getAttribLocation(this.program, name);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        document.addEventListener('visibilitychange', () => {
            this.running = !document.hidden;
        });
    }

    animate() {
        if (!this.running) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.time += 0.016;
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(this.uTime, this.time);
        gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.uMouse, this.mouseX, this.mouseY);
        gl.drawArrays(gl.POINTS, 0, this.particleCount);

        requestAnimationFrame(() => this.animate());
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.ParticleSystem = ParticleSystem;
    window.WebGLParticles = WebGLParticles;
    window.FloatText = FloatText;
    window.drawGlowRect = drawGlowRect;
    window.drawGradientCircle = drawGradientCircle;
    window.drawRoundedRect3D = drawRoundedRect3D;
    window.drawGlassPanel = drawGlassPanel;
    window.drawStarField = drawStarField;
    window.createStars = createStars;
    window.drawGrid = drawGrid;
    window.triggerShake = triggerShake;
    window.applyShake = applyShake;
    window.drawPlane = drawPlane;
    window.drawEnemyPlane = drawEnemyPlane;
    window.drawLaser = drawLaser;
    window.drawSnake = drawSnake;
    window.drawApple = drawApple;
    window.drawCandy = drawCandy;
    window.drawCandyBlock = drawCandyBlock;
    window.drawCloud = drawCloud;
    window.lighten = lighten;
    window.darken = darken;
    window.roundRect = roundRect;
}
