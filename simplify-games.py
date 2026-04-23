#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化游戏代码，移除复杂的音效集成
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

def simplify_game_code(filepath):
    """简化游戏代码，移除复杂的音效集成"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    game_dir = os.path.basename(os.path.dirname(filepath))
    original_content = content

    # 移除复杂的 GameAudio 对象
    # 移除音效系统集成的注释和代码块
    patterns_to_remove = [
        r'\n\s*// ========== 游戏初始化和音效系统 ==========.*?(?=\n\s*// 返回大厅|\n\s*function backToHall)',
        r'\n\s*// ========== 音效系统集成 ==========.*?(?=\n\s*// 兼容旧的|\n\s*window\.gameFinished)',
        r'\n\s*const GameAudio\s*=\s*\{[^}]*\};?\s*',
        r'if \(typeof window\.Audio[^}]*\}\s*',
    ]

    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.DOTALL)

    # 简化 saveGameResult 函数，移除音效调用
    def simplify_saveGameResult(match):
        indent = match.group(1)
        rest = match.group(2)
        # 移除音效相关的代码
        simplified = re.sub(
            r'// 播放结果音效.*?(?=\n\s*})',
            '',
            rest,
            flags=re.DOTALL
        )
        return indent + 'function saveGameResult(score, level, won) {\n' + simplified

    # 查找并简化 saveGameResult 函数
    saveGame_pattern = r'(\s*)function saveGameResult\(score, level, won\) \{(.*?)\n\s*\}'

    if re.search(saveGame_pattern, content, re.DOTALL):
        content = re.sub(saveGame_pattern, simplify_saveGameResult, content, flags=re.DOTALL)
        print(f"✓ {game_dir} - 简化了saveGameResult函数")

    if content != original_content:
        # 写回文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {game_dir} - 已简化")
    else:
        print(f"✓ {game_dir} - 无需修改")

# 处理所有游戏
print("开始简化游戏代码...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        simplify_game_code(filepath)

print("\n✅ 完成！所有游戏代码已简化")
print("移除了复杂的音效集成，保留基本功能")
