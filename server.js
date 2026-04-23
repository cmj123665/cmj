/**
 * 游戏大厅后端服务器
 * 功能：用户注册登录、短信验证码发送
 *
 * 使用前请配置：
 * 1. 安装依赖：npm install express cors body-parser axios dotenv
 * 2. 创建 .env 文件配置短信服务API
 * 3. 运行：node server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 存储验证码（生产环境应使用Redis）
const verificationCodes = new Map();

// ========== 短信服务配置 ==========

// 阿里云短信服务配置
const ALIYUN_SMS = {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    signName: process.env.ALIYUN_SIGN_NAME,
    templateCode: process.env.ALIYUN_TEMPLATE_CODE
};

// 腾讯云短信服务配置
const TENCENT_SMS = {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    sdkAppId: process.env.TENCENT_SDK_APP_ID,
    signName: process.env.TENCENT_SIGN_NAME,
    templateId: process.env.TENCENT_TEMPLATE_ID
};

// 容联云短信配置
const CLOOPEN_SMS = {
    accountSid: process.env.CLOOPEN_ACCOUNT_SID,
    accountToken: process.env.CLOOPEN_ACCOUNT_TOKEN,
    appId: process.env.CLOOPEN_APP_ID,
    templateId: process.env.CLOOPEN_TEMPLATE_ID
};

// 当前使用的短信服务 (aliyun, tencent, cloopen)
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'aliyun';

// ========== 短信发送函数 ==========

/**
 * 生成5位随机验证码
 */
function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * 发送阿里云短信
 */
async function sendAliyunSMS(phone, code) {
    // 阿里云SDK需要安装 @alicloud/dysmsapi20170525
    // 这里使用HTTP API方式调用
    const url = 'https://dysmsapi.aliyuncs.com/';

    const params = {
        PhoneNumbers: phone,
        SignName: ALIYUN_SMS.signName,
        TemplateCode: ALIYUN_SMS.templateCode,
        TemplateParam: JSON.stringify({ code: code })
    };

    try {
        // 需要签名计算，这里使用SDK方式更简单
        // 建议安装: npm install @alicloud/dysmsapi20170525
        const Dysmsapi = require('@alicloud/dysmsapi20170525');
        const OpenApi = require('@alicloud/openapi-client');

        const config = new OpenApi.Config({
            accessKeyId: ALIYUN_SMS.accessKeyId,
            accessKeySecret: ALIYUN_SMS.accessKeySecret,
            endpoint: 'dysmsapi.aliyuncs.com'
        });

        const client = new Dysmsapi.default(config);
        const request = new Dysmsapi.SendSmsRequest({
            phoneNumbers: phone,
            signName: ALIYUN_SMS.signName,
            templateCode: ALIYUN_SMS.templateCode,
            templateParam: JSON.stringify({ code: code })
        });

        const response = await client.sendSms(request);
        return response;
    } catch (error) {
        console.error('阿里云短信发送失败:', error);
        throw error;
    }
}

/**
 * 发送腾讯云短信
 */
async function sendTencentSMS(phone, code) {
    const url = `https://sms.tencentcloudapi.com/`;

    const params = {
        PhoneNumberSet: [`+86${phone}`],
        SmsSdkAppId: TENCENT_SMS.sdkAppId,
        SignName: TENCENT_SMS.signName,
        TemplateId: TENCENT_SMS.templateId,
        TemplateParamSet: [code]
    };

    try {
        // 需要安装腾讯云SDK: npm install tencentcloud-sdk-nodejs
        const tencentcloud = require('tencentcloud-sdk-nodejs');
        const SmsClient = tencentcloud.sms.v20210111.Client;

        const clientConfig = {
            credential: {
                secretId: TENCENT_SMS.secretId,
                secretKey: TENCENT_SMS.secretKey
            },
            region: 'ap-guangzhou',
            profile: {
                httpProfile: {
                    endpoint: 'sms.tencentcloudapi.com'
                }
            }
        };

        const client = new SmsClient(clientConfig);
        const response = await client.SendSms(params);

        return response;
    } catch (error) {
        console.error('腾讯云短信发送失败:', error);
        throw error;
    }
}

/**
 * 发送容联云短信
 */
async function sendCloopenSMS(phone, code) {
    const url = `https://app.cloopen.com:8883/2013-12-26/Accounts/${CLOOPEN_SMS.accountSid}/SMS/TemplateSMS?sig=${calculateSig()}`;

    const params = {
        to: phone,
        appId: CLOOPEN_SMS.appId,
        templateId: CLOOPEN_SMS.templateId,
        datas: [code, '5'] // code, 有效期（分钟）
    };

    try {
        const response = await axios.post(url, params, {
            auth: {
                username: CLOOPEN_SMS.accountSid,
                password: CLOOPEN_SMS.accountToken
            }
        });
        return response.data;
    } catch (error) {
        console.error('容联云短信发送失败:', error);
        throw error;
    }
}

