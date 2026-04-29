/**
 * 游戏大厅后端服务器 - 开发测试版
 * 支持：验证码、用户注册登录、好友系统、聊天消息
 *
 * 运行：node server-dev.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// ========== 数据持久化 ==========

const db = {
    users: {},
    friendRequests: [],
    messages: []
};

let nextRequestId = 1;
let nextMessageId = 1;

function loadDb() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            db.users = data.users || {};
            db.friendRequests = data.friendRequests || [];
            db.messages = data.messages || [];
            nextRequestId = (db.friendRequests.length > 0 ? Math.max(...db.friendRequests.map(r => r.id || 0)) : 0) + 1;
            nextMessageId = (db.messages.length > 0 ? Math.max(...db.messages.map(m => m.id || 0)) : 0) + 1;
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
}

function saveDb() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

loadDb();

// ========== 验证码 ==========

const verificationCodes = new Map();

function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '游戏大厅服务器运行中（开发模式）' });
});

/**
 * 发送验证码 - 开发版
 */
app.post('/api/send-code', (req, res) => {
    const { phone } = req.body;

    if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.json({ success: false, message: '手机号格式不正确' });
    }

    const lastSent = verificationCodes.get(phone)?.timestamp;
    if (lastSent && Date.now() - lastSent < 60000) {
        const remaining = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
        console.log('\n========== 短信验证码 ==========');
        console.log(`手机号: ${phone}`);
        console.log(`发送频率限制: 请等待${remaining}秒`);
        console.log('================================\n');
        return res.json({ success: false, message: `请${remaining}秒后再试`, remaining });
    }

    const code = generateCode();

    console.log('\n========== 短信验证码 ==========');
    console.log(`手机号: ${phone}`);
    console.log(`验证码: ${code}`);
    console.log(`有效期: 5分钟`);
    console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('================================\n');

    verificationCodes.set(phone, { code, timestamp: Date.now() });

    setTimeout(() => {
        const stored = verificationCodes.get(phone);
        if (stored && Date.now() - stored.timestamp >= 300000) {
            console.log(`验证码已过期: ${phone}`);
            verificationCodes.delete(phone);
        }
    }, 300000);

    res.json({ success: true, message: '验证码已发送', code });
});

/**
 * 验证验证码
 */
app.post('/api/verify-code', (req, res) => {
    const { phone, code } = req.body;
    const stored = verificationCodes.get(phone);

    if (!stored) {
        return res.json({ success: false, message: '验证码不存在或已过期' });
    }

    if (Date.now() - stored.timestamp > 300000) {
        verificationCodes.delete(phone);
        return res.json({ success: false, message: '验证码已过期，请重新获取' });
    }

    if (stored.code === code) {
        verificationCodes.delete(phone);
        res.json({ success: true, message: '验证成功' });
    } else {
        res.json({ success: false, message: '验证码错误' });
    }
});

/**
 * 用户注册/登录
 */
app.post('/api/auth', (req, res) => {
    const { phone, code, userName, avatar, avatarImage } = req.body;

    const stored = verificationCodes.get(phone);
    if (!stored || stored.code !== code) {
        return res.json({ success: false, message: '验证码错误或已过期' });
    }

    verificationCodes.delete(phone);

    // 保存/更新用户信息
    if (!db.users[phone]) {
        db.users[phone] = {
            phone,
            userName: userName || '玩家',
            avatar: avatar || '🎮',
            avatarImage: avatarImage || null,
            createdAt: Date.now()
        };
    } else if (userName) {
        // 注册时更新信息
        db.users[phone].userName = userName;
        db.users[phone].avatar = avatar || db.users[phone].avatar;
        if (avatarImage) db.users[phone].avatarImage = avatarImage;
    }

    saveDb();

    const token = Buffer.from(`${phone}_${Date.now()}_${Math.random()}`).toString('base64');

    res.json({
        success: true,
        message: '登录成功',
        data: {
            phone,
            userName: db.users[phone].userName,
            avatar: db.users[phone].avatar,
            avatarImage: db.users[phone].avatarImage,
            token
        }
    });
});

