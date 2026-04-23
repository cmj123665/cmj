#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复游戏触摸控制支持
为所有游戏添加移动端触摸控制和返回功能
"""
import os
import re
import sys

# 设置输出编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# 需要修复的游戏列表
GAMES = [
    'runner-game',
    'pong-game',
    'breakout',
    'tile-game',
    'memory',
    'minesweeper',
    'gomoku',
    'whack-a-mole',
    'tank-battle',
    'puzzle',
    'tower-defense'
]

def add_touch_support_to_snake_like(game_path):
    """为贪吃蛇类游戏添加触摸控制"""
    with open(game_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有触摸支持
    if 'touchstart' in content or 'addEventListener.*touch' in content:
        print(f"  [OK] 已有触摸支持")
        return False

    # 添加虚拟方向键样式
    style_addition = '''
        /* 虚拟方向键 */
        .d-pad {
            position: fixed;
            bottom: 80px;
            right: 20px;
            display: grid;
            grid-template-columns: repeat(3, 50px);
            grid-template-rows: repeat(3, 50px);
            gap: 5px;
            z-index: 999;
        }
        .d-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
        }
        .d-btn:active {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0.95);
        }
        @media (min-width: 768px) {
            .d-pad { display: none; }
        }
    '''

    # 在 </style> 前添加样式
    content = content.replace('</style>', style_addition + '</style>')

    # 添加虚拟方向键HTML（在游戏导航栏之前）
    d_pad_html = '''
    <!-- 虚拟方向键 -->
    <div class="d-pad">
        <div></div>
        <button class="d-btn" ontouchstart="moveDirection('up')" onclick="moveDirection('up')">↑</button>
        <div></div>
        <button class="d-btn" ontouchstart="moveDirection('left')" onclick="moveDirection('left')">←</button>
        <div></div>
        <button class="d-btn" ontouchstart="moveDirection('right')" onclick="moveDirection('right')">→</button>
        <div></div>
        <button class="d-btn" ontouchstart="moveDirection('down')" onclick="moveDirection('down')">↓</button>
        <div></div>
    </div>
    '''

    # 在游戏导航栏之前添加
    content = re.sub(
        r'(<div class="game-nav">)',
        d_pad_html + r'\1',
        content
    )

    with open(game_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  [OK] 已添加触摸支持")
    return True

def check_game_status(game_path):
    """检查游戏状态"""
    with open(game_path, 'r', encoding='utf-8') as f:
        content = f.read()

    has_touch = 'touchstart' in content or 'addEventListener.*touch' in content
    has_back = 'backToHall' in content or '返回大厅' in content or '返回主页' in content

    return {
        'has_touch': has_touch,
        'has_back': has_back
    }

def main():
    print("游戏触摸控制检查开始...\n")

    results = {}
    for game in GAMES:
        game_path = os.path.join('D:\\claudeCode\\cmj', game, 'index.html')

        if not os.path.exists(game_path):
            print(f"[X] {game}: 文件不存在")
            continue

        status = check_game_status(game_path)
        results[game] = status

        touch_status = "[OK]" if status['has_touch'] else "[--]"
        back_status = "[OK]" if status['has_back'] else "[--]"

        print(f"[+] {game}:")
        print(f"    触摸控制: {touch_status}")
        print(f"    返回按钮: {back_status}")

        if not status['has_touch']:
            add_touch_support_to_snake_like(game_path)

    print("\n检查完成!")
    print("\n统计:")
    print(f"   总游戏数: {len(results)}")
    print(f"   需要触摸支持: {sum(1 for r in results.values() if not r['has_touch'])}")
    print(f"   需要返回按钮: {sum(1 for r in results.values() if not r['has_back'])}")

if __name__ == '__main__':
    main()
