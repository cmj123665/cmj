#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为所有游戏添加音效系统
"""
import os
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

# 音效集成脚本
AUDIO_INTEGRATION_SCRIPT = '''
        // ========== 音效系统集成 ==========
        // 保存游戏结果到 sessionStorage，供主页读取
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

        // 兼容旧的 window.parent.gameFinished 调用
        window.gameFinished = function(score, level, won) {
            saveGameResult(score, level, won);
        };

        // 页面卸载前保存结果
        window.addEventListener('beforeunload', function() {
            if (!sessionStorage.getItem('lastGameResult')) {
                const scoreEl = document.getElementById('score');
                const currentScore = scoreEl ? scoreEl.textContent : '0';
                saveGameResult(parseInt(currentScore), 1, false);
            }
        });

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

def add_audio_to_game(filepath):
    """为游戏添加音效系统集成"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    game_dir = os.path.basename(os.path.dirname(filepath))

    # 检查是否已经有音效集成
    if 'GameAudio' in content or '音效系统集成' in content:
        print(f"✓ {game_dir} 已有音效系统，跳过")
        return

    # 检查是否有 sessionStorage 设置
    if 'sessionStorage.setItem' in content:
        # 在 sessionStorage 设置后添加音效集成
        import re
        session_pattern = r"(sessionStorage\.setItem\('currentGame'[^;]+\);)"

        match = re.search(session_pattern, content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + '\n\n' + AUDIO_INTEGRATION_SCRIPT + content[insert_pos:]
            print(f"✓ {game_dir} - 添加音效集成")
        else:
            print(f"✗ {game_dir} - 未找到sessionStorage设置位置")
            return
    else:
        print(f"✗ {game_dir} - 没有sessionStorage设置，跳过")
        return

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ {game_dir} - 已更新")

# 处理所有游戏
print("开始为游戏添加音效系统...\n")

for game_dir in GAME_DIRS:
    filepath = os.path.join(game_dir, 'index.html')
    if os.path.exists(filepath):
        add_audio_to_game(filepath)

print("\n✅ 完成！所有游戏已添加音效系统")
print("\n注意：游戏需要在主页打开才能使用音效系统")
print("游戏现在可以使用 GameAudio.playClick() 等快捷方法播放音效")
