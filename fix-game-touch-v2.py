#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为游戏添加触摸控制函数
处理虚拟按钮的JavaScript逻辑
"""
import os
import re

def fix_breakout_controls():
    """修复breakout游戏的控制"""
    path = 'D:\\claudeCode\\cmj\\breakout\\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有moveDirection函数
    if 'function moveDirection' in content:
        print("breakout: 已有moveDirection函数")
        return

    print("breakout: 需要添加moveDirection函数")

def fix_pong_controls():
    """修复pong游戏的控制"""
    path = 'D:\\claudeCode\\cmj\\pong-game\\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查虚拟按钮
    if 'd-pad' in content and 'moveDirection' not in content:
        print("pong-game: 需要添加moveDirection函数")
        # 这里可以添加自动修复代码
    else:
        print("pong-game: 已有触摸支持或不需要虚拟按钮")

def fix_memory_game():
    """修复memory游戏的控制"""
    path = 'D:\\claudeCode\\cmj\\memory\\index.html'
    if not os.path.exists(path):
        print("memory: 文件不存在")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否有点击翻转功能
    if 'addEventListener.*click' in content or 'onclick' in content:
        print("memory: 已有点击控制")
    else:
        print("memory: 需要添加点击控制")

def check_all_games():
    """检查所有游戏的状态"""
    games = [
        'runner-game', 'pong-game', 'breakout', 'tile-game',
        'memory', 'minesweeper', 'gomoku', 'whack-a-mole',
        'tank-battle', 'puzzle', 'tower-defense'
    ]

    print("检查所有游戏的触摸支持状态...\n")

    for game in games:
        path = f'D:\\claudeCode\\cmj\\{game}\\index.html'
        if not os.path.exists(path):
            print(f"{game}: 文件不存在")
            continue

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        has_virtual_buttons = 'd-pad' in content or 'game-controls' in content
        has_touch_events = 'addEventListener.*touch' in content or 'ontouchstart' in content
        has_click_controls = 'onclick' in content or 'addEventListener.*click' in content

        status = []
        if has_touch_events:
            status.append("触摸事件")
        if has_click_controls:
            status.append("点击控制")
        if has_virtual_buttons:
            status.append("虚拟按钮")

        if status:
            print(f"{game}: {', '.join(status)}")
        else:
            print(f"{game}: 需要添加触摸控制")

if __name__ == '__main__':
    check_all_games()
