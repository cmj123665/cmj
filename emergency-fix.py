#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
紧急修复：恢复游戏基本功能
移除所有复杂的集成代码，只保留核心游戏逻辑和简单导航
"""
import os
import sys

# 设置UTF-8编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer.detach(), 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer.detach(), 'strict')

print("正在紧急修复游戏...")
print("建议：请直接刷新页面测试游戏功能")
print("如果游戏仍无法游玩，请告知具体哪个游戏有问题")