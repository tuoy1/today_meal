# 分析工具调试指南

## 🔍 检查埋点是否生效

### 1. 打开浏览器控制台

1. 在电脑上打开应用
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签

### 2. 查看初始化日志

正常情况下，你应该看到：

```
🔧 Initializing analytics provider: growingio
🚀 Initializing GrowingIO with projectId: a90de8d8a12b43ea
✅ GrowingIO script loaded
✅ GrowingIO userId set: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✅ GrowingIO user attributes set: {device_id: "...", date: "2026-01-19"}
✅ GrowingIO page view sent
```

### 3. 查看事件上报日志

当你在应用中操作时，应该看到：

```
📊 GrowingIO event tracked: recommendation_view {device_id: "...", date: "...", meal_type: "lunch"}
📊 GrowingIO event tracked: recommendation_refresh {device_id: "...", date: "...", meal_type: "lunch"}
```

### 4. 检查网络请求

1. 切换到 **Network** 标签
2. 筛选 `gio` 或 `giocdn`
3. 应该看到向 GrowingIO 发送的请求
4. 请求状态应该是 `200` 或 `204`

## ❌ 常见问题排查

### 问题 1：没有看到初始化日志

**可能原因：**
- `.env` 文件未正确配置
- `VITE_ANALYTICS_PROVIDER` 设置为 `none`
- Project ID 未配置或配置错误

**解决方法：**
1. 检查 `.env` 文件：
   ```bash
   cat .env | grep VITE_ANALYTICS
   ```
2. 确认 `VITE_ANALYTICS_PROVIDER=growingio`
3. 确认 `VITE_GROWINGIO_PROJECT_ID` 已设置且正确
4. 重启开发服务器

### 问题 2：看到警告 "GrowingIO project ID not configured"

**解决方法：**
1. 检查 `.env` 文件中的 `VITE_GROWINGIO_PROJECT_ID`
2. 确认不是 `your-project-id-here`
3. 确认 Project ID 格式正确（应该是 GrowingIO 后台显示的 ID）

### 问题 3：脚本加载失败

**可能原因：**
- 网络问题
- 脚本 URL 错误
- 防火墙阻止

**解决方法：**
1. 检查网络连接
2. 确认 `VITE_GROWINGIO_SCRIPT_URL` 正确
3. 尝试在浏览器直接访问脚本 URL

### 问题 4：事件没有上报

**检查清单：**
1. ✅ 控制台没有错误
2. ✅ 看到初始化成功的日志
3. ✅ 在应用中执行了操作（点击按钮、刷新等）
4. ✅ 等待几秒钟（GrowingIO 有延迟）

**调试方法：**
在浏览器控制台手动测试：
```javascript
// 检查 gio 是否已初始化
window.gio

// 手动发送测试事件
window.gio('track', 'test_event', { test: 'value' })
```

### 问题 5：GrowingIO 后台看不到数据

**可能原因：**
1. 数据有延迟（通常 1-5 分钟）
2. Project ID 配置错误
3. 事件名称不匹配
4. 本地开发环境未启用数据采集

**解决方法：**
1. 等待几分钟后刷新后台
2. 检查 Project ID 是否正确
3. 在 GrowingIO 后台查看「事件管理」，确认事件名称
4. 检查是否启用了本地开发环境数据采集

## 🧪 手动测试埋点

### 在浏览器控制台测试

```javascript
// 1. 检查 gio 是否已加载
console.log('gio:', window.gio)

// 2. 检查 device_id
localStorage.getItem('device_id')

// 3. 手动发送事件
window.gio('track', 'manual_test', {
  device_id: localStorage.getItem('device_id'),
  test: true
})

// 4. 查看 gio 队列
console.log('gio queue:', window.gio.q)
```

### 检查配置

```javascript
// 查看环境变量（在构建后的代码中）
console.log('Analytics provider:', import.meta.env.VITE_ANALYTICS_PROVIDER)
console.log('GrowingIO projectId:', import.meta.env.VITE_GROWINGIO_PROJECT_ID)
```

## 📊 在 GrowingIO 后台查看

### 1. 登录 GrowingIO

访问 https://www.growingio.com 并登录

### 2. 查看实时数据

1. 进入你的项目
2. 查看「概览」页面
3. 应该能看到访问量和访客数

### 3. 查看自定义事件

1. 进入「事件分析」
2. 查看自定义事件：
   - `recommendation_view`
   - `recommendation_refresh`
3. 点击事件名称查看详情

### 4. 查看 device_id 属性

1. 在事件详情中，查看「事件属性」
2. 找到 `device_id` 属性
3. 可以看到唯一 device_id 数和每个 device_id 的事件数

## 🔧 调试模式

代码中已经开启了 GrowingIO 的调试模式（`debug: true`），你可以在控制台看到更详细的日志。

如果还是看不到数据，可以：
1. 检查控制台是否有错误
2. 检查网络请求是否成功
3. 确认 Project ID 正确
4. 等待几分钟后查看 GrowingIO 后台
