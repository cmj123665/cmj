/**
 * 游戏大厅后端服务器 - 开发测试版
 * 验证码会显示在服务器控制台，无需配置短信服务
 *
 * 运行：node server-dev.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 存储验证码
const verificationCodes = new Map();

// 生成5位随机验证码
function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '游戏大厅服务器运行中（开发模式）' });
});

/**
 * 发送验证码 - 开发版
 * 验证码会显示在服务器控制台
 */
app.post('/api/send-code', (req, res) => {
    const { phone } = req.body;

    console.log('\n========== 短信验证码 ==========');
    console.log(`手机号: ${phone}`);
    console.log(`验证码: ${generateCode()}`);

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.json({
            success: false,
            message: '手机号格式不正确'
        });
    }

    // 检查发送频率（60秒内只能发送一次）
    const lastSent = verificationCodes.get(phone)?.timestamp;
    if (lastSent && Date.now() - lastSent < 60000) {
        const remaining = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
        console.log(`发送频率限制: 请等待${remaining}秒`);
        console.log('================================\n');
        return res.json({
            success: false,
            message: `请${remaining}秒后再试`,
            remaining: remaining
        });
    }

    // 生成5位验证码
    const code = generateCode();

    // 存储验证码（5分钟有效）
    verificationCodes.set(phone, {
        code: code,
        timestamp: Date.now()
    });

    console.log(`有效期: 5分钟`);
    console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('================================\n');

    // 自动清理过期验证码
    setTimeout(() => {
        const stored = verificationCodes.get(phone);
        if (stored && Date.now() - stored.timestamp >= 300000) {
            console.log(`验证码已过期: ${phone}`);
            verificationCodes.delete(phone);
        }
    }, 300000);

    res.json({
        success: true,
        message: '验证码已发送',
        code: code  // 开发模式返回验证码
    });
});

/**
 * 验证验证码
 */
app.post('/api/verify-code', (req, res) => {
    const { phone, code } = req.body;

    console.log(`\n验证验证码 - 手机: ${phone}, 验证码: ${code}`);

    const stored = verificationCodes.get(phone);

    if (!stored) {
        console.log('❌ 验证码不存在或已过期');
        return res.json({
            success: false,
            message: '验证码不存在或已过期'
        });
    }

    // 检查验证码是否过期（5分钟）
    if (Date.now() - stored.timestamp > 300000) {
        console.log('❌ 验证码已过期');
        verificationCodes.delete(phone);
        return res.json({
            success: false,
            message: '验证码已过期，请重新获取'
        });
    }

    // 验证码正确
    if (stored.code === code) {
        console.log('✅ 验证码正确');
        verificationCodes.delete(phone);
        res.json({
            success: true,
            message: '验证成功'
        });
    } else {
        console.log(`❌ 验证码错误 (正确: ${stored.code}, 输入: ${code})`);
        res.json({
            success: false,
            message: '验证码错误'
        });
    }
});

/**
 * 用户注册/登录
 */
app.post('/api/auth', (req, res) => {
    const { phone, code, userName, avatar } = req.body;

    console.log(`\n用户登录 - 手机: ${phone}, 昵称: ${userName}`);

    // 验证验证码
    const stored = verificationCodes.get(phone);
    if (!stored || stored.code !== code) {
        console.log('❌ 登录失败: 验证码错误');
        return res.json({
            success: false,
            message: '验证码错误或已过期'
        });
    }

    // 清除验证码
    verificationCodes.delete(phone);

    // 生成Token
    const token = Buffer.from(`${phone}_${Date.now()}_${Math.random()}`).toString('base64');

    console.log('✅ 登录成功');

    res.json({
        success: true,
        message: '登录成功',
        data: {
            phone: phone,
            userName: userName || '玩家',
            avatar: avatar || '🎮',
            token: token
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                    ║
║       🎮 游戏大厅后端服务器 - 开发模式 🎮            ║
║                                                    ║
║   ✓ 服务器已启动                                  ║
║   ✓ 端口: ${PORT}                                       ║
║   ✓ 模式: 开发测试（无需短信服务）                 ║
║                                                    ║
║   📱 验证码将显示在下方控制台                      ║
║                                                    ║
╚══════════════════════════════════════════════════════╝

    `);

    console.log('API 端点:');
    console.log(`  - POST  http://localhost:${PORT}/api/send-code    发送验证码`);
    console.log(`  - POST  http://localhost:${PORT}/api/verify-code  验证验证码`);
    console.log(`  - POST  http://localhost:${PORT}/api/auth         用户登录`);
    console.log('');
    console.log('当前正在运行，等待请求...\n');
});

module.exports = app;
