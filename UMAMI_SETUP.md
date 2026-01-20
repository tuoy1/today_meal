# Umami 配置完整指南

## 🚀 快速开始

### 方式一：使用 Umami 公共实例（最简单）

1. **注册账号**
   - 访问 https://umami.is
   - 点击 "Get Started" 注册账号
   - 验证邮箱

2. **创建网站**
   - 登录后，点击 "Add Website"
   - 填写网站信息：
     - Name: 今天吃什么（或任意名称）
     - Domain: localhost（开发环境）或你的实际域名
   - 点击 "Save"

3. **获取 Website ID**
   - 创建网站后，会显示一个 Website ID（类似：`a1b2c3d4-e5f6-7890-abcd-ef1234567890`）
   - 复制这个 ID

4. **配置应用**
   - 编辑 `.env` 文件：
   ```env
   VITE_ANALYTICS_PROVIDER=umami
   VITE_UMAMI_WEBSITE_ID=你的Website-ID
   VITE_UMAMI_SCRIPT_URL=https://analytics.umami.is/script.js
   ```

5. **重启应用**
   ```bash
   # 停止当前服务器（Ctrl+C）
   pnpm run dev
   ```

### 方式二：自托管 Umami（推荐，完全控制）

#### 使用 Docker 快速部署

1. **创建 docker-compose.yml**
   ```yaml
   version: '3'
   services:
     umami:
       image: ghcr.io/umami-software/umami:postgresql-latest
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://umami:umami@db:5432/umami
         DATABASE_TYPE: postgresql
         APP_SECRET: replace-me-with-a-random-string
       depends_on:
         - db
       restart: always
     db:
       image: postgres:15-alpine
       environment:
         POSTGRES_DATABASE: umami
         POSTGRES_USER: umami
         POSTGRES_PASSWORD: umami
       volumes:
         - umami-db-data:/var/lib/postgresql/data
       restart: always
   volumes:
     umami-db-data:
   ```

2. **启动 Umami**
   ```bash
   docker-compose up -d
   ```

3. **访问并设置**
   - 访问 http://localhost:3000
   - 默认账号：admin / umami
   - 首次登录会要求修改密码

4. **创建网站并获取 ID**
   - 登录后创建网站
   - 获取 Website ID

5. **配置应用**
   ```env
   VITE_ANALYTICS_PROVIDER=umami
   VITE_UMAMI_WEBSITE_ID=你的Website-ID
   VITE_UMAMI_SCRIPT_URL=http://localhost:3000/script.js
   # 或使用你的域名
   # VITE_UMAMI_SCRIPT_URL=https://analytics.yourdomain.com/script.js
   ```

## 📊 查看数据

### 在 Umami 后台查看

1. **登录 Umami**
   - 访问你的 Umami 实例地址
   - 使用账号密码登录

2. **查看实时数据**
   - 选择你的网站
   - 在仪表板查看：
     - 访问量
     - 访客数
     - 页面浏览量
     - 实时访客

3. **查看事件**
   - 点击 "Events" 标签
   - 查看自定义事件：
     - `page_view` - 页面访问
     - `recommendation_view` - 推荐查看
     - `recommendation_refresh` - 推荐刷新

4. **查看 device_id 统计**
   - 在事件详情中，点击事件名称
   - 查看 "Properties" 部分
   - 找到 `device_id` 属性
   - 可以看到：
     - 每个 device_id 的事件数
     - 唯一 device_id 的总数

### 关键指标查看方法

#### 1. 总打开次数
- 查看 `page_view` 事件的总数
- 这就是所有用户的总访问次数

#### 2. 唯一 device_id 数
- 进入 `page_view` 事件详情
- 查看 `device_id` 属性的唯一值数量
- 或者在 SQL 查询中使用：`SELECT COUNT(DISTINCT device_id) FROM events`

#### 3. 不同日期的 device_id 数
- 使用日期筛选
- 按日期分组查看每天的 `device_id` 唯一数
- 可以看到每日活跃设备数

## 🧪 测试配置

### 方法 1：浏览器控制台

1. 打开应用
2. 按 F12 打开开发者工具
3. 查看 Console，应该看到：
   ```
   Umami script loaded
   ```
4. 查看 Network 标签，应该看到向 Umami 发送的请求

### 方法 2：检查 localStorage

在浏览器控制台输入：
```javascript
localStorage.getItem('device_id')
```

应该返回一个 UUID，这就是你的设备 ID。

### 方法 3：查看 Umami 后台

1. 在应用中操作（查看推荐、刷新等）
2. 等待几秒钟
3. 登录 Umami 后台
4. 应该能看到新的事件记录

## ⚙️ 高级配置

### 自定义域名

如果你自托管 Umami，可以配置自定义域名：

1. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name analytics.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

2. **配置 SSL 证书**
   ```bash
   certbot --nginx -d analytics.yourdomain.com
   ```

3. **更新 .env 配置**
   ```env
   VITE_UMAMI_SCRIPT_URL=https://analytics.yourdomain.com/script.js
   ```

## 🔒 隐私和安全

- Umami 是隐私友好的，不收集个人信息
- 所有数据存储在你自己控制的服务器上（如果自托管）
- `device_id` 是本地生成的 UUID，不包含任何个人信息
- 符合 GDPR 要求

## ❓ 常见问题

### Q: 配置后看不到数据？

1. 检查 `.env` 文件中的配置是否正确
2. 确认重启了开发服务器
3. 检查浏览器控制台是否有错误
4. 确认 Umami Website ID 正确
5. 检查 Umami 脚本 URL 是否可访问

### Q: 如何验证 device_id 是否正确上报？

1. 在浏览器控制台输入：`localStorage.getItem('device_id')`
2. 查看返回的 UUID
3. 在 Umami 后台的事件中搜索这个 device_id
4. 应该能看到相关事件

### Q: 数据有延迟吗？

- Umami 通常是实时的，可能有几秒延迟
- 如果长时间看不到数据，检查网络连接和配置

### Q: 可以同时使用多个网站吗？

- 可以，每个网站有独立的 Website ID
- 在 Umami 中创建多个网站，分别配置不同的 ID

## 📝 配置检查清单

- [ ] 已创建 `.env` 文件
- [ ] 已设置 `VITE_ANALYTICS_PROVIDER=umami`
- [ ] 已配置 `VITE_UMAMI_WEBSITE_ID`
- [ ] 已配置 `VITE_UMAMI_SCRIPT_URL`
- [ ] 已重启开发服务器
- [ ] 浏览器控制台无错误
- [ ] Umami 后台能看到事件
