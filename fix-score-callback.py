#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复游戏的分数回传功能
从 window.parent.gameFinished 改为使用 sessionStorage
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

# 新的分数回传函数
NEW_SCORE_FUNCTION = '''        // 保存游戏结果到 sessionStorage，供主页读取
        function saveGameResult(score, level, won) {
            const result = {
                score: score || 0,
                level: level || 1,
                won: won || false,
                timestamp: Date.now(),
                gameId: sessionStorage.getItem('currentGame') || 'unknown'
            };
            sessionStorage.setItem('lastGameResult', JSON.stringify(result));
        }

        // 兼容旧的 window.parent.gameFinished 调用（如果主页使用iframe）
        window.gameFinished = function(score, level, won) {
            saveGameResult(score, level, won);
        };

        // 页面卸载前保存结果（如果游戏还在运行中）
        window.addEventListener('beforeunload', function() {
            // 检查是否有未保存的游戏结果
            if (!sessionStorage.getItem('lastGameResult')) {
                const currentScore = document.getElementById('score')?.textContent || '0';
                saveGameResult(parseInt(currentScore), 1, false);
            }
        });'''

def fix_score_callback(filepath):
    """修复分数回传功能"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    game_dir = os.path.basename(os.path.dirname(filepath))

    # 查找并替换 window.parent.gameFinished 调用
    # 模式: if (window.parent && window.parent.gameFinished) { window.parent.gameFinished(...) }

    def replace_parent_call(match):
        indent = match.group(1)
        score_expr = match.group(2)
        level_expr = match.group(3)
        won_expr = match.group(4)

        return f'''{indent}// 保存游戏结果
{indent}saveGameResult({score_expr}, {level_expr}, {won_expr});'''

    # 匹配模式：捕获缩进、score参数、level参数、won参数
    parent_pattern = r'(\s+)if \(window\.parent && window\.parent\.gameFinished\) \{\s+\1window\.parent\.gameFinished\(([^,]+),\s*([^,]+),\s*([^)]+)\);\s+\1\}'

    if re.search(parent_pattern, content):
        # 先检查是否已经有saveGameResult函数
        if 'function saveGameResult' not in content:
            # 在sessionStorage设置后添加新函数
            session_pattern = r"(sessionStorage\.setItem\('currentGame'[^;]+\);)"

            match = re.search(session_pattern, content)
            if match:
                insert_pos = match.end()
                content = content[:insert_pos] + '\n\n' + NEW_SCORE_FUNCTION + content[insert_pos:]
                print(f"✓ {game_dir} - 添加了saveGameResult函数")

        # 替换window.parent.gameFinished调用
        content = re.sub(parent_pattern, replace_parent_call, content)
        print(f"✓ {game_dir} - 替换了window.parent.gameFinished调用")

    # 检查并修复独立的window.gameFinished定义（如2048中的）
    gamefinished_pattern = r'window\.gameFinished\s*=\s*function\([^)]+\)\s*\{[^}]*\}'

    # 如果有window.gameFinished但saveGameResult不存在
    if re.search(gamefinished_pattern, content) and 'function saveGameResult' not in content:
        # 在sessionStorage设置后添加新函数
        session_pattern = r"(sessionStorage\.setItem\('currentGame'[^;]+\);)"

        match = re.search(session_pattern, content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + '\n\n' + NEW_SCORE_FUNCTION + content[insert_pos:]
            print(f"✓ {game_dir} - 添加了saveGameResult函数（独立模式）")

    if content != original_content:
        # 写回文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {game_dir} - 已更新")
    else:
        print(f"✓ {game_dir} - 无需修改")

# 处理所有游戏
print("开始修复游戏分数回传功能...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        fix_score_callback(filepath)

print("\n✅ 完成！所有游戏分数回传功能已修复")
print("\n注意：还需要在主页添加读取sessionStorage的逻辑")
