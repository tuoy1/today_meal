# 分析统计工具配置和查看指南

## 📊 快速开始

### 第一步：选择分析工具

推荐使用以下三种工具之一：

1. **Umami** - 开源免费，适合个人项目
2. **Plausible** - 轻量级，有免费试用
3. **PostHog** - 功能强大，有免费额度

### 第二步：配置环境变量

1. 复制配置示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的配置信息

3. 重启开发服务器或重新构建

---

## 🔧 各工具详细配置

### 1. Umami（推荐，开源免费）

#### 获取 Website ID

1. **自托管 Umami**（推荐）：
   - 部署 Umami 到你的服务器：https://umami.is/docs/install
   - 创建网站，获取 Website ID

2. **使用公共实例**：
   - 访问 https://umami.is
   - 注册账号并创建网站
   - 获取 Website ID

#### 配置示例

```env
VITE_ANALYTICS_PROVIDER=umami
VITE_UMAMI_WEBSITE_ID=your-actual-website-id-here
VITE_UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
```

#### 查看数据

1. 登录你的 Umami 后台
2. 选择对应的网站
3. 在 **事件** 页面查看：
   - `page_view` - 页面访问
   - `recommendation_view` - 推荐查看
   - `recommendation_refresh` - 推荐刷新
4. 在 **属性** 中筛选 `device_id` 查看唯一设备数

---

### 2. Plausible

#### 获取配置信息

1. 访问 https://plausible.io
2. 注册账号（有 30 天免费试用）
3. 添加你的网站域名
4. 获取域名和 API Host

#### 配置示例

```env
VITE_ANALYTICS_PROVIDER=plausible
VITE_PLAUSIBLE_DOMAIN=your-domain.com
VITE_PLAUSIBLE_API_HOST=https://plausible.io
```

#### 查看数据

1. 登录 Plausible 后台
2. 选择你的网站
3. 在 **事件** 页面查看自定义事件
4. 使用 **属性筛选** 查看 `device_id` 统计：
   - 总事件数
   - 唯一 device_id 数
   - 按日期分组的 device_id

---

### 3. PostHog

#### 获取 API Key

1. 访问 https://posthog.com
2. 注册账号（有免费额度）
3. 创建项目
4. 在项目设置中获取 API Key

#### 配置示例

```env
VITE_ANALYTICS_PROVIDER=posthog
VITE_POSTHOG_API_KEY=phc_your-actual-api-key-here
VITE_POSTHOG_API_HOST=https://app.posthog.com
```

#### 查看数据

1. 登录 PostHog 后台
2. 进入你的项目
3. 在 **Events** 页面查看：
   - `page_view`
   - `recommendation_view`
   - `recommendation_refresh`
4. 使用 **Insights** 创建图表：
   - 选择事件
   - 添加 `device_id` 作为分组属性
   - 查看唯一 device_id 数

---

## 📈 关键指标查看方法

### 1. 总打开次数

在所有工具中：
- 查看 `page_view` 事件的总数
- 这就是所有用户的总访问次数

### 2. 唯一 device_id 数

**Umami:**
- 进入事件详情
- 查看 `device_id` 属性的唯一值数量

**Plausible:**
- 使用属性筛选
- 选择 `device_id` 属性
- 查看唯一值统计

**PostHog:**
- 创建 Insight
- 选择事件
- 添加 `device_id` 作为分组
- 查看唯一计数

### 3. 不同日期的 device_id 数

**所有工具:**
- 按日期分组
- 统计每天的 `device_id` 唯一值
- 可以看到每日活跃设备数

---

## 🧪 测试配置是否生效

### 方法 1：浏览器控制台

1. 打开应用
2. 按 F12 打开开发者工具
3. 查看 Console，应该看到分析工具加载的日志
4. 查看 Network 标签，应该看到向分析工具发送的请求

### 方法 2：检查事件上报

1. 在应用中操作（查看推荐、刷新等）
2. 等待几秒钟
3. 登录分析工具后台
4. 查看是否有新的事件记录

### 方法 3：使用浏览器扩展

- **Umami**: 可以安装浏览器扩展查看实时事件
- **PostHog**: 有浏览器扩展可以查看事件流

---

## 🔍 数据分析示例

### 场景 1：查看用户留存

1. 查看每日的 `device_id` 唯一数
2. 对比不同日期的数据
3. 计算留存率

### 场景 2：查看使用频率

1. 查看每个 `device_id` 的事件数
2. 找出高频用户（同一个 device_id 多次访问）
3. 分析使用模式

### 场景 3：查看餐次偏好

1. 筛选 `recommendation_view` 事件
2. 按 `meal_type` 分组
3. 查看早餐/午餐/晚餐的使用情况

---

## ⚠️ 常见问题

### Q: 配置后看不到数据？

1. 检查 `.env` 文件是否正确配置
2. 确认重启了开发服务器
3. 检查浏览器控制台是否有错误
4. 确认分析工具的配置信息正确

### Q: 如何验证 device_id 是否正确上报？

1. 在浏览器控制台输入：`localStorage.getItem('device_id')`
2. 查看返回的 UUID
3. 在分析工具后台搜索这个 device_id
4. 应该能看到相关事件

### Q: 数据有延迟吗？

- **Umami**: 通常实时，可能有几秒延迟
- **Plausible**: 实时更新
- **PostHog**: 实时更新，可能有几秒延迟

---

## 📝 当前配置状态

运行以下命令检查当前配置：

```bash
# 检查是否有 .env 文件
ls -la .env

# 查看配置（不显示敏感信息）
grep VITE_ANALYTICS .env
```

如果未配置，当前状态是 `VITE_ANALYTICS_PROVIDER=none`，所有事件上报会被静默忽略。
