#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查和修复所有游戏的JavaScript语法错误
"""
import os
import re

def check_game_syntax(game_path):
    """检查游戏的JavaScript语法"""
    try:
        with open(game_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查常见的语法错误
        errors = []

        # 检查重复的else语句
        else_count = len(re.findall(r'}\s*else\s*{', content))
        if_count = len(re.findall(r'if\s*\(', content))

        if else_count > if_count:
            errors.append(f"可能的语法错误：else语句({else_count})比if语句({if_count})多")

        # 检查重复的函数定义
        initgame_count = len(re.findall(r'function\s+initGame\s*\(', content))
        if initgame_count > 1:
            errors.append(f"重复的initGame函数定义：{initgame_count}次")

        # 检查重复的init调用
        init_call_count = len(re.findall(r'init\(\s*\)', content))
        if init_call_count > 2:
            errors.append(f"多次init调用：{init_call_count}次")

        # 检查是否有canvas定义
        has_canvas = 'canvas' in content.lower()
        has_getcontext = 'getContext' in content

        if not has_canvas and not has_getcontext:
            errors.append("缺少canvas元素定义")

        return errors

    except Exception as e:
        return [f"文件读取错误：{str(e)}"]

def fix_game_syntax(game_path):
    """修复游戏的语法错误"""
    try:
        with open(game_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 修复重复的else语句在backToHall函数中
        pattern = r'function\s+backToHall\(\)\s*\{[^}]*\}\s*else\s*\{[^}]*\}\s*else\s*\{[^}]*\}'
        replacement = r'''function backToHall() {
            if (window.parent) {
                window.parent.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }'''

        content = re.sub(pattern, replacement, content)

        # 修复重复的init调用
        lines = content.split('\n')
        seen_init = set()
        cleaned_lines = []

        for i, line in enumerate(lines):
            # 如果是init()调用行
            if re.search(r'init\(\s*\)\s*;', line) and i > len(lines) - 10:
                if 'seen_init' not in locals():
                    seen_init = set()
                key = f'init_{i}'
                if key not in seen_init:
                    seen_init.add(key)
                    cleaned_lines.append(line)
            else:
                cleaned_lines.append(line)

        content = '\n'.join(cleaned_lines)

        if content != original_content:
            with open(game_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"修复错误：{str(e)}")
        return False

def main():
    print("=== 游戏语法检查和修复工具 ===\n")

    games = [
        ('2048', '2048/index.html'),
        ('tetris', 'tetris/index.html'),
        ('breakout', 'breakout/index.html'),
        ('runner-game', 'runner-game/index.html'),
        ('tank-battle', 'tank-battle/index.html'),
        ('tower-defense', 'tower-defense/index.html'),
        ('memory', 'memory/index.html'),
        ('pong-game', 'pong-game/index.html')
    ]

    total_errors = 0
    fixed_games = []

    for game_name, game_path in games:
        full_path = os.path.join('D:\\claudeCode\\cmj', game_path)

        if not os.path.exists(full_path):
            print(f"{game_name}: 文件不存在")
            continue

        print(f"检查 {game_name}...")
        errors = check_game_syntax(full_path)

        if errors:
            print(f"  发现 {len(errors)} 个问题:")
            for error in errors:
                print(f"    - {error}")
            total_errors += len(errors)

            # 尝试修复
            if fix_game_syntax(full_path):
                print(f"  已修复")
                fixed_games.append(game_name)
            else:
                print(f"  修复失败")
        else:
            print(f"  ✓ 语法正确")

    print(f"\n=== 总结 ===")
    print(f"发现 {total_errors} 个问题")
    print(f"修复了 {len(fixed_games)} 个游戏")
    print(f"已修复的游戏: {', '.join(fixed_games)}")

if __name__ == '__main__':
    main()
