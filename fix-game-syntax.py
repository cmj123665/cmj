#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复游戏saveGameResult函数的语法错误
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

def fix_saveGameResult(filepath):
    """修复saveGameResult函数"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    game_dir = os.path.basename(os.path.dirname(filepath))
    original_content = content

    # 查找并修复错误的saveGameResult函数
    # 错误模式：sessionStorage.setItem直接跟在gameId后面，缺少闭合大括号
    wrong_pattern = r'gameId: sessionStorage\.getItem\(\'currentGame\'\) \|\| \'unknown\'\;\s+sessionStorage\.setItem'

    correct_pattern = '''gameId: sessionStorage.getItem('currentGame') || 'unknown'
            };
            sessionStorage.setItem'''

    if wrong_pattern in content or 'gameId: sessionStorage.getItem' in content:
        # 修复模式
        content = re.sub(
            r'gameId: sessionStorage\.getItem\(\'currentGame\'\) \|\| \'unknown\';\s+sessionStorage\.setItem',
            correct_pattern,
            content
        )
        print(f"✓ {game_dir} - 修复了saveGameResult函数")

    # 另一个可能的错误模式：没有正确闭合result对象
    content = re.sub(
        r'gameId: sessionStorage\.getItem\([\'"]currentGame[\'"]\) \|\| [\'"]unknown[\'"];\s+sessionStorage\.setItem\([\'"]lastGameResult',
        '''gameId: sessionStorage.getItem('currentGame') || 'unknown'
            };
            sessionStorage.setItem('lastGameResult''',
        content
    )

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {game_dir} - 已更新文件")
    else:
        print(f"✓ {game_dir} - 无需修复")

print("开始修复游戏语法错误...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        fix_saveGameResult(filepath)

print("\n✅ 修复完成！")
