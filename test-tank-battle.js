const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
    const chromePath = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1217', 'chrome-win64', 'chrome.exe');

    const browser = await chromium.launch({
        headless: true,
        executablePath: chromePath
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 }
    });
    const page = await context.newPage();

    console.log('1. 打开坦克大战页面...');
    await page.goto('http://127.0.0.1:8080/tank-battle/index.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tank-test-1-start-screen.png', fullPage: true });
    console.log('   已截图：开始界面');

    console.log('2. 点击"开始游戏"按钮...');
    await page.click('#startBtn');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tank-test-2-game-started.png', fullPage: true });
    console.log('   已截图：游戏开始后的画面');

    console.log('3. 模拟玩家操作：WASD移动...');
    await page.keyboard.press('w');
    await page.waitForTimeout(200);
    await page.keyboard.press('w');
    await page.waitForTimeout(200);
    await page.keyboard.press('a');
    await page.waitForTimeout(200);
    await page.keyboard.press('a');
    await page.waitForTimeout(200);
    await page.keyboard.press('s');
    await page.waitForTimeout(200);
    await page.keyboard.press('d');
    await page.waitForTimeout(200);
    await page.keyboard.press('d');
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'tank-test-3-after-move.png', fullPage: true });
    console.log('   已截图：移动后的画面');

    console.log('4. 模拟射击操作（空格键）...');
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press(' ');
        await page.waitForTimeout(300);
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'tank-test-4-after-shoot.png', fullPage: true });
    console.log('   已截图：射击后的画面');

    console.log('5. 等待敌人出现...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tank-test-5-enemies-appear.png', fullPage: true });
    console.log('   已截图：敌人出现后的画面');

    console.log('6. 继续游戏，模拟更多操作...');
    for (let i = 0; i < 10; i++) {
        const moves = ['w', 'a', 's', 'd'];
        const move = moves[Math.floor(Math.random() * moves.length)];
        await page.keyboard.press(move);
        await page.waitForTimeout(150);
        if (Math.random() < 0.4) {
            await page.keyboard.press(' ');
        }
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tank-test-6-gameplay.png', fullPage: true });
    console.log('   已截图：持续游戏画面');

    console.log('\n所有测试截图已保存！');
    console.log('请查看以下文件：');
    console.log('  - tank-test-1-start-screen.png');
    console.log('  - tank-test-2-game-started.png');
    console.log('  - tank-test-3-after-move.png');
    console.log('  - tank-test-4-after-shoot.png');
    console.log('  - tank-test-5-enemies-appear.png');
    console.log('  - tank-test-6-gameplay.png');

    await browser.close();
})();
