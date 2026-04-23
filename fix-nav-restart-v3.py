#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复游戏导航栏 - 正确版本 v3
手动构建智能重启函数，避免正则表达式问题
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

# 导航栏脚本的正确版本
NAV_SCRIPT = '''    <script>
        function backToHall() {
            if (window.parent) {
                window.parent.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }

        // 智能重启函数 - 优先调用游戏的restart函数，不存在则重新加载页面
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

        function showHelp() {
            document.getElementById('helpModal').classList.add('show');
        }

        function closeHelp() {
            document.getElementById('helpModal').classList.remove('show');
        }
    </script>'''

def fix_nav_restart(filepath):
    """修复导航栏 - 完全替换导航栏脚本部分"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    game_dir = os.path.basename(os.path.dirname(filepath))

    # 检查是否有导航栏
    if 'game-nav' not in content:
        print(f"✓ {game_dir} 无导航栏，跳过")
        return

    # 查找导航栏的<script>标签块
    # 从 backToHall 函数开始到 closeHelp 函数结束的整个script块
    nav_script_pattern = r'    <script>\s*function backToHall\(\).*?function closeHelp\(\) \{[^}]*\}\s*</script>'

    if re.search(nav_script_pattern, content, re.DOTALL):
        # 替换整个导航栏脚本
        content = re.sub(nav_script_pattern, NAV_SCRIPT, content, flags=re.DOTALL)
        print(f"✓ {game_dir} - 替换了导航栏脚本")
    else:
        print(f"✓ {game_dir} - 未找到导航栏脚本或已修复")

    # 确保导航栏的重新开始按钮调用handleRestart
    content = re.sub(
        r'<button class="game-nav-btn secondary" onclick="[^"]*">',
        '<button class="game-nav-btn secondary" onclick="handleRestart()">',
        content
    )

    # 修复可能被错误修改的游戏内按钮（不在导航栏中的）
    # 查找所有的 onclick="navRestartGame()"
    wrong_pattern = r'onclick="navRestartGame\(\)"'
    if re.search(wrong_pattern, content):
        # 找到导航栏的范围
        nav_match = re.search(r'<div class="game-nav">(.*?)</div>', content, re.DOTALL)
        nav_content = nav_match.group(0) if nav_match else ''
        nav_start = nav_match.start() if nav_match else 0
        nav_end = nav_match.end() if nav_match else 0

        # 找到所有错误调用并修复
        def fix_wrong_call(match):
            call_start = match.start()
            # 如果不在导航栏内，则改为restartGame()
            if not (nav_start <= call_start <= nav_end):
                return 'onclick="restartGame()"'
            return match.group(0)

        content = re.sub(wrong_pattern, fix_wrong_call, content)
        print(f"✓ {game_dir} - 修复了错误调用")

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
