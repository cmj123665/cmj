#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量为所有游戏添加导航栏
"""
import os
import re
import sys

# 设置UTF-8编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer.detach(), 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer.detach(), 'strict')

GAME_DIRS = [
    'tetris', 'breakout', 'space-shooter', 'pong-game', 'tile-game',
    'memory', 'minesweeper', 'gomoku', 'whack-a-mole', 'tank-battle',
    'puzzle', 'tower-defense', 'runner-game'
]

NAV_CSS = '''
    /* ========== 游戏导航栏 ========== */
    .game-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom));
        display: flex;
        justify-content: center;
        gap: 12px;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .game-nav-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .game-nav-btn:hover {
        transform: scale(1.05);
    }

    .game-nav-btn:active {
        transform: scale(0.95);
    }

    .game-nav-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .game-nav-btn.secondary {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #e0e0e0;
    }

    .game-nav-btn.tertiary {
        background: transparent;
        color: #666;
    }

    /* 游戏说明弹窗 */
    .help-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
    }

    .help-modal.show {
        display: flex;
    }

    .help-modal-content {
        background: #fff;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        color: #333;
    }

    .help-modal-content h2 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
        color: #333;
    }

    .help-modal-content p {
        font-size: 14px;
        line-height: 1.8;
        margin-bottom: 12px;
        color: #666;
    }

    .help-modal-content .key {
        display: inline-block;
        background: #f5f5f5;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
        color: #333;
        margin: 0 4px;
    }

    .help-modal-content ul {
        margin: 15px 0;
        padding-left: 20px;
    }

    .help-modal-content li {
        margin-bottom: 8px;
        font-size: 14px;
        color: #666;
    }

    @media (max-width: 768px) {
        .game-nav {
            flex-wrap: wrap;
            padding: 10px;
        }

        .game-nav-btn {
            flex: 1;
            min-width: 80px;
            padding: 10px 12px;
            font-size: 12px;
        }
    }
'''

def get_game_info(game_dir):
    """获取游戏信息"""
    info = {
        'tetris': {'name': '俄罗斯方块', 'emoji': '🧱', 'desc': '经典消除游戏'},
        'breakout': {'name': '打砖块', 'emoji': '🧱', 'desc': '消除所有砖块'},
        'space-shooter': {'name': '太空射击', 'emoji': '🚀', 'desc': '消灭敌人波次'},
        'pong-game': {'name': '弹球挑战', 'emoji': '🏓', 'desc': '经典弹球对战'},
        'tile-game': {'name': '消消大作战', 'emoji': '🍎', 'desc': '三消益智游戏'},
        'memory': {'name': '记忆翻牌', 'emoji': '🃏', 'desc': '记忆力挑战'},
        'minesweeper': {'name': '扫雷', 'emoji': '💣', 'desc': '经典扫雷游戏'},
        'gomoku': {'name': '五子棋', 'emoji': '⚫', 'desc': '策略棋类游戏'},
        'whack-a-mole': {'name': '打地鼠', 'emoji': '🔨', 'desc': '反应力挑战'},
        'tank-battle': {'name': '坦克大战', 'emoji': '🎮', 'desc': '经典坦克战争'},
        'puzzle': {'name': '拼图游戏', 'emoji': '🧩', 'desc': '滑动拼图挑战'},
        'tower-defense': {'name': '塔防大战', 'emoji': '🏰', 'desc': '策略塔防游戏'},
        'runner-game': {'name': '跑酷大冒险', 'emoji': '🏃', 'desc': '无尽跑酷挑战'}
    }
    return info.get(game_dir, {'name': '游戏', 'emoji': '🎮', 'desc': '有趣的'})

def add_nav_to_game(filepath):
    """为游戏添加导航栏"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已有导航栏
    if 'game-nav' in content:
        print(f"✓ {filepath} 已有导航栏")
        return

    # 查找CSS结束位置
    css_match = re.search(r'(</style>)', content)
    if not css_match:
        print(f"✗ {filepath} 未找到CSS样式")
        return

    css_pos = css_match.start()

    # 插入导航栏CSS
    content = content[:css_pos] + NAV_CSS + content[css_pos:]

    # 查找body结束位置
    body_match = re.search(r'(</body>)', content)
    if not body_match:
        print(f"✗ {filepath} 未找到body标签")
        return

    body_pos = body_match.start()

    # 获取游戏信息
    game_dir = os.path.basename(os.path.dirname(filepath))
    game_info = get_game_info(game_dir)

    # 生成导航栏HTML
    nav_html = f'''
    <!-- 游戏导航栏 -->
    <div class="game-nav">
        <button class="game-nav-btn primary" onclick="backToHall()">
            <span>🏠</span>
            <span>返回大厅</span>
        </button>
        <button class="game-nav-btn secondary" onclick="restartGame()">
            <span>🔄</span>
            <span>重新开始</span>
        </button>
        <button class="game-nav-btn tertiary" onclick="showHelp()">
            <span>❓</span>
            <span>游戏说明</span>
        </button>
    </div>

    <!-- 游戏说明弹窗 -->
    <div class="help-modal" id="helpModal">
        <div class="help-modal-content">
            <h2>{game_info['emoji']} {game_info['name']}</h2>
            <p><strong>游戏目标：</strong>{game_info['desc']}</p>
            <p><strong>操作方式：</strong></p>
            <ul>
                <li>电脑：使用<span class="key">方向键</span>或<span class="key">WASD</span>控制</li>
                <li>手机：<span class="key">点击</span>或<span class="key">滑动</span>屏幕</li>
            </ul>
            <p><strong>游戏规则：</strong>尽可能获得高分，挑战自己的极限！</p>
            <button class="game-nav-btn primary" onclick="closeHelp()" style="width: 100%; padding: 12px; margin-top: 20px;">知道了</button>
        </div>
    </div>

    <script>
        function backToHall() {{
            if (window.parent) {{
                window.parent.location.href = '../index.html';
            }} else {{
                window.location.href = '../index.html';
            }}
        }}

        function restartGame() {{
            location.reload();
        }}

        function showHelp() {{
            document.getElementById('helpModal').classList.add('show');
        }}

        function closeHelp() {{
            document.getElementById('helpModal').classList.remove('show');
        }}
    </script>
'''

    # 插入导航栏HTML
    content = content[:body_pos] + nav_html + content[body_pos:]

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ 已添加导航栏到 {game_dir}")

# 处理所有游戏
print("开始为所有游戏添加导航栏...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        add_nav_to_game(filepath)

print("\n✅ 完成！所有游戏都已添加导航栏")
