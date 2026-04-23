#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为缺少游戏逻辑的游戏添加基本代码
"""
import os

def add_runner_game_logic():
    """为跑酷游戏添加基本逻辑"""
    game_js = '''
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        let player = { x: 100, y: 300, width: 40, height: 60, vy: 0, onGround: true };
        let obstacles = [];
        let score = 0;
        let gameRunning = false;
        let gravity = 0.8;
        let jumpForce = -15;
        let gameSpeed = 5;

        function initGame() {
            player = { x: 100, y: 300, width: 40, height: 60, vy: 0, onGround: true };
            obstacles = [];
            score = 0;
            gameRunning = true;
            gameLoop();
        }

        function jump() {
            if (player.onGround) {
                player.vy = jumpForce;
                player.onGround = false;
            }
        }

        function spawnObstacle() {
            if (Math.random() < 0.02) {
                obstacles.push({
                    x: canvas.width,
                    y: 340,
                    width: 30,
                    height: 40
                });
            }
        }

        function update() {
            if (!gameRunning) return;

            // 物理更新
            player.vy += gravity;
            player.y += player.vy;

            if (player.y >= 340) {
                player.y = 340;
                player.vy = 0;
                player.onGround = true;
            }

            // 生成障碍物
            spawnObstacle();

            // 更新障碍物
            obstacles.forEach(obs => obs.x -= gameSpeed);
            obstacles = obstacles.filter(obs => obs.x > -50);

            // 碰撞检测
            obstacles.forEach(obs => {
                if (player.x < obs.x + obs.width &&
                    player.x + player.width > obs.x &&
                    player.y < obs.y + obs.height &&
                    player.y + player.height > obs.y) {
                    gameOver();
                }
            });

            // 更新分数
            score += 0.1;
            document.getElementById('score').textContent = Math.floor(score);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制玩家
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // 绘制障碍物
            ctx.fillStyle = '#4ecdc4';
            obstacles.forEach(obs => {
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            });
        }

        function gameLoop() {
            if (!gameRunning) return;
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }

        function gameOver() {
            gameRunning = false;
            document.getElementById('gameOver').classList.add('show');
            document.getElementById('finalScore').textContent = Math.floor(score);
        }

        function restartGame() {
            initGame();
            document.getElementById('gameOver').classList.remove('show');
        }

        // 控制事件
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        });

        canvas.addEventListener('click', jump);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            jump();
        });

        // 初始化
        initGame();
    '''

    with open('D:\\claudeCode\\cmj\\runner-game\\index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 在</script>标签前添加游戏逻辑
    import re
    pattern = r'(\s*// 智能重启函数.*)'
    replacement = game_js + '\n\n' + r'\1'
    content = re.sub(pattern, replacement, content)

    with open('D:\\claudeCode\\cmj\\runner-game\\index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] 已为跑酷游戏添加游戏逻辑")

def add_tank_game_logic():
    """为坦克游戏添加基本逻辑"""
    game_js = '''
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        let player = { x: 400, y: 500, width: 40, height: 40, speed: 5 };
        let bullets = [];
        let enemies = [];
        let score = 0;
        let gameRunning = false;

        function initGame() {
            player = { x: 400, y: 500, width: 40, height: 40, speed: 5 };
            bullets = [];
            enemies = [];
            score = 0;
            gameRunning = true;
            spawnEnemies();
            gameLoop();
        }

        function spawnEnemies() {
            if (!gameRunning) return;
            if (Math.random() < 0.02) {
                enemies.push({
                    x: Math.random() * 760,
                    y: -30,
                    width: 30,
                    height: 30,
                    speed: 2
                });
            }
            setTimeout(spawnEnemies, 1000);
        }

        function shoot() {
            bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10
            });
        }

        function update() {
            if (!gameRunning) return;

            // 更新子弹
            bullets.forEach(b => b.y -= 10);
            bullets = bullets.filter(b => b.y > -20);

            // 更新敌人
            enemies.forEach(e => e.y += e.speed);
            enemies = enemies.filter(e => e.y < 600);

            // 碰撞检测
            bullets.forEach((b, bi) => {
                enemies.forEach((e, ei) => {
                    if (b.x < e.x + e.width && b.x + b.width > e.x &&
                        b.y < e.y + e.height && b.y + b.height > e.y) {
                        bullets.splice(bi, 1);
                        enemies.splice(ei, 1);
                        score += 10;
                    }
                });
            });

            draw();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制玩家
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // 绘制子弹
            ctx.fillStyle = '#ffe66d';
            bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

            // 绘制敌人
            ctx.fillStyle = '#ff6b6b';
            enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
        }

        function gameLoop() {
            if (!gameRunning) return;
            update();
            requestAnimationFrame(gameLoop);
        }

        function restartGame() {
            initGame();
        }

        // 控制事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && player.x > 0) player.x -= player.speed;
            if (e.key === 'ArrowRight' && player.x < 760) player.x += player.speed;
            if (e.key === ' ') shoot();
        });

        // 初始化
        initGame();
    '''

    # 检查文件是否有canvas元素
    with open('D:\\claudeCode\\cmj\\tank-battle\\index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'canvas' in content:
        # 在</script>前添加游戏逻辑
        import re
        pattern = r'(\s*// 智能重启函数.*)'
        replacement = game_js + '\n\n' + r'\1'
        content = re.sub(pattern, replacement, content)

        with open('D:\\claudeCode\\cmj\\tank-battle\\index.html', 'w', encoding='utf-8') as f:
            f.write(content)

        print("[OK] 已为坦克游戏添加游戏逻辑")
    else:
        print("[X] 坦克游戏没有canvas元素")

def add_tower_game_logic():
    """为塔防游戏添加基本逻辑"""
    print("[!] 塔防游戏需要更复杂的逻辑，暂时跳过")

if __name__ == '__main__':
    print("=== 修复缺失的游戏逻辑 ===\n")

    add_runner_game_logic()
    add_tank_game_logic()
    add_tower_game_logic()

    print("\n=== 修复完成 ===")
    print("\n请测试以下游戏：")
    print("- runner-game (跑酷)")
    print("- tank-battle (坦克)")
    print("\ntower-defense需要额外处理")
