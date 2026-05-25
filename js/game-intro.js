// 游戏说明系统 - 通用脚本
(function() {
    'use strict';

    // 游戏说明数据
    const gameIntros = {
        'snake-game': {
            name: '🐍 贪吃蛇大作战',
            icon: '🐍',
            color: '#22c55e',
            description: '控制贪吃蛇吃食物变长，不要撞到墙壁或自己！',
            features: ['999个关卡挑战', '多种道具助力', '支持穿墙模式', '无限刺激体验'],
            controls: [
                { action: '移动', method: '方向键 或 WASD' },
                { action: '加速', method: '按住空格键' },
                { action: '暂停', method: 'P 键或点击暂停' }
            ],
            tips: ['收集道具可以穿墙', '不要贪心，安全第一', '后期加速要小心']
        },
        '2048': {
            name: '🔢 2048进化版',
            icon: '🔢',
            color: '#f5576c',
            description: '合并相同数字，挑战2048甚至更高！',
            features: ['数字合并挑战', '多种难度选择', '撤销功能', '自动保存进度'],
            controls: [
                { action: '移动方块', method: '方向键 或 滑动屏幕' },
                { action: '撤销', method: '点击撤销按钮' },
                { action: '重新开始', method: '点击新游戏按钮' }
            ],
            tips: ['保持大数在角落', '从小数字开始合并', '预留空间很重要']
        },
        'runner-game': {
            name: '🏃 跑酷大冒险',
            icon: '🏃',
            color: '#f59e0b',
            description: '二段跳动漫角色跑酷，挑战极限距离！',
            features: ['二段跳机制', '动漫角色设计', '无尽挑战', '道具收集系统'],
            controls: [
                { action: '跳跃', method: '点击屏幕 或 空格键' },
                { action: '二段跳', method: '空中再次点击/按空格' },
                { action: '蹲下', method: '向下滑动 或 S键' }
            ],
            tips: ['二段跳可以躲避障碍', '及时收集道具加分', '节奏很重要']
        },
        'space-shooter': {
            name: '🚀 太空射击',
            icon: '🚀',
            color: '#ef4444',
            description: '热血太空射击，消灭敌机并存活！',
            features: ['波次系统', '武器升级', 'Boss战', '无限弹药'],
            controls: [
                { action: '移动飞机', method: '鼠标 或 触摸拖动' },
                { action: '射击', method: '自动射击' },
                { action: '释放技能', method: '点击技能按钮' }
            ],
            tips: ['优先消灭Boss', '收集武器升级', '保持移动躲避子弹']
        },
        'pong-game': {
            name: '🏓 弹球挑战',
            icon: '🏓',
            color: '#3b82f6',
            description: '经典弹球游戏，挑战你的反应速度！',
            features: ['物理引擎', '角度控制', '速度递增', 'AI对战'],
            controls: [
                { action: '移动挡板', method: '鼠标上下移动 或 触摸拖动' },
                { action: '开始发球', method: '点击屏幕 或 空格键' },
                { action: '暂停', method: 'P键 或 点击暂停' }
            ],
            tips: ['用挡板边缘击球改变角度', '预判球的轨迹', '速度会越来越快']
        },
        'breakout': {
            name: '🧱 打砖块',
            icon: '🧱',
            color: '#8b5cf6',
            description: '999关随机布局，挑战极致体验！',
            features: ['999个关卡', '随机砖块布局', '道具系统', '连击奖励'],
            controls: [
                { action: '移动挡板', method: '鼠标 或 左右方向键' },
                { action: '发射小球', method: '点击 或 空格键' },
                { action: '使用道具', method: '接住掉落的道具' }
            ],
            tips: ['优先击碎特殊砖块', '道具会随机掉落', '保持连击获得高分']
        },
        'tile-game': {
            name: '🍎 消消大作战',
            icon: '🍎',
            color: '#ec4899',
            description: '经典三消玩法，策略消除获得高分！',
            features: ['经典三消', '道具系统', '关卡挑战', '限时模式'],
            controls: [
                { action: '选择方块', method: '点击方块' },
                { action: '交换位置', method: '点击相邻方块' },
                { action: '使用道具', method: '点击道具按钮' }
            ],
            tips: ['优先制造连消', '道具关键时刻使用', '规划好交换顺序']
        },
        'memory': {
            name: '🃏 记忆翻牌',
            icon: '🃏',
            color: '#14b8a6',
            description: '记忆力挑战，找出所有配对卡片！',
            features: ['记忆力训练', '多种难度', '计时挑战', '步数统计'],
            controls: [
                { action: '翻牌', method: '点击卡片' },
                { action: '重新开始', method: '点击重置按钮' }
            ],
            tips: ['记住卡片位置', '先翻开边缘卡片', '使用排除法']
        },
        'minesweeper': {
            name: '💣 扫雷',
            icon: '💣',
            color: '#64748b',
            description: '经典扫雷游戏，三种难度等你挑战！',
            features: ['三种难度', '计时挑战', '地雷计数', '安全开启'],
            controls: [
                { action: '翻开方块', method: '左键点击' },
                { action: '标记地雷', method: '右键点击' },
                { action: '双击开启', method: '双击已翻开的数字' }
            ],
            tips: ['从角落开始', '利用数字提示', '不要猜，要推理']
        },
        'gomoku': {
            name: '⚫ 五子棋',
            icon: '⚫',
            color: '#1f2937',
            description: '人机对战AI，挑战智能棋局！',
            features: ['AI对战', '多种难度', '悔棋功能', '棋局分析'],
            controls: [
                { action: '下棋', method: '点击棋盘交叉点' },
                { action: '悔棋', method: '点击悔棋按钮' },
                { action: '重新开始', method: '点击重置按钮' }
            ],
            tips: ['占领四个方向', '注意防守', '制造双杀机会']
        },
        'tetris': {
            name: '🟦 俄罗斯方块',
            icon: '🟦',
            color: '#22d3ee',
            description: '经典消除+升级系统，挑战无尽模式！',
            features: ['升级系统', '下一个预览', '等级加速', '消除奖励'],
            controls: [
                { action: '移动', method: '左右方向键' },
                { action: '旋转', method: '上方向键' },
                { action: '加速下落', method: '下方向键' },
                { action: '直接落地', method: '空格键' }
            ],
            tips: ['优先消除底部', '规划好摆放位置', '不要堆太高']
        },
        'whack-a-mole': {
            name: '🔨 打地鼠',
            icon: '🔨',
            color: '#84cc16',
            description: '反应力挑战+连击系统，锤爆地鼠！',
            features: ['反应力挑战', '连击系统', '特殊地鼠', '限时模式'],
            controls: [
                { action: '敲击', method: '点击地鼠' },
                { action: '开始游戏', method: '点击开始按钮' }
            ],
            tips: ['反应要快', '特殊地鼠分数更高', '保持连击加分']
        },
        'tank-battle': {
            name: '🎮 坦克大战',
            icon: '🎮',
            color: '#b91c1c',
            description: '经典坦克+关卡系统，消灭敌人！',
            features: ['关卡系统', '多敌类型', '道具收集', '保卫基地'],
            controls: [
                { action: '移动', method: 'WASD 或 方向键' },
                { action: '射击', method: '空格键 或 点击' },
                { action: '停止', method: 'S键 或 按住不动' }
            ],
            tips: ['保护基地很重要', '道具会随机出现', '不要贪功冒进']
        },
        'puzzle': {
            name: '🧩 拼图游戏',
            icon: '🧩',
            color: '#f97316',
            description: '多难度+计时挑战，还原完整图片！',
            features: ['多种难度', '计时挑战', '图片选择', '步数统计'],
            controls: [
                { action: '移动拼图', method: '点击相邻拼图' },
                { action: '查看原图', method: '点击预览按钮' },
                { action: '重新开始', method: '点击重置按钮' }
            ],
            tips: ['先还原边角', '记住原图样子', '分区域完成']
        },
        'tower-defense': {
            name: '🏰 塔防大战',
            icon: '🏰',
            color: '#3b82f6',
            description: '6种防御塔+波次系统，策略放置塔防！',
            features: ['6种防御塔', '波次系统', '升级强化', '技能释放'],
            controls: [
                { action: '建造防御塔', method: '点击空地选择塔类型' },
                { action: '升级防御塔', method: '点击已建造的塔' },
                { action: '释放技能', method: '点击技能按钮' }
            ],
            tips: ['不同塔有不同作用', '前期优先建箭塔', '及时升级重要防御塔']
        }
    };

    // 获取当前游戏ID
    function getCurrentGameId() {
        const path = window.location.pathname;
        // 移除末尾的斜杠和index.html
        let cleanPath = path.replace(/\/$/, '').replace(/\/index\.html$/, '');
        // 获取最后一个路径段作为游戏ID
        const match = cleanPath.match(/\/([^\/]+)$/);
        return match ? match[1] : null;
    }

    // 创建游戏说明弹窗
    function createIntroModal() {
        const gameId = getCurrentGameId();
        console.log('当前游戏ID:', gameId); // 调试信息

        const gameData = gameIntros[gameId];

        if (!gameData) {
            console.warn('未找到游戏说明数据:', gameId);
            console.log('可用的游戏ID:', Object.keys(gameIntros));
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'game-intro-modal';
        modal.innerHTML = `
            <div class="game-intro-content">
                <button class="game-intro-close" onclick="GameIntro.closeModal()">×</button>
                <div class="game-intro-header">
                    <div class="game-intro-icon">${gameData.icon}</div>
                    <h2 class="game-intro-title">${gameData.name}</h2>
                    <p class="game-intro-desc">${gameData.description}</p>
                </div>

                <div class="game-intro-section">
                    <h3 class="game-intro-section-title">✨ 游戏特色</h3>
                    <div class="game-intro-features">
                        ${gameData.features.map(f => `<span class="game-intro-feature">${f}</span>`).join('')}
                    </div>
                </div>

                <div class="game-intro-section">
                    <h3 class="game-intro-section-title">🎮 操作说明</h3>
                    <div class="game-intro-controls">
                        ${gameData.controls.map(c => `
                            <div class="game-intro-control-item">
                                <span class="control-action">${c.action}</span>
                                <span class="control-method">${c.method}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="game-intro-section">
                    <h3 class="game-intro-section-title">💡 游戏技巧</h3>
                    <div class="game-intro-tips">
                        ${gameData.tips.map(t => `<div class="game-intro-tip">${t}</div>`).join('')}
                    </div>
                </div>

                <button class="game-intro-start-btn" onclick="GameIntro.closeModal()">
                    开始游戏 🎮
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // 创建游戏说明按钮
    function createHelpButton() {
        const button = document.createElement('button');
        button.className = 'game-help-btn';
        button.innerHTML = '📖';
        button.setAttribute('aria-label', '游戏说明');
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('游戏说明按钮被点击');
            GameIntro.showModal();
        });
        document.body.appendChild(button);
        return button;
    }

    // 检查是否已显示过说明
    function hasShownIntro() {
        const gameId = getCurrentGameId();
        const key = `game_intro_shown_${gameId}`;
        return localStorage.getItem(key) === 'true';
    }

    // 标记已显示过说明
    function markIntroShown() {
        const gameId = getCurrentGameId();
        const key = `game_intro_shown_${gameId}`;
        localStorage.setItem(key, 'true');
    }

    // 初始化游戏说明系统
    function initGameIntro() {
        const modal = createIntroModal();
        const button = createHelpButton();

        // 点击弹窗外部关闭弹窗
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    GameIntro.closeModal();
                }
            });
        }

        // 首次访问显示说明
        if (!hasShownIntro()) {
            setTimeout(() => {
                modal.classList.add('show');
                markIntroShown();
            }, 500);
        }
    }

    // 导出到全局
    window.GameIntro = {
        showModal: function() {
            console.log('显示游戏说明弹窗');
            const modal = document.querySelector('.game-intro-modal');
            if (modal) {
                modal.classList.add('show');
                console.log('弹窗已显示');
            } else {
                console.error('未找到游戏说明弹窗元素');
            }
        },
        closeModal: function() {
            console.log('关闭游戏说明弹窗');
            const modal = document.querySelector('.game-intro-modal');
            if (modal) {
                modal.classList.remove('show');
                console.log('弹窗已关闭');
            }
        }
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGameIntro);
    } else {
        initGameIntro();
    }
})();
