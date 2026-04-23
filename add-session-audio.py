#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为缺少sessionStorage的游戏添加初始化和音效系统
"""
import os
import re
import sys

# 设置UTF-8编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer.detach(), 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer.detach(), 'strict')

# 需要添加sessionStorage的游戏
NEED_SESSION_GAMES = ['tetris', 'space-shooter', 'tile-game', 'tank-battle', 'tower-defense', 'runner-game', 'snake-game']

# 完整的sessionStorage和音效集成代码
FULL_INTEGRATION_CODE = '''
        // ========== 游戏初始化和音效系统 ==========
        // 设置游戏会话信息
        sessionStorage.setItem('gameStartTime', Date.now());
        sessionStorage.setItem('currentGame', 'GAME_NAME');

        // 音效系统集成
        function saveGameResult(score, level, won) {
            const result = {
                score: score || 0,
                level: level || 1,
                won: won || false,
                timestamp: Date.now(),
                gameId: sessionStorage.getItem('currentGame') || 'unknown'
            };
            sessionStorage.setItem('lastGameResult', JSON.stringify(result));

            // 播放结果音效
            if (typeof window.Audio !== 'undefined') {
                if (won) {
                    window.Audio.playVictory();
                } else if (score > 0) {
                    window.Audio.playSound('score', 0.4);
                } else {
                    window.Audio.playDefeat();
                }
            }
        }

        // 兼容旧的调用方式
        window.gameFinished = function(score, level, won) {
            saveGameResult(score, level, won);
        };

        // 游戏音效快捷方法
        const GameAudio = {
            playClick() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('click', 0.3);
                }
            },
            playScore() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('score', 0.4);
                }
            },
            playJump() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('jump', 0.5);
                }
            },
            playCollect() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('collect', 0.4);
                }
            },
            playExplosion() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('explosion', 0.5);
                }
            },
            playShoot() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('shoot', 0.3);
                }
            },
            playHit() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('hit', 0.4);
                }
            },
            playSuccess() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('success', 0.5);
                }
            },
            playError() {
                if (typeof window.Audio !== 'undefined') {
                    window.Audio.playSound('error', 0.4);
                }
            }
        };
'''

def add_full_integration(filepath, game_name):
    """为游戏添加完整的sessionStorage和音效集成"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    game_dir = os.path.basename(os.path.dirname(filepath))

    # 检查是否已经有集成
    if 'GameAudio' in content or 'sessionStorage.setItem(\'currentGame\'' in content:
        print(f"✓ {game_dir} 已有集成，跳过")
        return

    # 替换游戏名称
    integration_code = FULL_INTEGRATION_CODE.replace('GAME_NAME', game_name)

    # 查找合适的插入位置 - 在游戏初始化代码后
    # 查找script标签的位置
    script_matches = list(re.finditer(r'<script>', content))

    if not script_matches:
        print(f"✗ {game_dir} - 未找到script标签")
        return

    # 在第一个script标签后添加
    insert_pos = script_matches[0].end()

    content = content[:insert_pos] + '\n\n' + integration_code + '\n' + content[insert_pos:]

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ {game_dir} - 添加完整集成")

# 处理需要添加的游戏
print("开始为游戏添加完整集成...\n")

for game_dir in NEED_SESSION_GAMES:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        add_full_integration(filepath, game_dir)
    else:
        print(f"✗ {game_dir} - 文件不存在")

print("\n✅ 完成！所有游戏已添加完整集成")