/**
 * 获取/搜索用户列表
 */
app.get('/api/users', (req, res) => {
    const { q } = req.query;
    const currentPhone = req.query.current || '';

    let users = Object.values(db.users).filter(u => u.phone !== currentPhone);

    if (q) {
        const keyword = q.toLowerCase();
        users = users.filter(u =>
            u.phone.includes(keyword) ||
            (u.userName && u.userName.toLowerCase().includes(keyword))
        );
    }

    res.json({
        success: true,
        users: users.map(u => ({
            phone: u.phone,
            userName: u.userName,
            avatar: u.avatar,
            avatarImage: u.avatarImage
        }))
    });
});

/**
 * 发送好友申请
 */
app.post('/api/friend-requests', (req, res) => {
    const { from, to, fromName, fromAvatar } = req.body;

    if (!from || !to) {
        return res.json({ success: false, message: '参数不完整' });
    }

    // 检查是否已有 pending 申请
    const existing = db.friendRequests.find(
        r => r.from === from && r.to === to && r.status === 'pending'
    );
    if (existing) {
        return res.json({ success: false, message: '已发送过好友申请' });
    }

    // 检查是否已经是好友
    const isFriend = db.friendRequests.some(
        r => ((r.from === from && r.to === to) || (r.from === to && r.to === from)) && r.status === 'accepted'
    );
    if (isFriend) {
        return res.json({ success: false, message: '已经是好友了' });
    }

    db.friendRequests.push({
        id: nextRequestId++,
        from,
        to,
        fromName: fromName || '未知用户',
        fromAvatar: fromAvatar || '🎮',
        status: 'pending',
        time: Date.now()
    });

    saveDb();
    res.json({ success: true, message: '申请已发送' });
});

/**
 * 更新用户信息
 */
app.post('/api/users/update', (req, res) => {
    const { phone, userName, avatar, avatarImage } = req.body;

    if (!phone || !db.users[phone]) {
        return res.json({ success: false, message: '用户不存在' });
    }

    if (userName) db.users[phone].userName = userName;
    if (avatar) db.users[phone].avatar = avatar;
    if (avatarImage !== undefined) db.users[phone].avatarImage = avatarImage;

    saveDb();
    res.json({ success: true });
});

/**
 * 获取好友申请列表
 */
app.get('/api/friend-requests', (req, res) => {
    const { to, from } = req.query;
    if (to) {
        const requests = db.friendRequests.filter(r => r.to === to && r.status === 'pending');
        return res.json({ success: true, requests });
    }
    if (from) {
        const requests = db.friendRequests.filter(r => r.from === from && r.status === 'pending');
        return res.json({ success: true, requests });
    }
    return res.json({ success: false, message: '缺少参数' });
});

/**
 * 接受好友申请
 */
app.post('/api/friend-requests/:id/accept', (req, res) => {
    const id = parseInt(req.params.id);
    const request = db.friendRequests.find(r => r.id === id);

    if (!request) {
        return res.json({ success: false, message: '申请不存在' });
    }

    request.status = 'accepted';
    saveDb();
    res.json({ success: true, message: '已通过' });
});

/**
 * 拒绝好友申请
 */
app.post('/api/friend-requests/:id/reject', (req, res) => {
    const id = parseInt(req.params.id);
    const request = db.friendRequests.find(r => r.id === id);

    if (!request) {
        return res.json({ success: false, message: '申请不存在' });
    }

    request.status = 'rejected';
    saveDb();
    res.json({ success: true, message: '已拒绝' });
});

/**
 * 删除好友
 */
app.post('/api/friends/remove', (req, res) => {
    const { userPhone, friendPhone } = req.body;
    if (!userPhone || !friendPhone) {
        return res.json({ success: false, message: '参数不完整' });
    }

    // 移除双方的所有 accepted 记录
    db.friendRequests = db.friendRequests.filter(
        r => !((r.from === userPhone && r.to === friendPhone) || (r.from === friendPhone && r.to === userPhone))
    );
    saveDb();
    res.json({ success: true, message: '已删除好友' });
});

/**
 * 获取好友列表
 */
