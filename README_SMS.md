# 游戏大厅 - 短信验证码配置指南

本系统支持真实手机号验证码登录，支持国内主流短信服务商。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置短信服务

选择以下任一短信服务商，复制 `.env.example` 为 `.env` 并配置：

#### 方式一：阿里云短信（推荐）

1. 访问 [阿里云短信服务](https://dysms.console.aliyun.com/)
2. 开通短信服务并创建签名和模板
3. 获取 AccessKey ID 和 Secret
4. 配置 `.env` 文件：

```env
SMS_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=你的AccessKeyId
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
ALIYUN_SIGN_NAME=你的签名
ALIYUN_TEMPLATE_CODE=SMS_123456789
```

安装阿里云SDK：
```bash
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
```

#### 方式二：腾讯云短信

1. 访问 [腾讯云短信](https://console.cloud.tencent.com/sms)
2. 创建短信应用和签名模板
3. 获取 SecretId 和 SecretKey
4. 配置 `.env` 文件：

```env
SMS_PROVIDER=tencent
TENCENT_SECRET_ID=你的SecretId
TENCENT_SECRET_KEY=你的SecretKey
TENCENT_SDK_APP_ID=你的AppID
TENCENT_SIGN_NAME=你的签名
TENCENT_TEMPLATE_ID=你的模板ID
```

安装腾讯云SDK：
```bash
npm install tencentcloud-sdk-nodejs
```

#### 方式三：容联云通讯

1. 访问 [容联云](https://www.yuntongxun.com/)
2. 注册账号并获取开发者账号信息
3. 配置 `.env` 文件：

```env
SMS_PROVIDER=cloopen
CLOOPEN_ACCOUNT_SID=你的AccountSid
CLOOPEN_ACCOUNT_TOKEN=你的AccountToken
CLOOPEN_APP_ID=你的AppID
CLOOPEN_TEMPLATE_ID=你的模板ID
```

### 3. 启动后端服务器

```bash
node server.js
```

服务器将在 `http://localhost:3000` 启动。

### 4. 测试

访问 `index.html`，尝试：
1. 输入手机号
2. 点击"获取验证码"
3. 等待短信（开发环境会在响应中返回验证码）
4. 输入验证码登录/注册

## API 文档

### POST /api/send-code
发送短信验证码

**请求：**
```json
{
  "phone": "13800138000"
}
```

**响应：**
```json
{
  "success": true,
  "message": "验证码已发送",
  "code": "12345"  // 仅开发环境返回
}
```

### POST /api/verify-code
验证验证码

**请求：**
```json
{
  "phone": "13800138000",
  "code": "12345"
}
```

**响应：**
```json
{
  "success": true,
  "message": "验证成功"
}
```

### POST /api/auth
用户登录/注册

**请求：**
```json
{
  "phone": "13800138000",
  "code": "12345",
  "userName": "玩家昵称",
  "avatar": "🎮"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "phone": "13800138000",
    "userName": "玩家昵称",
    "avatar": "🎮",
    "token": "abc123..."
  }
}
```

## 短信模板配置

### 验证码模板示例

**阿里云模板：**
```
您的验证码是${code}，5分钟内有效，请勿泄露。
```

**腾讯云模板：**
```
您的验证码是{1}，5分钟内有效，请勿泄露。
```

**容联云模板：**
```
您的验证码是{1}，{2}分钟内有效，请勿泄露。
```

## 功能特性

- ✅ 5位随机数字验证码
- ✅ 60秒发送间隔限制
- ✅ 5分钟验证码有效期
- ✅ 手机号格式验证
- ✅ 支持多短信服务商
- ✅ 开发环境返回验证码方便测试
- ✅ CORS跨域支持
- ✅ 错误处理和提示

## 安全提示

1. **生产环境务必：**
   - 使用真实数据库（MongoDB/MySQL）存储用户数据
   - 使用JWT进行身份认证
   - 添加请求频率限制
   - 使用HTTPS协议
   - 不要将 `.env` 文件提交到代码仓库

2. **API密钥安全：**
   - 定期更换API密钥
   - 使用最小权限原则
   - 监控短信发送量和费用

3. **验证码安全：**
   - 限制同一手机号每日发送次数
   - 添加图形验证码防止机器人
   - 记录发送日志便于审计

## 故障排除

### 问题：验证码发送失败
- 检查 `.env` 配置是否正确
- 确认短信服务账户余额充足
- 检查签名和模板是否已通过审核

### 问题：前端无法连接后端
- 确认后端服务器已启动
- 检查 `API_BASE_URL` 配置是否正确
- 查看浏览器控制台是否有CORS错误

### 问题：验证码验证失败
- 确认验证码是否在5分钟有效期内
- 检查验证码是否正确（5位数字）
- 查看后端日志获取详细错误信息

## 生产部署建议

1. 使用 PM2 保持进程运行：
```bash
npm install -g pm2
pm2 start server.js --name game-hall-api
```

2. 配置 Nginx 反向代理

3. 使用域名和SSL证书

4. 配置监控和日志收集

5. 设置定时任务清理过期数据

## 费用参考

| 服务商 | 单条价格 | 免费额度 |
|--------|----------|----------|
| 阿里云 | ¥0.045/条 | 100条/月 |
| 腾讯云 | ¥0.045/条 | 100条/月 |
| 容联云 | ¥0.055/条 | 0 |

*价格仅供参考，请以官方为准

## 技术支持

如有问题，请检查：
1. 服务器日志：`console.log` 输出
2. 浏览器开发者工具：Network 和 Console
3. 短信服务商控制台的发送记录
