// ==================== 游戏配置 ====================
const CONFIG = {
    SLOT_SIZE: 8,          // 卡槽大小
    TILE_SIZE: 46,         // 方块大小
    BOARD_SIZE: 380,       // 游戏区域大小
    MAX_LAYERS: 28,        // 最大层数
    MAX_PATTERNS: 15,      // 最大图案种类
};

// ==================== 图案配置 ====================
const PATTERNS = [
    '🐏', '🐺', '🐻', '🐼', '🦊', '🐰',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
    '🐵', '🐔', '🦄'
];

// ==================== 关卡配置 ====================
const LEVELS = [
    // 第一关 - 教学关（超简单）
    {
        level: 1,
        name: "新手教程",
        patterns: 3,
        layers: 2,
        layout: "pyramid-small",
        tools: { remove: 3, undo: 3, shuffle: 3, clear: 1 },
        difficulty: "⭐"
    },
    // 第二关 - 难度突增
    {
        level: 2,
        name: "初试锋芒",
        patterns: 8,
        layers: 5,
        layout: "spindle",
        tools: { remove: 2, undo: 2, shuffle: 2, clear: 1 },
        difficulty: "⭐⭐"
    },
    // 第三关 - 纺锤形地狱
    {
        level: 3,
        name: "纺锤地狱",
        patterns: 12,
        layers: 12,
        layout: "spindle",
        tools: { remove: 2, undo: 2, shuffle: 2, clear: 1 },
        difficulty: "⭐⭐⭐"
    },
    // 第四关 - 高难度
    {
        level: 4,
        name: "绝境求生",
        patterns: 14,
        layers: 18,
        layout: "spindle-large",
        tools: { remove: 1, undo: 2, shuffle: 2, clear: 1 },
        difficulty: "⭐⭐⭐⭐"
    },
    // 第五关 - 终极挑战
    {
        level: 5,
        name: "终极挑战",
        patterns: 15,
        layers: 28,
        layout: "spindle-extreme",
        tools: { remove: 1, undo: 1, shuffle: 1, clear: 0 },
        difficulty: "⭐⭐⭐⭐⭐"
    },
    // 第六关 - 炼狱模式
    {
        level: 6,
        name: "炼狱降临",
        patterns: 15,
        layers: 25,
        layout: "chaos",
        tools: { remove: 1, undo: 1, shuffle: 1, clear: 1 },
        difficulty: "💀"
    },
    // 第七关 - 混沌领域
    {
        level: 7,
        name: "混沌领域",
        patterns: 15,
        layers: 28,
        layout: "chaos-extreme",
        tools: { remove: 1, undo: 1, shuffle: 1, clear: 0 },
        difficulty: "💀💀"
    },
    // 第八关 - 无尽深渊
    {
        level: 8,
        name: "无尽深渊",
        patterns: 15,
        layers: 30,
        layout: "abyss",
        tools: { remove: 0, undo: 1, shuffle: 1, clear: 0 },
        difficulty: "🔥"
    },
    // 第九关 - 地狱边缘
    {
        level: 9,
        name: "地狱边缘",
        patterns: 15,
        layers: 32,
        layout: "hell-gate",
        tools: { remove: 0, undo: 1, shuffle: 0, clear: 1 },
        difficulty: "🔥🔥"
    },
    // 第十关 - 传说之巅
    {
        level: 10,
        name: "传说之巅",
        patterns: 15,
        layers: 35,
        layout: "legend",
        tools: { remove: 0, undo: 0, shuffle: 0, clear: 0 },
        difficulty: "👑"
    }
];

// ==================== 方块类 ====================
class Tile {
    constructor(id, pattern, x, y, layer) {
        this.id = id;
        this.pattern = pattern;
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.element = null;
        this.disabled = false;
    }

    createElement() {
        const el = document.createElement('div');
        el.className = `tile pattern-${this.pattern}`;
        el.textContent = PATTERNS[this.pattern];
        el.dataset.id = this.id;
        el.style.left = `${this.x}px`;
        el.style.top = `${this.y}px`;
        el.style.zIndex = this.layer;
        this.element = el;
        return el;
    }

    updateDisabled(isDisabled) {
        this.disabled = isDisabled;
        if (isDisabled) {
            this.element.classList.add('disabled');
        } else {
            this.element.classList.remove('disabled');
        }
    }
}

