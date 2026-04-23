#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整的游戏修复工具
解决重复游戏和游戏无法运行的问题
"""
import os
import re

def fix_backtohall_function():
    """修复所有游戏的backToHall函数"""
    games_dir = 'D:\\claudeCode\\cmj'
    games = [
        '2048', 'breakout', 'gomoku', 'memory', 'tile-game',
        'minesweeper', 'whack-a-mole', 'tank-battle', 'puzzle',
        'tower-defense', 'runner-game', 'space-shooter', 'pong-game'
    ]

    fixed_count = 0

    for game in games:
        game_path = os.path.join(games_dir, game, 'index.html')
        if not os.path.exists(game_path):
            print(f"{game}: 文件不存在")
            continue

        with open(game_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查backToHall函数是否有语法错误
        # 查找backToHall函数定义
        pattern = r'function backToHall\(\)\s*\{[^}]*\}'
        matches = list(re.finditer(pattern, content, re.DOTALL))

        if not matches:
            print(f"{game}: 没有找到backToHall函数")
            continue

        # 检查函数是否完整
        for match in matches:
            func_content = match.group()
            # 检查是否有不完整的if-else结构
            if 'if (window.parent)' in func_content and 'else' not in func_content:
                print(f"{game}: backToHall函数不完整，需要修复")
                # 修复函数
                new_func = '''function backToHall() {
            if (window.parent) {
                window.parent.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }'''

                content = content.replace(match.group(), new_func)

                with open(game_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                fixed_count += 1
                print(f"  [OK] 已修复")
                break
        else:
            print(f"{game}: backToHall函数正常")

    print(f"\n共修复了 {fixed_count} 个游戏的backToHall函数")

def create_clear_storage_script():
    """创建清除localStorage的HTML文件"""
    html_content = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>清除重复游戏</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 10px;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button.danger {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 游戏修复工具</h1>

        <div class="info">
            <p><strong>问题诊断：</strong></p>
            <ul>
                <li>主页显示重复游戏</li>
                <li>部分游戏无法返回主页</li>
            </ul>
        </div>

        <div id="result" class="success"></div>

        <button onclick="clearDuplicateGames()">
            🗑️ 清除重复游戏
        </button>

        <button onclick="clearAllCache()" class="danger">
            ⚠️ 清除所有缓存
        </button>

        <button onclick="goToHome()">
            🏠 返回主页
        </button>
    </div>

    <script>
        function clearDuplicateGames() {
            // 清除自定义游戏
            const customGames = JSON.parse(localStorage.getItem('customGames')) || [];
            const count = customGames.length;

            localStorage.removeItem('customGames');

            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `✅ 已清除 <strong>${count}</strong> 个重复游戏！`;
        }

        function clearAllCache() {
            if (confirm('确定要清除所有缓存吗？这将删除游戏进度和设置。')) {
                // 保存用户数据
                const userData = localStorage.getItem('userData');
                const playerData = localStorage.getItem('playerData');

                localStorage.clear();

                // 恢复用户数据
                if (userData) localStorage.setItem('userData', userData);
                if (playerData) localStorage.setItem('playerData', playerData);

                const resultDiv = document.getElementById('result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '✅ 已清除所有缓存！游戏将恢复正常。';
            }
        }

        function goToHome() {
            window.location.href = 'index.html';
        }

        // 自动检查
        window.addEventListener('DOMContentLoaded', () => {
            const customGames = JSON.parse(localStorage.getItem('customGames')) || [];
            if (customGames.length > 0) {
                const resultDiv = document.getElementById('result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `⚠️ 发现 <strong>${customGames.length}</strong> 个重复游戏，建议清除！`;
            }
        });
    </script>
</body>
</html>'''

    with open('D:\\claudeCode\\cmj\\clear-games.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("已创建清除工具: clear-games.html")

def check_game_duplicates():
    """检查游戏文件是否重复"""
    games_dir = 'D:\\claudeCode\\cmj'

    # 检查是否有重复的游戏目录
    game_dirs = []
    for item in os.listdir(games_dir):
        item_path = os.path.join(games_dir, item)
        if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path, 'index.html')):
            game_dirs.append(item)

    print(f"发现 {len(game_dirs)} 个游戏目录:")
    for game in sorted(game_dirs):
        print(f"  - {game}")

    # 检查是否有snake.html等单独文件
    game_files = []
    for item in os.listdir(games_dir):
        if item.endswith('.html') and item != 'index.html':
            game_files.append(item)

    if game_files:
        print(f"\n发现 {len(game_files)} 个单独的游戏HTML文件:")
        for game in sorted(game_files):
            print(f"  - {game}")

if __name__ == '__main__':
    print("=== 游戏修复工具 ===\n")

    print("1. 修复backToHall函数...")
    fix_backtohall_function()

    print("\n2. 创建清除工具...")
    create_clear_storage_script()

    print("\n3. 检查游戏文件...")
    check_game_duplicates()

    print("\n=== 修复完成 ===")
    print("\n请按以下步骤操作:")
    print("1. 在浏览器中打开: clear-games.html")
    print("2. 点击'清除重复游戏'按钮")
    print("3. 点击'返回主页'")
    print("4. 测试游戏是否正常")
