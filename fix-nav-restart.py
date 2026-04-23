#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复游戏导航栏的restartGame函数冲突
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
    'puzzle', 'tower-defense', 'runner-game', 'snake-game', '2048'
]

def fix_nav_restart(filepath):
    """修复导航栏的restart函数"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否有导航栏
    if 'game-nav' not in content:
        print(f"✓ {filepath} 无导航栏，跳过")
        return

    # 检查导航栏的restartGame函数是否存在
    # 查找导航栏脚本中的 restartGame 函数
    nav_restart_pattern = r'function restartGame\(\) \{\s*location\.reload\(\);\s*\}'

    if not re.search(nav_restart_pattern, content):
        print(f"✓ {filepath} 已修复或无需修复")
        return

    # 替换导航栏的restartGame函数为navRestartGame
    content = re.sub(
        nav_restart_pattern,
        '''function navRestartGame() {
    location.reload();
}''',
        content
    )

    # 同时更新导航栏按钮调用
    content = re.sub(
        r'onclick="restartGame\(\)"',
        'onclick="navRestartGame()"',
        content
    )

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    game_dir = os.path.basename(os.path.dirname(filepath))
    print(f"✓ 已修复 {game_dir}")

# 处理所有游戏
print("开始修复游戏导航栏...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        fix_nav_restart(filepath)

print("\n✅ 完成！所有游戏导航栏已修复")
