#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复游戏导航栏 - 正确版本
导航栏的重新开始按钮应该调用游戏自己的restartGame函数
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
    """修复导航栏 - 移除多余的restart函数，让导航按钮调用游戏原有的函数"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    game_dir = os.path.basename(os.path.dirname(filepath))

    # 检查是否有导航栏
    if 'game-nav' not in content:
        print(f"✓ {game_dir} 无导航栏，跳过")
        return

    # 查找导航栏脚本块中的restartGame函数定义
    # 匹配模式：在导航栏的<script>标签中定义的restartGame函数
    nav_restart_pattern = r'(<script>\s*function backToHall\(\)[^}]*\}\s*)(function restartGame\(\) \{\s*location\.reload\(\);\s*\}\s*)(function showHelp)'

    match = re.search(nav_restart_pattern, content, re.DOTALL)

    if match:
        # 移除导航栏的restartGame函数定义
        content = re.sub(nav_restart_pattern, r'\1\3', content, flags=re.DOTALL)
        print(f"✓ {game_dir} - 移除了导航栏的restartGame函数")

    # 检查是否还有navRestartGame函数（如果之前修复过）
    nav_restart_pattern2 = r'function navRestartGame\(\) \{\s*location\.reload\(\);\s*\}'
    if re.search(nav_restart_pattern2, content):
        # 移除navRestartGame函数
        content = re.sub(nav_restart_pattern2, '', content)
        print(f"✓ {game_dir} - 移除了navRestartGame函数")

    # 确保导航栏的重新开始按钮调用的是 restartGame()
    content = re.sub(
        r'<button class="game-nav-btn secondary" onclick="navRestartGame\(\)">',
        '<button class="game-nav-btn secondary" onclick="handleRestart()">',
        content
    )

    # 在导航栏脚本中添加智能重启函数
    # 查找 backToHall 函数并在其后添加
    backToHall_pattern = r'(function backToHall\(\) \{[^}]+\}\s*)'

    def add_smart_restart(match):
        backToHall_code = match.group(1)
        smart_restart = '''// 智能重启函数 - 优先调用游戏的restart函数，不存在则重新加载页面
        function handleRestart() {
            if (typeof restartGame === 'function') {
                restartGame();
            } else if (typeof newGame === 'function') {
                newGame();
            } else if (typeof initGame === 'function') {
                initGame();
            } else {
                location.reload();
            }
        }

        '''
        return backToHall_code + smart_restart

    # 检查是否已有handleRestart函数
    if 'function handleRestart()' not in content:
        content = re.sub(backToHall_pattern, add_smart_restart, content, count=1)
        print(f"✓ {game_dir} - 添加了智能重启函数")

    # 修复游戏结束弹窗的按钮（如果被错误修改了）
    # 查找所有的onclick="navRestartGame()"
    wrong_calls = list(re.finditer(r'onclick="navRestartGame\(\)"', content))

    for wrong_call in reversed(wrong_calls):  # 从后往前处理，避免位置偏移
        # 检查这个按钮是否在导航栏中
        button_start = wrong_call.start()
        # 往前找最近的游戏导航栏开始位置
        nav_start = content.rfind('<div class="game-nav">', 0, button_start)
        nav_end = content.find('</div>', nav_start) if nav_start != -1 else -1

        # 如果这个按钮不在导航栏内，或者game-over弹窗内，则恢复为restartGame()
        in_nav = nav_start != -1 and nav_end != -1 and nav_start <= button_start <= nav_end

        # 检查是否在game-over弹窗内
        gameover_start = content.rfind('<div class="game-over"', 0, button_start)
        gameover_end = content.find('</div>', gameover_start + 100) if gameover_start != -1 else -1
        in_gameover = gameover_start != -1 and gameover_end != -1 and gameover_start <= button_start <= gameover_end

        if in_gameover or not in_nav:
            # 这个按钮应该调用游戏的restartGame函数
            before = content[:wrong_call.start()]
            after = content[wrong_call.end():]
            content = before + 'onclick="restartGame()"' + after
            print(f"✓ {game_dir} - 修复了游戏内按钮")

    if content != original_content:
        # 写回文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {game_dir} - 已更新")
    else:
        print(f"✓ {game_dir} - 无需修改")

# 处理所有游戏
print("开始修复游戏导航栏...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        fix_nav_restart(filepath)

print("\n✅ 完成！所有游戏导航栏已修复")