/**
 * 计算容联云签名
 */
function calculateSig() {
    const crypto = require('crypto');
    const timestamp = Date.now();
    const sig = crypto
        .createHash('md5')
        .update(CLOOPEN_SMS.accountSid + CLOOPEN_SMS.accountToken + timestamp)
        .digest('hex');
    return sig;
}

/**
 * 统一短信发送接口
 */
async function sendSMS(phone, code) {
    switch (SMS_PROVIDER) {
        case 'aliyun':
            return await sendAliyunSMS(phone, code);
        case 'tencent':
            return await sendTencentSMS(phone, code);
        case 'cloopen':
            return await sendCloopenSMS(phone, code);
        default:
            throw new Error('未配置短信服务提供商');
    }
}

// ========== API 路由 ==========

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '游戏大厅服务器运行中' });
});

/**
 * 发送验证码
 * POST /api/send-code
 * Body: { phone: "手机号" }
 */
app.post('/api/send-code', async (req, res) => {
    const { phone } = req.body;

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
        return res.json({
            success: false,
            message: `请${remaining}秒后再试`,
            remaining: remaining
        });
    }

    try {
        // 生成5位验证码
        const code = generateCode();

        // 发送短信
        await sendSMS(phone, code);

        // 存储验证码（5分钟有效）
        verificationCodes.set(phone, {
            code: code,
            timestamp: Date.now()
        });

        // 清理过期验证码
        setTimeout(() => {
            const stored = verificationCodes.get(phone);
            if (stored && Date.now() - stored.timestamp >= 300000) {
                verificationCodes.delete(phone);
            }
        }, 300000);

        res.json({
            success: true,
            message: '验证码已发送',
            // 开发环境返回验证码用于测试
            code: process.env.NODE_ENV === 'development' ? code : undefined
        });

    } catch (error) {
        console.error('发送验证码失败:', error);
        res.json({
            success: false,
            message: '发送失败，请稍后重试'
        });
    }
});

/**
 * 验证验证码
 * POST /api/verify-code
 * Body: { phone: "手机号", code: "验证码" }
 */
app.post('/api/verify-code', (req, res) => {
    const { phone, code } = req.body;

    const stored = verificationCodes.get(phone);

    if (!stored) {
        return res.json({
            success: false,
            message: '验证码不存在或已过期'
        });
    }

    // 检查验证码是否过期（5分钟）
    if (Date.now() - stored.timestamp > 300000) {
        verificationCodes.delete(phone);
        return res.json({
            success: false,
            message: '验证码已过期，请重新获取'
        });
    }

    // 验证码正确
    if (stored.code === code) {
        // 验证成功后删除验证码
        verificationCodes.delete(phone);
        res.json({
            success: true,
            message: '验证成功'
        });
    } else {
        res.json({
            success: false,
            message: '验证码错误'
        });
    }
});

/**
 * 用户注册/登录
 * POST /api/auth
 * Body: { phone: "手机号", code: "验证码", userName: "昵称", avatar: "头像" }
 */
app.post('/api/auth', (req, res) => {
    const { phone, code, userName, avatar } = req.body;

    // 验证验证码
    const stored = verificationCodes.get(phone);
    if (!stored || stored.code !== code) {
        return res.json({
            success: false,
            message: '验证码错误或已过期'
        });
    }

    // 清除验证码
    verificationCodes.delete(phone);

    // 这里应该连接数据库，简化版使用内存存储
    // 实际项目应该使用 MongoDB/MySQL 等数据库

    res.json({
        success: true,
        message: '登录成功',
        data: {
            phone: phone,
            userName: userName || '玩家',
            avatar: avatar || '🎮',
            token: generateToken(phone) // 生成JWT令牌
        }
    });
});

/**
 * 生成简单的Token（生产环境应使用JWT）
 */
function generateToken(phone) {
    const crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(phone + Date.now() + Math.random())
        .digest('hex');
}

// ========== 启动服务器 ==========

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   游戏大厅后端服务器已启动             ║
║   端口: ${PORT}                          ║
║   短信服务商: ${SMS_PROVIDER}              ║
╚════════════════════════════════════════╝

请确保已配置 .env 文件中的短信服务API密钥

API 端点:
  - GET  /health
  - POST /api/send-code    发送验证码
  - POST /api/verify-code  验证验证码
  - POST /api/auth         用户登录/注册

前端配置:
  修改 index.html 中的 API_BASE_URL 为: http://localhost:${PORT}
    `);
});

module.exports = app;
