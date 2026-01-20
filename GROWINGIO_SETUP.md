# GrowingIO 配置完整指南

## 🚀 快速开始

### 第一步：获取 Project ID

1. **注册 GrowingIO 账号**
   - 访问 https://www.growingio.com
   - 注册账号并登录

2. **创建项目**
   - 登录后，进入「项目管理」
   - 点击「创建项目」
   - 填写项目信息：
     - 项目名称：今天吃什么（或任意名称）
     - 项目类型：Web
   - 点击「创建」

3. **获取 Project ID**
   - 创建项目后，在「项目管理 → 项目概览」中
   - 找到 Project ID（格式类似：`abc123def456`）
   - 复制这个 ID

### 第二步：配置应用

编辑 `.env` 文件，添加以下配置：

```env
# 分析工具配置 - GrowingIO
VITE_ANALYTICS_PROVIDER=growingio

# GrowingIO 配置
VITE_GROWINGIO_PROJECT_ID=你的Project-ID
VITE_GROWINGIO_SCRIPT_URL=https://assets.giocdn.com/2.1/gio.js

# 可选配置
# 如果使用 hash 路由，设置为 true
VITE_GROWINGIO_HASHTAG=false

# 是否收集数据（默认 true）
VITE_GROWINGIO_DATA_COLLECT=true
```

### 第三步：重启应用

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
pnpm run dev
```

## 📊 查看数据

### 在 GrowingIO 后台查看

1. **登录 GrowingIO**
   - 访问 https://www.growingio.com
   - 使用账号密码登录

2. **查看实时数据**
   - 选择你的项目
   - 在「概览」页面查看：
     - 访问量
     - 访客数
     - 页面浏览量
     - 实时访客

3. **查看自定义事件**
   - 进入「事件分析」
   - 查看自定义事件：
     - `page_view` - 页面访问
     - `recommendation_view` - 推荐查看
     - `recommendation_refresh` - 推荐刷新

4. **查看 device_id 统计**
   - 在事件详情中，查看「事件属性」
   - 找到 `device_id` 属性
   - 可以看到：
     - 每个 device_id 的事件数
     - 唯一 device_id 的总数
     - 按 device_id 分组的数据

### 关键指标查看方法

#### 1. 总打开次数
- 查看 `page_view` 事件的总数
- 这就是所有用户的总访问次数

#### 2. 唯一 device_id 数
- 进入「事件分析」
- 选择 `page_view` 事件
- 添加 `device_id` 作为分组维度
- 查看唯一值数量

#### 3. 不同日期的 device_id 数
- 使用日期筛选
- 按日期分组查看每天的 `device_id` 唯一数
- 可以看到每日活跃设备数

## 🧪 测试配置是否生效

### 方法 1：浏览器控制台

1. 打开应用
2. 按 F12 打开开发者工具
3. 查看 Console，应该看到 GrowingIO 相关的日志
4. 查看 Network 标签，应该看到向 `assets.giocdn.com` 发送的请求

### 方法 2：使用 GrowingIO Web Debugger

1. 在 GrowingIO 后台，进入「设置 → SDK 调试」
2. 启用 Web Debugger
3. 在浏览器中打开应用
4. 应该能看到实时的事件上报

### 方法 3：检查 localStorage

在浏览器控制台输入：
```javascript
localStorage.getItem('device_id')
```

应该返回一个 UUID，这就是你的设备 ID。

### 方法 4：查看 GrowingIO 后台

1. 在应用中操作（查看推荐、刷新等）
2. 等待几秒钟（GrowingIO 有数据延迟）
3. 登录 GrowingIO 后台
4. 应该能看到新的事件记录

## ⚙️ 高级配置

### 自定义用户属性

GrowingIO 会自动设置以下用户属性：
- `device_id`: 设备唯一标识
- `date`: 访问日期

你可以在 GrowingIO 后台的「用户分析」中查看这些属性。

### 本地开发环境

GrowingIO 默认不会统计 `localhost` 或 `file://` 协议。如果要在开发阶段采集本地页面数据：

1. 在 GrowingIO 后台，进入「设置 → 数据采集」
2. 启用「本地开发环境数据采集」
3. 或者使用 `127.0.0.1` 代替 `localhost`

### Hash 路由配置

如果你的应用使用 hash 路由（如 `#/route1`），需要设置：

```env
VITE_GROWINGIO_HASHTAG=true
```

这样每次哈希变化会被算作一次页面浏览。

## 🔒 隐私和安全

- GrowingIO 支持 GDPR/CCPA 合规
- 可以通过 `dataCollect: false` 暂时停止采集
- `device_id` 是本地生成的 UUID，不包含任何个人信息
- 所有数据存储在 GrowingIO 服务器上

## ❓ 常见问题

### Q: 配置后看不到数据？

1. 检查 `.env` 文件中的配置是否正确
2. 确认重启了开发服务器
3. 检查浏览器控制台是否有错误
4. 确认 GrowingIO Project ID 正确
5. 检查网络连接，确认可以访问 `assets.giocdn.com`
6. 注意 GrowingIO 数据有延迟，可能需要等待几分钟

### Q: 如何验证 device_id 是否正确上报？

1. 在浏览器控制台输入：`localStorage.getItem('device_id')`
2. 查看返回的 UUID
3. 在 GrowingIO 后台的「用户分析」中搜索这个 device_id
4. 应该能看到相关事件和用户属性

### Q: 数据有延迟吗？

- GrowingIO 通常有几分钟的数据延迟
- 实时数据可能需要等待 1-5 分钟
- 历史数据查询通常是实时的

### Q: 可以同时使用多个项目吗？

- 可以，每个项目有独立的 Project ID
- 在 GrowingIO 中创建多个项目，分别配置不同的 ID
- 但通常一个应用只需要一个项目

## 📝 配置检查清单

- [ ] 已创建 `.env` 文件
- [ ] 已设置 `VITE_ANALYTICS_PROVIDER=growingio`
- [ ] 已配置 `VITE_GROWINGIO_PROJECT_ID`
- [ ] 已配置 `VITE_GROWINGIO_SCRIPT_URL`（可选，有默认值）
- [ ] 已重启开发服务器
- [ ] 浏览器控制台无错误
- [ ] GrowingIO 后台能看到事件

## 🔗 相关链接

- GrowingIO 官网：https://www.growingio.com
- GrowingIO 文档：https://docs.growingio.com
- SDK 集成文档：https://docs.growingio.com/v3/developer-manual/sdkintegrated/web-js-sdk/latest-jssdk