// ==================== 关卡生成器 ====================
class LevelGenerator {
    static generate(levelConfig) {
        const { patterns, layers, layout } = levelConfig;

        // 计算总方块数（必须是3的倍数）
        const positions = this.generateLayout(layout, layers);
        const totalTiles = positions.length;

        // 调整为3的倍数
        const adjustedTotal = Math.ceil(totalTiles / 3) * 3;

        // 生成牌库：按每组3个生成
        const tileLibrary = [];
        const patternCount = Math.floor(adjustedTotal / 3);

        for (let i = 0; i < patternCount; i++) {
            const pattern = i % patterns;
            // 每组3个相同图案
            for (let j = 0; j < 3; j++) {
                tileLibrary.push(pattern);
            }
        }

        // 随机洗牌
        this.shuffle(tileLibrary);

        // 按位置填充
        const tiles = [];
        let tileId = 0;

        positions.forEach((pos, index) => {
            if (index < tileLibrary.length) {
                const tile = new Tile(
                    tileId++,
                    tileLibrary[index],
                    pos.x,
                    pos.y,
                    pos.layer
                );
                tiles.push(tile);
            }
        });

        return tiles;
    }

    static generateLayout(layoutType, maxLayers) {
        const positions = [];
        const centerX = CONFIG.BOARD_SIZE / 2 - CONFIG.TILE_SIZE / 2;
        const centerY = CONFIG.BOARD_SIZE / 2 - CONFIG.TILE_SIZE / 2;

        switch (layoutType) {
            case 'pyramid-small':
                // 小金字塔 - 教学关
                for (let layer = 0; layer < maxLayers; layer++) {
                    const count = layer + 2;
                    const startAngle = -Math.PI / 2;
                    const angleStep = (Math.PI * 2) / count;
                    const radius = 30 + layer * 25;

                    for (let i = 0; i < count; i++) {
                        const angle = startAngle + i * angleStep;
                        positions.push({
                            x: centerX + Math.cos(angle) * radius,
                            y: centerY + Math.sin(angle) * radius,
                            layer: layer
                        });
                    }
                }
                break;

            case 'spindle':
                // 纺锤形 - 小-大-小
                const midLayer = Math.floor(maxLayers / 2);
                for (let layer = 0; layer < maxLayers; layer++) {
                    // 纺锤形宽度计算
                    const distFromMid = Math.abs(layer - midLayer);
                    const maxDist = midLayer;
                    const widthFactor = 1 - (distFromMid / maxDist) * 0.6;

                    const count = Math.floor((4 + layer * 1.5) * widthFactor) + 3;
                    const radius = 25 + layer * 12;
                    const jitter = 8 - layer * 0.3;

                    for (let i = 0; i < count; i++) {
                        const angle = (i / count) * Math.PI * 2 + layer * 0.2;
                        const jX = (Math.random() - 0.5) * jitter;
                        const jY = (Math.random() - 0.5) * jitter;

                        positions.push({
                            x: centerX + Math.cos(angle) * radius + jX,
                            y: centerY + Math.sin(angle) * radius + jY,
                            layer: layer
                        });
                    }
                }
                break;

            case 'spindle-large':
                // 大纺锤形
                const midLayer2 = Math.floor(maxLayers / 2);
                for (let layer = 0; layer < maxLayers; layer++) {
                    const distFromMid = Math.abs(layer - midLayer2);
                    const maxDist = midLayer2;
                    const widthFactor = 1 - (distFromMid / maxDist) * 0.5;

                    const count = Math.floor((5 + layer * 1.8) * widthFactor) + 4;
                    const radius = 20 + layer * 10;
                    const jitter = 6;

                    for (let i = 0; i < count; i++) {
                        const angle = (i / count) * Math.PI * 2 + layer * 0.15;
                        const jX = (Math.random() - 0.5) * jitter;
                        const jY = (Math.random() - 0.5) * jitter;

                        positions.push({
                            x: centerX + Math.cos(angle) * radius + jX,
                            y: centerY + Math.sin(angle) * radius + jY,
                            layer: layer
                        });
                    }
                }
                break;

            case 'spindle-extreme':
                // 极限纺锤形 - 地狱模式
                const midLayer3 = Math.floor(maxLayers / 2);
                for (let layer = 0; layer < maxLayers; layer++) {
                    const distFromMid = Math.abs(layer - midLayer3);
                    const maxDist = midLayer3;
                    const widthFactor = 1 - (distFromMid / maxDist) * 0.4;

                    const count = Math.floor((6 + layer * 2) * widthFactor) + 5;
                    const radius = 15 + layer * 8;
                    const jitter = 5;

                    for (let i = 0; i < count; i++) {
                        const angle = (i / count) * Math.PI * 2 + layer * 0.1;
                        const jX = (Math.random() - 0.5) * jitter;
                        const jY = (Math.random() - 0.5) * jitter;

                        positions.push({
                            x: centerX + Math.cos(angle) * radius + jX,
                            y: centerY + Math.sin(angle) * radius + jY,
                            layer: layer
                        });
                    }
                }
                break;

            case 'chaos':
                // 混沌模式 - 随机分布
                for (let layer = 0; layer < maxLayers; layer++) {
                    const count = 6 + Math.floor(layer * 1.2);
                    const jitter = 15;

                    for (let i = 0; i < count; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = 30 + Math.random() * 100;
                        const jX = (Math.random() - 0.5) * jitter;
                        const jY = (Math.random() - 0.5) * jitter;

                        positions.push({
                            x: centerX + Math.cos(angle) * radius + jX,
                            y: centerY + Math.sin(angle) * radius + jY,
                            layer: layer
                        });
                    }
                }
                break;

            case 'chaos-extreme':
                // 极限混沌 - 高密度随机
                for (let layer = 0; layer < maxLayers; layer++) {
                    const count = 8 + Math.floor(layer * 1.5);
                    const jitter = 10;

                    for (let i = 0; i < count; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = 20 + Math.random() * 120;
                        const jX = (Math.random() - 0.5) * jitter;
                        const jY = (Math.random() - 0.5) * jitter;

                        positions.push({
                            x: centerX + Math.cos(angle) * radius + jX,
                            y: centerY + Math.sin(angle) * radius + jY,
                            layer: layer
                        });
                    }
                }
                break;

            case 'abyss':
                // 深渊模式 - 螺旋下降
                for (let layer = 0; layer < maxLayers; layer++) {
                    const count = 7 + layer;
                    const baseAngle = layer * 0.3;
                    const radius = 25 + layer * 9;

                    for (let i = 0; i < count; i++) {
                        const angle = baseAngle + (i / count) * Math.PI * 2;
                        const jX = (Math.random() - 0.5) * 4;
                        const jY = (Math.random() - 0.5) * 4;

                        positions.push({
                            x: centerX + Math.cos(angle) * radius + jX,
                            y: centerY + Math.sin(angle) * radius + jY,
                            layer: layer
                        });
                    }
                }
                break;

            case 'hell-gate':
                // 地狱之门 - 双螺旋
                for (let layer = 0; layer < maxLayers; layer++) {
                    const count = 6 + Math.floor(layer * 0.8);
                    const radius = 30 + layer * 8;

                    // 第一条螺旋
                    for (let i = 0; i < count; i++) {
                        const angle = (i / count) * Math.PI * 2 + layer * 0.4;
                        positions.push({
                            x: centerX + Math.cos(angle) * radius,
                            y: centerY + Math.sin(angle) * radius,
                            layer: layer
                        });
                    }
                    // 第二条螺旋（偏移180度）
                    for (let i = 0; i < count; i++) {
                        const angle = (i / count) * Math.PI * 2 + layer * 0.4 + Math.PI;
                        positions.push({
                            x: centerX + Math.cos(angle) * radius,
                            y: centerY + Math.sin(angle) * radius,
                            layer: layer
                        });
                    }
                }
                break;

            case 'legend':
                // 传说模式 - 复杂多重重叠
                for (let layer = 0; layer < maxLayers; layer++) {
                    const count = 5 + Math.floor(layer * 1.3);
                    const rings = 2;

                    for (let ring = 0; ring < rings; ring++) {
                        const ringRadius = 20 + ring * 40 + layer * 5;
                        for (let i = 0; i < count; i++) {
                            const angle = (i / count) * Math.PI * 2 + ring * Math.PI / count + layer * 0.1;
                            const jX = (Math.random() - 0.5) * 3;
                            const jY = (Math.random() - 0.5) * 3;

                            positions.push({
                                x: centerX + Math.cos(angle) * ringRadius + jX,
                                y: centerY + Math.sin(angle) * ringRadius + jY,
                                layer: layer
                            });
                        }
                    }
                }
                break;
        }

        return positions;
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// ==================== 游戏主类 ====================
class Game {
    constructor() {
        this.tiles = [];
        this.slotTiles = [];
        this.currentLevel = 1;
        this.score = 0;
        this.tileIdCounter = 0;
        this.history = []; // 撤回历史
        this.hasRevived = false; // 是否已复活
        this.tools = { remove: 3, undo: 3, shuffle: 3, clear: 1 };
        this.levelConfig = LEVELS[0];

        this.initElements();
        this.bindEvents();
        this.startLevel();
    }

    initElements() {
        this.board = document.getElementById('board');
        this.slot = document.getElementById('slot');
        this.levelDisplay = document.getElementById('level');
        this.scoreDisplay = document.getElementById('score');
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalBtn = document.getElementById('modal-btn');
        this.modalRevive = document.getElementById('modal-revive');
        this.restartBtn = document.getElementById('restart-btn');
        this.effectsLayer = document.getElementById('effects-layer');

        // 道具按钮
        this.toolRemove = document.getElementById('tool-remove');
        this.toolUndo = document.getElementById('tool-undo');
        this.toolShuffle = document.getElementById('tool-shuffle');
        this.toolClear = document.getElementById('tool-clear');

        // 道具数量显示
        this.removeCount = document.getElementById('remove-count');
        this.undoCount = document.getElementById('undo-count');
        this.shuffleCount = document.getElementById('shuffle-count');
        this.clearCount = document.getElementById('clear-count');
    }

    bindEvents() {
        this.restartBtn.addEventListener('click', () => this.restart());

        this.modalBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            if (this.modalBtn.dataset.action === 'win') {
                this.nextLevel();
            } else {
                this.restart();
            }
        });

        this.modalRevive.addEventListener('click', () => {
            this.revive();
        });

        // 道具事件
        this.toolRemove.addEventListener('click', () => this.useToolRemove());
        this.toolUndo.addEventListener('click', () => this.useToolUndo());
        this.toolShuffle.addEventListener('click', () => this.useToolShuffle());
        this.toolClear.addEventListener('click', () => this.useToolClear());
    }