app.get('/api/friends/:phone', (req, res) => {
    const phone = req.params.phone;
    const friendSet = new Map();

    for (const req of db.friendRequests) {
        if (req.status !== 'accepted') continue;
        if (req.from === phone) {
            if (!friendSet.has(req.to)) {
                const user = db.users[req.to];
                friendSet.set(req.to, {
                    phone: req.to,
                    userName: user?.userName || '未知用户',
                    avatar: user?.avatar || '🎮',
                    avatarImage: user?.avatarImage || null,
                    addedAt: req.time
                });
            }
        } else if (req.to === phone) {
            if (!friendSet.has(req.from)) {
                const user = db.users[req.from];
                friendSet.set(req.from, {
                    phone: req.from,
                    userName: user?.userName || '未知用户',
                    avatar: user?.avatar || '🎮',
                    avatarImage: user?.avatarImage || null,
                    addedAt: req.time
                });
            }
        }
    }

    res.json({ success: true, friends: Array.from(friendSet.values()) });
});

/**
 * 发送聊天消息
 */
app.post('/api/messages', (req, res) => {
    const { from, to, content, time } = req.body;

    if (!from || !to || !content) {
        return res.json({ success: false, message: '参数不完整' });
    }

    db.messages.push({
        id: nextMessageId++,
        from,
        to,
        content,
        time: time || Date.now(),
        read: 0
    });

    // 只保留最近 1000 条消息
    if (db.messages.length > 1000) {
        db.messages = db.messages.slice(-1000);
    }

    saveDb();
    res.json({ success: true, message: '发送成功' });
});

/**
 * 获取聊天消息
 */
app.get('/api/messages', (req, res) => {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
        return res.json({ success: false, message: '缺少参数' });
    }

    const msgs = db.messages.filter(
        m => (m.from === user1 && m.to === user2) || (m.from === user2 && m.to === user1)
    );

    res.json({ success: true, messages: msgs });
});

/**
 * 标记消息为已读
 */
app.post('/api/messages/read', (req, res) => {
    const { to, from } = req.body;

    if (!to || !from) {
        return res.json({ success: false, message: '缺少参数' });
    }

    let changed = false;
    for (const m of db.messages) {
        if (m.to === to && m.from === from && m.read === 0) {
            m.read = 1;
            changed = true;
        }
    }

    if (changed) saveDb();
    res.json({ success: true });
});

/**
 * 获取未读消息数
 */
app.get('/api/messages/all', (req, res) => {
    const { user } = req.query;
    if (!user) {
        return res.json({ success: false, message: '缺少参数' });
    }

    const userMessages = {};
    for (const m of db.messages) {
        if (m.from === user || m.to === user) {
            const other = m.from === user ? m.to : m.from;
            if (!userMessages[other]) {
                userMessages[other] = [];
            }
            userMessages[other].push(m);
        }
    }

    for (const other in userMessages) {
        userMessages[other].sort((a, b) => a.time - b.time);
    }

    res.json({ success: true, messages: userMessages });
});

app.get('/api/messages/unread', (req, res) => {
    const { to } = req.query;
    if (!to) {
        return res.json({ success: false, message: '缺少参数' });
    }

    const count = db.messages.filter(m => m.to === to && m.read === 0).length;
    res.json({ success: true, count });
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
║   💾 数据文件: data.json                           ║
║                                                    ║
╚══════════════════════════════════════════════════════╝

API 端点:
  - POST  /api/send-code              发送验证码
  - POST  /api/verify-code            验证验证码
  - POST  /api/auth                   用户登录/注册
  - GET   /api/users?q=keyword        搜索用户
  - POST  /api/friend-requests        发送好友申请
  - GET   /api/friend-requests?to=    获取好友申请
  - POST  /api/friend-requests/:id/accept  接受申请
  - POST  /api/friend-requests/:id/reject  拒绝申请
  - GET   /api/friends/:phone         获取好友列表
  - POST  /api/messages               发送消息
  - GET   /api/messages?user1=&user2= 获取消息
  - POST  /api/messages/read          标记已读

访问前端: http://localhost:${PORT}/index.html
    `);
});

module.exports = app;
