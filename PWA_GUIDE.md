# PWA 完整学习指南

## 📚 目录

1. [什么是 PWA](#什么是-pwa)
2. [PWA 核心组件](#pwa-核心组件)
3. [项目实现详解](#项目实现详解)
4. [配置详解](#配置详解)
5. [安装流程](#安装流程)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)
8. [进阶技巧](#进阶技巧)
9. [调试技巧](#调试技巧)
10. [参考资料](#参考资料)

---

## 什么是 PWA

### 定义

**PWA (Progressive Web App)** 是一种使用现代 Web 技术构建的应用程序，它结合了 Web 和原生应用的优点：

- ✅ **可安装**：可以像原生应用一样安装到设备上
- ✅ **离线可用**：通过 Service Worker 实现离线功能
- ✅ **响应式**：适配各种设备尺寸
- ✅ **安全**：必须通过 HTTPS 提供服务（localhost 例外）
- ✅ **可发现**：可以通过搜索引擎找到
- ✅ **可链接**：可以通过 URL 分享

### PWA 的优势

| 特性 | 传统 Web | 原生 App | PWA |
|------|---------|---------|-----|
| 安装 | ❌ | ✅ | ✅ |
| 离线使用 | ❌ | ✅ | ✅ |
| 跨平台 | ✅ | ❌ | ✅ |
| 自动更新 | ✅ | ❌ | ✅ |
| 无需应用商店 | ✅ | ❌ | ✅ |
| 开发成本 | 低 | 高 | 中 |

---

## PWA 核心组件

### 1. Web App Manifest

**作用**：告诉浏览器如何显示应用，包括名称、图标、启动方式等。

**文件位置**：`public/manifest.webmanifest`

**关键字段**：

```json
{
  "name": "应用完整名称",
  "short_name": "短名称（显示在主屏幕）",
  "description": "应用描述",
  "start_url": "/",              // 启动时的 URL
  "scope": "/",                  // PWA 的作用域
  "display": "standalone",       // 显示模式
  "theme_color": "#ffffff",      // 主题色
  "background_color": "#ffffff", // 启动时的背景色
  "icons": [...]                 // 图标数组
}
```

**display 模式**：
- `standalone`：独立窗口，隐藏浏览器 UI（推荐）
- `fullscreen`：全屏模式
- `minimal-ui`：最小化 UI
- `browser`：普通浏览器窗口

### 2. Service Worker

**作用**：在后台运行的脚本，实现离线功能和缓存策略。

**核心功能**：
- 拦截网络请求
- 缓存资源
- 推送通知
- 后台同步

**生命周期**：
1. **注册** (Register) → 2. **安装** (Install) → 3. **激活** (Activate)

### 3. HTTPS 要求

**为什么需要 HTTPS**：
- Service Worker 只能在安全上下文中运行
- 保护用户数据安全
- 防止中间人攻击

**例外情况**：
- `localhost` 和 `127.0.0.1` 被视为安全上下文
- 开发环境可以使用 HTTP

---

## 项目实现详解

### 1. 使用 vite-plugin-pwa

本项目使用 `vite-plugin-pwa` 插件，它自动处理：
- Service Worker 生成
- Manifest 文件生成
- 资源预缓存
- 开发模式支持

### 2. 配置文件解析

#### vite.config.js

```javascript
VitePWA({
  // Service Worker 注册方式
  registerType: 'autoUpdate',  // 自动更新
  
  // 自动注入注册代码
  injectRegister: 'auto',
  
  // 开发模式配置
  devOptions: {
    enabled: true,              // 开发模式启用 SW
    type: 'module',             // 使用 ES 模块
    navigateFallback: undefined // 不设置回退页面
  },
  
  // 包含 manifest 中的图标
  includeManifestIcons: true,
  
  // 包含的静态资源
  includeAssets: ['icon-192.png', 'icon-512.png', 'icon.svg'],
  
  // Manifest 配置
  manifest: {
    name: '今天吃什么',
    short_name: '吃什么',
    // ... 其他配置
  },
  
  // Workbox 配置（Service Worker 工具库）
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
    navigateFallback: undefined,
    runtimeCaching: []
  }
})
```

#### index.html

```html
<!-- Manifest 链接 -->
<link rel="manifest" href="/manifest.webmanifest">

<!-- iOS Safari 支持 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="吃什么">
<link rel="apple-touch-icon" href="/icon-192.png">

<!-- 主题色 -->
<meta name="theme-color" content="#ffffff">
```

### 3. 安装提示实现

#### 监听安装事件

```javascript
// 监听 beforeinstallprompt 事件
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()              // 阻止默认提示
  deferredPrompt = e              // 保存事件对象
  showInstallButton.value = true  // 显示自定义按钮
})

// 用户点击安装按钮
async function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt()       // 显示安装提示
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装')
    }
    
    deferredPrompt = null
    showInstallButton.value = false
  }
}

// 监听安装完成事件
window.addEventListener('appinstalled', () => {
  console.log('PWA 已安装')
})
```

#### 检测是否已安装

```javascript
// 方法 1：检查显示模式
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA 已安装')
}

// 方法 2：检查是否从主屏幕启动
if (window.navigator.standalone === true) {
  console.log('iOS PWA 已安装')
}
```

---

## 配置详解

### Manifest 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 应用完整名称 |
| `short_name` | string | ✅ | 短名称（主屏幕显示） |
| `start_url` | string | ✅ | 启动 URL |
| `scope` | string | ✅ | 作用域 |
| `display` | string | ✅ | 显示模式 |
| `icons` | array | ✅ | 图标数组 |
| `theme_color` | string | ⚠️ | 主题色 |
| `background_color` | string | ⚠️ | 背景色 |
| `orientation` | string | ❌ | 屏幕方向 |
| `description` | string | ❌ | 描述 |

### 图标要求

**必需尺寸**：
- 192x192 像素（Android 主屏幕）
- 512x512 像素（启动画面、安装提示）

**可选尺寸**：
- 144x144, 96x96, 72x72（旧设备）

**图标属性**：
```json
{
  "src": "/icon-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "any maskable"  // any: 任意用途, maskable: 自适应图标
}
```

### Service Worker 策略

#### 1. 预缓存 (Precaching)

**作用**：在安装时缓存关键资源

```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}']
}
```

#### 2. 运行时缓存 (Runtime Caching)

**策略类型**：
- `NetworkFirst`：网络优先，失败时使用缓存
- `CacheFirst`：缓存优先，失败时请求网络
- `StaleWhileRevalidate`：使用缓存，后台更新
- `NetworkOnly`：仅使用网络
- `CacheOnly`：仅使用缓存

**示例**：
```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 24 小时
        }
      }
    }
  ]
}
```

---

## 安装流程

### Chrome/Edge 桌面端

1. **自动提示**：
   - 满足安装条件后，地址栏右侧显示安装图标
   - 点击图标即可安装

2. **手动安装**：
   - 菜单 → "安装应用"
   - 或使用自定义安装按钮

### Chrome/Edge 移动端

1. 地址栏显示安装提示
2. 点击提示进行安装
3. 或通过菜单 → "添加到主屏幕"

### iOS Safari

1. 点击分享按钮
2. 选择"添加到主屏幕"
3. 确认添加

### 安装条件检查清单

- ✅ HTTPS 或 localhost
- ✅ 有效的 manifest 文件
- ✅ 至少一个 192x192 图标
- ✅ Service Worker 已注册
- ✅ Service Worker 有 fetch 事件处理器
- ✅ start_url 在 scope 内
- ✅ display 不是 "browser"

---

## 最佳实践

### 1. 图标设计

- 使用简洁、易识别的图标
- 确保在小尺寸下仍然清晰
- 使用 maskable 图标支持自适应图标
- 提供多种尺寸以适配不同设备

### 2. 缓存策略

- **关键资源**：使用预缓存
- **API 数据**：使用 NetworkFirst 或 StaleWhileRevalidate
- **图片资源**：使用 CacheFirst
- **HTML 页面**：使用 NetworkFirst

### 3. 更新策略

```javascript
registerType: 'autoUpdate'  // 自动更新（推荐）
// 或
registerType: 'prompt'      // 提示用户更新
```

### 4. 错误处理

```javascript
// Service Worker 注册错误处理
navigator.serviceWorker.register('/sw.js')
  .then(registration => {
    console.log('SW registered:', registration)
  })
  .catch(error => {
    console.error('SW registration failed:', error)
  })
```

### 5. 性能优化

- 使用代码分割减少初始加载
- 预加载关键资源
- 使用 Web Workers 处理耗时任务
- 优化图片大小和格式

---

## 常见问题

### Q1: Chrome 地址栏不显示安装图标

**可能原因**：
1. 图标尺寸不正确（必须是 192x192 和 512x512）
2. Service Worker 未正确注册
3. Manifest 文件有错误
4. 之前拒绝过安装（Chrome 会记住）

**解决方法**：
1. 检查图标文件尺寸：`file public/icon-*.png`
2. 检查 DevTools → Application → Service Workers
3. 检查 DevTools → Application → Manifest
4. 清除站点数据后重试

### Q2: Service Worker 不更新

**解决方法**：
```javascript
// 强制更新
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.update()
  })
})
```

### Q3: 开发模式下的警告

**说明**：开发模式下 Workbox 的警告是正常的，因为：
- 开发资源路径与生产环境不同
- Vite 使用特殊路径（如 `/@vite/client`）
- 这些警告不影响功能

### Q4: iOS Safari 不支持 beforeinstallprompt

**说明**：iOS Safari 不支持 `beforeinstallprompt` 事件，需要：
- 使用分享菜单手动添加
- 显示手动安装说明

### Q5: 图标显示不正确

**检查清单**：
- 图标文件是否存在
- 图标尺寸是否正确
- 路径是否正确（必须以 `/` 开头）
- MIME 类型是否正确

---

## 进阶技巧

### 1. 自定义安装提示

```javascript
let deferredPrompt

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  
  // 显示自定义安装横幅
  showCustomInstallBanner()
})

function showCustomInstallBanner() {
  // 创建自定义 UI
  const banner = document.createElement('div')
  banner.innerHTML = `
    <p>安装应用以获得更好的体验</p>
    <button onclick="installApp()">立即安装</button>
    <button onclick="dismissBanner()">稍后</button>
  `
  document.body.appendChild(banner)
}
```

### 2. 推送通知

```javascript
// 请求通知权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // 注册推送订阅
    registerPushSubscription()
  }
})

// 显示通知
function showNotification(title, options) {
  if (Notification.permission === 'granted') {
    new Notification(title, options)
  }
}
```

### 3. 后台同步

```javascript
// 注册后台同步
navigator.serviceWorker.ready.then(registration => {
  return registration.sync.register('sync-data')
})

// Service Worker 中处理
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})
```

### 4. 离线检测

```javascript
// 监听在线/离线状态
window.addEventListener('online', () => {
  console.log('网络已连接')
  // 同步数据
})

window.addEventListener('offline', () => {
  console.log('网络已断开')
  // 显示离线提示
})
```

### 5. 更新提示

```javascript
// 检测更新
let refreshing = false
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true
    window.location.reload()
  }
})

// 提示用户更新
function checkForUpdate() {
  navigator.serviceWorker.ready.then(registration => {
    registration.update()
  })
}
```

---

## 调试技巧

### 1. Chrome DevTools

**Application 面板**：
- **Manifest**：检查 manifest 配置
- **Service Workers**：查看 SW 状态和日志
- **Storage**：查看缓存内容
- **Cache Storage**：查看缓存存储

**Network 面板**：
- 查看资源加载情况
- 检查 Service Worker 拦截的请求

### 2. 控制台命令

```javascript
// 检查 Service Worker 状态
navigator.serviceWorker.getRegistrations().then(console.log)

// 取消注册所有 Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})

// 清除所有缓存
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

### 3. Lighthouse 审核

使用 Lighthouse 检查 PWA 质量：
1. 打开 DevTools → Lighthouse
2. 选择 "Progressive Web App"
3. 运行审核
4. 查看评分和建议

### 4. 常见调试场景

**场景 1：SW 不更新**
```javascript
// 强制更新并跳过等待
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.update()
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
  })
})
```

**场景 2：清除所有数据**
```javascript
// 清除所有存储
localStorage.clear()
sessionStorage.clear()
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name))
})
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

---

## 参考资料

### 官方文档

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Chrome - PWA](https://developer.chrome.com/docs/workbox/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

### 工具

- [PWA Builder](https://www.pwabuilder.com/) - PWA 生成工具
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA 审核工具
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Worker 工具库

### 示例项目

- [PWA Examples](https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker)
- [Vite PWA Examples](https://github.com/vite-pwa/vite-plugin-pwa/tree/main/examples)

---

## 总结

PWA 是现代 Web 开发的重要技术，它让 Web 应用具备了原生应用的体验。通过本项目的实现，你可以学习到：

1. ✅ PWA 的核心概念和组件
2. ✅ 如何使用 vite-plugin-pwa 快速实现 PWA
3. ✅ Manifest 和 Service Worker 的配置
4. ✅ 安装提示的实现
5. ✅ 常见问题的解决方法

继续深入学习，可以探索：
- 推送通知
- 后台同步
- 离线数据同步
- 性能优化
- 用户体验提升

祝你学习愉快！🚀
