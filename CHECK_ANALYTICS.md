# 检查 GrowingIO 数据指南

## ✅ 从控制台日志确认

你的控制台显示埋点**已经正常工作**：

```
✅ GrowingIO script loaded
✅ GrowingIO userId set: 1bdc7a78-897f-450e-af80-d8359816029f
✅ GrowingIO user attributes set
✅ GrowingIO page view sent
📊 GrowingIO event tracked: page_view
📊 GrowingIO event tracked: recommendation_view
```

这说明：
- ✅ GrowingIO SDK 已成功加载
- ✅ 用户 ID 已设置
- ✅ 事件已成功发送到 GrowingIO 服务器

## 🔍 在 GrowingIO 后台查看数据

### 1. 登录 GrowingIO

访问：https://www.growingio.com

### 2. 查看实时数据（概览页面）

1. 进入你的项目（Project ID: `a90de8d8a12b43ea`）
2. 查看「概览」或「Dashboard」
3. 应该能看到：
   - **访问量（PV）**：每次页面加载都会增加
   - **访客数（UV）**：基于 `device_id` 的唯一访客数
   - **实时在线**：当前在线的用户数

**注意**：数据有延迟，通常需要等待 1-5 分钟

### 3. 查看自定义事件（事件分析）

1. 进入「事件分析」或「Event Analysis」
2. 查看以下事件：
   - `page_view` - 页面访问事件
   - `recommendation_view` - 推荐查看事件
   - `recommendation_refresh` - 推荐刷新事件

3. 如果看不到事件，可能需要：
   - **等待几分钟**（数据延迟）
   - **检查事件名称**：确保事件名称完全匹配
   - **检查时间范围**：选择正确的时间范围（今天、最近1小时等）

### 4. 查看事件属性

点击事件名称，查看事件属性：
- `device_id` - 设备唯一标识
- `date` - 日期
- `meal_type` - 餐次类型（breakfast/lunch/dinner）

### 5. 查看用户属性

1. 进入「用户分析」或「User Analysis」
2. 查看用户属性：
   - `device_id` - 唯一设备数
   - `date` - 按日期分组的用户数

## ⚠️ 常见问题

### 问题 1：概览页面有数据，但事件分析看不到

**原因**：自定义事件可能需要先在后台配置

**解决方法**：
1. 在 GrowingIO 后台，进入「事件管理」
2. 查看是否有 `page_view`、`recommendation_view` 等事件
3. 如果没有，可能需要等待更长时间，或者联系 GrowingIO 技术支持

### 问题 2：完全看不到任何数据

**检查清单**：
1. ✅ Project ID 是否正确（`a90de8d8a12b43ea`）
2. ✅ 是否等待了足够的时间（至少 5 分钟）
3. ✅ 时间范围是否正确（选择"今天"或"最近1小时"）
4. ✅ 是否在正确的项目中查看

### 问题 3：数据量很少

**可能原因**：
- 只有你一个人在测试
- 数据还在处理中
- 需要更多时间积累数据

**解决方法**：
- 多刷新几次页面
- 多点击几次"换一个"按钮
- 等待更长时间

## 🧪 验证数据上报

### 方法 1：查看网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 筛选 `gio` 或 `giocdn`
4. 应该看到向 GrowingIO 发送的请求
5. 点击请求，查看响应状态（应该是 200 或 204）

### 方法 2：在控制台手动测试

```javascript
// 检查 gio 是否已初始化
console.log('gio:', window.gio)

// 查看 gio 队列（如果有未发送的事件）
console.log('gio queue:', window.gio.q)

// 手动发送测试事件
window.gio('track', 'test_event', {
  device_id: localStorage.getItem('device_id'),
  test: true,
  timestamp: new Date().toISOString()
})
```

### 方法 3：查看 localStorage

```javascript
// 查看 device_id
localStorage.getItem('device_id')

// 查看所有 localStorage 数据
console.log('localStorage:', { ...localStorage })
```

## 📊 预期数据

基于你的使用情况，应该能看到：

1. **页面访问（page_view）**：
   - 每次打开页面 = 1 次
   - 每次刷新页面 = 1 次

2. **推荐查看（recommendation_view）**：
   - 每次点击"今天吃什么？"按钮 = 1 次
   - 每次自动加载推荐 = 1 次

3. **推荐刷新（recommendation_refresh）**：
   - 每次点击"换一个"按钮 = 1 次

4. **唯一访客（UV）**：
   - 基于 `device_id` 计算
   - 每个设备 = 1 个访客

## 🎯 下一步

1. **等待 5-10 分钟**后刷新 GrowingIO 后台
2. **多操作几次**应用（刷新页面、点击按钮）
3. **检查事件分析**页面，查看自定义事件
4. **如果还是看不到数据**，检查：
   - Project ID 是否正确
   - 是否在正确的项目中
   - 时间范围是否正确

## 💡 提示

- GrowingIO 的数据处理有延迟，通常需要 1-5 分钟
- 实时数据可能更快，但详细的事件分析需要更长时间
- 如果控制台显示事件已发送，说明埋点正常工作，只需要等待数据同步
