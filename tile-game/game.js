// 游戏配置
const CONFIG = {
    SLOT_SIZE: 8,          // 卡槽大小
    TILE_SIZE: 50,         // 方块大小
    BOARD_SIZE: 360,       // 游戏区域大小
    TILE_TYPES: 24,        // 方块种类数量
    GRID_SIZE: 7           // 网格大小
};

// 方块图标 - 纯emoji图案
const TILE_ICONS = [
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍒',
    '🥝', '🍑', '🥭', '🍍', '🥥', '🍌',
    '🌸', '🌺', '🌻', '🌷', '🌹', '🏀',
    '⚽', '🎮', '🎯', '🎪', '🎨', '🎭'
];

// 方块类
class Tile {
    constructor(id, type, x, y, layer) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.element = null;
        this.disabled = false;
    }

    createElement() {
        const el = document.createElement('div');
        el.className = `tile color-${this.type + 1}`;
        el.textContent = TILE_ICONS[this.type];
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

// 游戏类
class Game {
    constructor() {
        this.tiles = [];
        this.slotTiles = [];
        this.MAX_LEVEL = 999;
        this.level = parseInt(localStorage.getItem('tileGameLevel')) || 1;
        this.tileIdCounter = 0;
        this.shuffleCount = 3; // 洗牌次数

        this.board = document.getElementById('board');
        this.slot = document.getElementById('slot');
        this.levelDisplay = document.getElementById('level');
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalBtn = document.getElementById('modal-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.shuffleCountDisplay = document.getElementById('shuffle-count');

        this.bindEvents();
        this.startLevel();
    }

    saveLevel() {
        localStorage.setItem('tileGameLevel', this.level);
    }

    bindEvents() {
        this.restartBtn.addEventListener('click', () => this.restart());
        this.homeBtn.addEventListener('click', () => {
            location.href = '../index.html';
        });
        this.shuffleBtn.addEventListener('click', () => this.useShuffle());
        this.modalBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            if (this.modalBtn.dataset.action === 'win') {
                if (this.level < this.MAX_LEVEL) {
                    this.level++;
                    this.saveLevel();
                    this.startLevel();
                } else {
                    this.showModal('🏆 恭喜你通关了全部999关！', '游戏将从头开始！', 'winall');
                }
            } else if (this.modalBtn.dataset.action === 'winall') {
                this.level = 1;
                this.saveLevel();
                this.startLevel();
            } else {
                this.restart();
            }
        });
    }

    startLevel() {
        this.levelDisplay.textContent = `${this.level}/${this.MAX_LEVEL}`;
        this.shuffleCount = 3; // 重置洗牌次数
        this.updateShuffleUI();
        this.tiles = [];
        this.slotTiles = [];
        this.tileIdCounter = 0;
        this.board.innerHTML = '';
        this.slot.innerHTML = '';

        // 根据关卡增加难度
        const tileCount = Math.min(20 + this.level * 5, 60);
        const layers = Math.min(3 + Math.floor(this.level / 2), 6);

        this.generateTiles(tileCount, layers);
        this.renderBoard();
        this.updateTileStates();
    }

    updateShuffleUI() {
        this.shuffleCountDisplay.textContent = this.shuffleCount;
        this.shuffleBtn.disabled = this.shuffleCount <= 0;
    }

    useShuffle() {
        if (this.shuffleCount <= 0) return;

        // 收集所有方块（游戏区域 + 卡槽）
        const allTiles = [...this.tiles, ...this.slotTiles];
        const allTypes = allTiles.map(t => t.type);

        // 洗牌
        this.shuffleArray(allTypes);

        // 重新分配类型
        let index = 0;
        this.tiles.forEach(tile => {
            tile.type = allTypes[index++];
        });
        this.slotTiles.forEach(tile => {
            tile.type = allTypes[index++];
        });

        this.shuffleCount--;
        this.updateShuffleUI();

        // 重新渲染
        this.renderBoard();
        this.renderSlot();
        this.checkMatch(); // 检查是否能消除
    }

    generateTiles(count, maxLayers) {
        // 确保总数是3的倍数
        count = Math.ceil(count / 3) * 3;

        // 先生成牌库：每种图案3个一组
        const tileLibrary = [];
        const typeCount = Math.floor(count / 3);

        for (let i = 0; i < typeCount; i++) {
            const type = i % CONFIG.TILE_TYPES;
            // 每组3个相同类型
            for (let j = 0; j < 3; j++) {
                tileLibrary.push(type);
            }
        }

        // 随机洗牌
        this.shuffleArray(tileLibrary);

        // 根据关卡计算堆叠参数
        const baseLayers = Math.min(1 + Math.floor((this.level - 1) / 2), 5); // 1-5层
        const overlapRatio = Math.min(0.2 + (this.level - 1) * 0.1, 0.7); // 20%-70%重叠
        const spread = Math.max(180 - this.level * 15, 60); // 分布范围随关卡缩小

        const centerX = (CONFIG.BOARD_SIZE - CONFIG.TILE_SIZE) / 2;
        const centerY = (CONFIG.BOARD_SIZE - CONFIG.TILE_SIZE) / 2;

        // 生成方块
        for (let i = 0; i < count; i++) {
            // 随机层级（底部方块更多）
            const layerRand = Math.random();
            let layer;
            if (layerRand < 0.4) {
                layer = 0; // 40%在底层
            } else if (layerRand < 0.7) {
                layer = Math.floor(Math.random() * Math.min(2, baseLayers)); // 30%在中层
            } else {
                layer = Math.floor(Math.random() * baseLayers); // 30%随机层
            }

            // 随机位置，集中在中心
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * spread;
            const x = centerX + Math.cos(angle) * radius - CONFIG.TILE_SIZE / 2;
            const y = centerY + Math.sin(angle) * radius - CONFIG.TILE_SIZE / 2;

            // 确保在边界内
            const finalX = Math.max(10, Math.min(x, CONFIG.BOARD_SIZE - CONFIG.TILE_SIZE - 10));
            const finalY = Math.max(10, Math.min(y, CONFIG.BOARD_SIZE - CONFIG.TILE_SIZE - 10));

            const type = tileLibrary[i];
            const tile = new Tile(this.tileIdCounter++, type, finalX, finalY, layer);
            this.tiles.push(tile);
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
        // 检查每个方块是否被遮挡
        this.tiles.forEach(tile => {
            let isBlocked = false;
            for (const other of this.tiles) {
                if (other.id === tile.id) continue;

                // 如果其他方块在更上层，且与当前方块重叠
                if (other.layer > tile.layer && this.isOverlapping(other, tile)) {
                    isBlocked = true;
                    break;
                }
            }
            tile.updateDisabled(isBlocked);
        });
    }

    isOverlapping(tile1, tile2) {
        const margin = 5; // 允许一些边缘重叠
        return !(tile1.x + CONFIG.TILE_SIZE - margin <= tile2.x ||
                 tile1.x + margin >= tile2.x + CONFIG.TILE_SIZE ||
                 tile1.y + CONFIG.TILE_SIZE - margin <= tile2.y ||
                 tile1.y + margin >= tile2.y + CONFIG.TILE_SIZE);
    }

    handleTileClick(tile) {
        if (tile.disabled) return;
        if (this.slotTiles.length >= CONFIG.SLOT_SIZE) return;

        // 移动到卡槽
        this.moveToSlot(tile);
    }

    moveToSlot(tile) {
        // 从游戏区域移除
        this.tiles = this.tiles.filter(t => t.id !== tile.id);
        tile.element.remove();

        // 添加到卡槽
        this.slotTiles.push(tile);

        // 重新渲染卡槽
        this.renderSlot();

        // 更新游戏区域的方块状态
        this.updateTileStates();

        // 检查消除
        setTimeout(() => this.checkMatch(), 100);
    }

    renderSlot() {
        this.slot.innerHTML = '';
        this.slotTiles.forEach(tile => {
            // 重新创建元素以更新显示的图标
            const el = tile.createElement();
            el.style.position = 'relative';
            el.style.left = '0';
            el.style.top = '0';
            el.style.zIndex = '1';
            el.classList.add('moving');
            el.addEventListener('click', () => this.handleSlotClick(tile));
            this.slot.appendChild(el);
        });
    }

    handleSlotClick(tile) {
        // 卡槽中的方块不能点击返回
    }

    checkMatch() {
        // 统计每种类型的数量
        const typeCounts = {};
        this.slotTiles.forEach(tile => {
            typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1;
        });

        // 找到可消除的类型
        const toEliminate = [];
        Object.keys(typeCounts).forEach(type => {
            if (typeCounts[type] >= 3) {
                const count = typeCounts[type];
                const eliminateCount = Math.floor(count / 3) * 3;
                for (let i = 0; i < eliminateCount; i++) {
                    const tileIndex = this.slotTiles.findIndex(t => t.type === parseInt(type));
                    if (tileIndex !== -1) {
                        toEliminate.push(this.slotTiles[tileIndex]);
                        this.slotTiles.splice(tileIndex, 1);
                    }
                }
            }
        });

        // 执行消除
        if (toEliminate.length > 0) {
            toEliminate.forEach(tile => {
                const el = this.slot.querySelector(`[data-id="${tile.id}"]`);
                if (el) {
                    el.classList.add('eliminating');
                    setTimeout(() => el.remove(), 300);
                }
            });

            setTimeout(() => {
                this.renderSlot();
                this.checkGameState();
            }, 300);
        } else {
            this.checkGameState();
        }
    }

    checkGameState() {
        // 检查胜利
        if (this.tiles.length === 0 && this.slotTiles.length === 0) {
            this.showModal('🎉 恭喜通关！', `你成功完成了第 ${this.level} 关！`, 'win');
            return;
        }

        // 检查失败
        if (this.slotTiles.length >= CONFIG.SLOT_SIZE) {
            // 检查是否还能消除
            const typeCounts = {};
            this.slotTiles.forEach(tile => {
                typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1;
            });

            const canEliminate = Object.values(typeCounts).some(count => count >= 3);

            if (!canEliminate) {
                this.showModal('😢 游戏结束', '卡槽已满，无法消除！', 'lose');
            }
        }
    }

    showModal(title, message, action) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modalBtn.textContent = action === 'win' ? '下一关' : '重新开始';
        this.modalBtn.dataset.action = action;
        this.modal.classList.remove('hidden');

        // 保存游戏结果到sessionStorage
        const won = action === 'win';
        const score = this.level * 100;
        const result = {
            score: score,
            level: this.level,
            won: won,
            timestamp: Date.now(),
            gameId: 'tile-game'
        };
        sessionStorage.setItem('lastGameResult', JSON.stringify(result));
    }

    restart() {
        this.modal.classList.add('hidden');
        this.startLevel();
    }
}

let tileGameInstance = null;
function selectTileLevel(level) {
    if (tileGameInstance) {
        tileGameInstance.level = level;
        tileGameInstance.saveLevel();
        tileGameInstance.startLevel();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 设置游戏开始时间和当前游戏ID
    sessionStorage.setItem('gameStartTime', Date.now());
    sessionStorage.setItem('currentGame', 'tile-game');

    tileGameInstance = new Game();
});