    startLevel() {
        const levelIndex = Math.min(this.currentLevel - 1, LEVELS.length - 1);
        this.levelConfig = LEVELS[levelIndex];

        this.levelDisplay.textContent = `${this.currentLevel}. ${this.levelConfig.name}`;
        this.tools = { ...this.levelConfig.tools };
        this.tiles = [];
        this.slotTiles = [];
        this.history = [];
        this.hasRevived = false;
        this.tileIdCounter = 0;

        this.board.innerHTML = '';
        this.slot.innerHTML = '';

        this.updateToolsUI();
        this.generateLevel();
        this.renderBoard();
        this.updateTileStates();
    }

    generateLevel() {
        this.tiles = LevelGenerator.generate(this.levelConfig);
        this.tileIdCounter = this.tiles.length;
    }

    renderBoard() {
        this.board.innerHTML = '';
        this.tiles.forEach(tile => {
            const el = tile.createElement();
            el.addEventListener('click', () => this.handleTileClick(tile));
            this.board.appendChild(el);
        });
    }

    updateTileStates() {
        this.tiles.forEach(tile => {
            let isBlocked = false;
            for (const other of this.tiles) {
                if (other.id === tile.id) continue;
                if (other.layer > tile.layer && this.isOverlapping(other, tile)) {
                    isBlocked = true;
                    break;
                }
            }
            tile.updateDisabled(isBlocked);
        });
    }

