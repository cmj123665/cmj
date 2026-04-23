#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理游戏中的残留错误代码
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

def clean_game_code(filepath):
    """清理游戏中的残留错误代码"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    game_dir = os.path.basename(os.path.dirname(filepath))
    original_content = content

    # 移除残留的音效代码片段
    patterns_to_remove = [
        r'// 游戏音效快捷方法\}.*?(?=\n\s*function|\n\s*</script>)',
        r'const GameAudio\s*=\s*\{[^}]*\}?\s*',
        r'// ========== 游戏初始化和音效系统.*?(?=\n\s*(function|</script>))',
        r'if \(typeof window\.Audio[^}]*\}\s*',
        r'window\.Audio\.[^;]+;\s*'
    ]

    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.DOTALL)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {game_dir} - 清理了残留代码")
    else:
        print(f"✓ {game_dir} - 无需清理")

print("开始清理游戏残留代码...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        clean_game_code(filepath)

print("\n✅ 清理完成！")