    isOverlapping(tile1, tile2) {
        const margin = 3;
        return !(tile1.x + CONFIG.TILE_SIZE - margin <= tile2.x ||
                 tile1.x + margin >= tile2.x + CONFIG.TILE_SIZE ||
                 tile1.y + CONFIG.TILE_SIZE - margin <= tile2.y ||
                 tile1.y + margin >= tile2.y + CONFIG.TILE_SIZE);
    }

    handleTileClick(tile) {
        if (tile.disabled) return;
        if (this.slotTiles.length >= CONFIG.SLOT_SIZE) return;

        // 保存历史记录
        this.saveHistory();

        this.moveToSlot(tile);
    }

    moveToSlot(tile) {
        this.tiles = this.tiles.filter(t => t.id !== tile.id);
        tile.element.remove();

        this.slotTiles.push(tile);
        this.renderSlot();
        this.updateTileStates();

        setTimeout(() => this.checkMatch(), 100);
    }

    renderSlot() {
        this.slot.innerHTML = '';
        this.slotTiles.forEach(tile => {
            const el = tile.createElement();
            el.style.position = 'relative';
            el.style.left = '0';
            el.style.top = '0';
            el.style.zIndex = '1';
            el.classList.add('moving');
            el.addEventListener('click', () => { }); // 卡槽中不可点击
            this.slot.appendChild(el);
        });

        // 卡槽警告动画
        if (this.slotTiles.length >= 6) {
            this.slot.classList.add('warning');
            setTimeout(() => this.slot.classList.remove('warning'), 1500);
        }
    }

    checkMatch() {
        const typeCounts = {};
        this.slotTiles.forEach(tile => {
            typeCounts[tile.pattern] = (typeCounts[tile.pattern] || 0) + 1;
        });

        const toEliminate = [];
        Object.keys(typeCounts).forEach(pattern => {
            if (typeCounts[pattern] >= 3) {
                const count = typeCounts[pattern];
                const eliminateCount = Math.floor(count / 3) * 3;
                for (let i = 0; i < eliminateCount; i++) {
                    const tileIndex = this.slotTiles.findIndex(t => t.pattern === parseInt(pattern));
                    if (tileIndex !== -1) {
                        toEliminate.push(this.slotTiles[tileIndex]);
                        this.slotTiles.splice(tileIndex, 1);
                    }
                }
            }
        });

        if (toEliminate.length > 0) {
            // 加分
            this.score += toEliminate.length * 10;
            this.scoreDisplay.textContent = this.score;

            toEliminate.forEach(tile => {
                const el = this.slot.querySelector(`[data-id="${tile.id}"]`);
                if (el) {
                    el.classList.add('eliminating');
                    this.showEffect(el.textContent, el);
                    setTimeout(() => el.remove(), 350);
                }
            });

            setTimeout(() => {
                this.renderSlot();
                this.checkGameState();
            }, 350);
        } else {
            this.checkGameState();
        }
    }

    showEffect(emoji, element) {
        const rect = element.getBoundingClientRect();
        const effect = document.createElement('div');
        effect.className = 'effect-particle';
        effect.textContent = emoji;
        effect.style.left = rect.left + 'px';
        effect.style.top = rect.top + 'px';
        this.effectsLayer.appendChild(effect);
        setTimeout(() => effect.remove(), 500);
    }

    checkGameState() {
        // 胜利判定
        if (this.tiles.length === 0 && this.slotTiles.length === 0) {
            this.showModal('🎉 恭喜通关！', `完成关卡！得分: ${this.score}`, 'win');
            return;
        }

        // 失败判定
        if (this.slotTiles.length >= CONFIG.SLOT_SIZE) {
            const typeCounts = {};
            this.slotTiles.forEach(tile => {
                typeCounts[tile.pattern] = (typeCounts[tile.pattern] || 0) + 1;
            });

            const canEliminate = Object.values(typeCounts).some(count => count >= 3);

            if (!canEliminate) {
                if (!this.hasRevived) {
                    this.showModal('😱 卡槽已满！', '游戏即将结束...', 'lose');
                } else {
                    this.showModal('😢 游戏结束', '卡槽已满，无法消除！', 'lose');
                }
            }
        }
    }

    showModal(title, message, action) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modalBtn.textContent = action === 'win' ? '下一关' : '重新开始';
        this.modalBtn.dataset.action = action;

        // 显示复活按钮（仅失败且未复活时）
        if (action === 'lose' && !this.hasRevived) {
            this.modalRevive.classList.remove('hidden');
        } else {
            this.modalRevive.classList.add('hidden');
        }

        this.modal.classList.remove('hidden');
    }

    revive() {
        this.hasRevived = true;
        this.modal.classList.add('hidden');

        // 清空卡槽的一半
        const toRemove = Math.ceil(this.slotTiles.length / 2);
        for (let i = 0; i < toRemove; i++) {
            if (this.slotTiles.length > 0) {
                const tile = this.slotTiles.pop();
                // 放回游戏区域
                tile.x = 50 + Math.random() * 200;
                tile.y = 50 + Math.random() * 200;
                tile.layer = 0;
                this.tiles.push(tile);
            }
        }

        this.renderSlot();
        this.renderBoard();
        this.updateTileStates();

        // 显示复活效果
        this.showEffect('💖', this.slot);
    }

    nextLevel() {
        this.currentLevel++;
        this.startLevel();
    }

    restart() {
        this.modal.classList.add('hidden');
        this.score = 0;
        this.scoreDisplay.textContent = '0';
        this.startLevel();
    }

    // ==================== 道具功能 ====================

    updateToolsUI() {
        this.removeCount.textContent = this.tools.remove;
        this.undoCount.textContent = this.tools.undo;
        this.shuffleCount.textContent = this.tools.shuffle;
        this.clearCount.textContent = this.tools.clear;

        this.toolRemove.disabled = this.tools.remove <= 0;
        this.toolUndo.disabled = this.tools.undo <= 0 || this.history.length === 0;
        this.toolShuffle.disabled = this.tools.shuffle <= 0;
        this.toolClear.disabled = this.tools.clear <= 0;
    }

    saveHistory() {
        if (this.history.length >= 20) {
            this.history.shift();
        }
        this.history.push({
            tiles: JSON.stringify(this.tiles.map(t => ({
                id: t.id, pattern: t.pattern, x: t.x, y: t.y, layer: t.layer
            }))),
            slotTiles: JSON.stringify(this.slotTiles.map(t => ({
                id: t.id, pattern: t.pattern, x: t.x, y: t.y, layer: t.layer
            })))
        });
        this.updateToolsUI();
    }

    // 移出三张 - 清除卡槽中的4张
    useToolRemove() {
        if (this.tools.remove <= 0 || this.slotTiles.length === 0) return;

        const toRemove = Math.min(4, this.slotTiles.length);
        for (let i = 0; i < toRemove; i++) {
            this.slotTiles.pop();
        }

        this.tools.remove--;
        this.renderSlot();
        this.updateToolsUI();
        this.showEffect('📤', this.toolRemove);

        setTimeout(() => this.checkMatch(), 100);
    }

    // 撤回
    useToolUndo() {
        if (this.tools.undo <= 0 || this.history.length === 0) return;

        const lastState = this.history.pop();

        // 恢复状态
        this.tiles = JSON.parse(lastState.tiles).map(data => {
            const tile = new Tile(data.id, data.pattern, data.x, data.y, data.layer);
            return tile;
        });

        this.slotTiles = JSON.parse(lastState.slotTiles).map(data => {
            const tile = new Tile(data.id, data.pattern, data.x, data.y, data.layer);
            return tile;
        });

        this.tools.undo--;
        this.renderBoard();
        this.renderSlot();
        this.updateTileStates();
        this.updateToolsUI();
        this.showEffect('↩️', this.toolUndo);
    }

    // 洗牌
    useToolShuffle() {
        if (this.tools.shuffle <= 0) return;

        // 只洗游戏区域的方块位置
        const tileData = this.tiles.map(t => ({
            tile: t,
            pattern: t.pattern
        }));

        // 洗牌图案
        const patterns = tileData.map(d => d.pattern);
        LevelGenerator.shuffle(patterns);

        // 重新分配图案
        tileData.forEach((d, i) => {
            d.tile.pattern = patterns[i];
        });

        this.tools.shuffle--;
        this.renderBoard();
        this.updateToolsUI();
        this.showEffect('🔀', this.toolShuffle);
    }

    // 超级清除 - 清空整个卡槽
    useToolClear() {
        if (this.tools.clear <= 0 || this.slotTiles.length === 0) return;

        // 清空卡槽并直接消除所有
        const cleared = this.slotTiles.length;
        this.slotTiles = [];

        // 加分
        this.score += cleared * 15;
        this.scoreDisplay.textContent = this.score;

        this.tools.clear--;
        this.renderSlot();
        this.updateToolsUI();
        this.showEffect('✨', this.toolClear);

        // 炫酷效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.showEffect('⭐', this.slot);
            }, i * 100);
        }
    }
}

// ==================== 初始化游戏 ====================
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
