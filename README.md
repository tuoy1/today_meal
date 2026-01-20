# 今天吃什么

极简的 PWA 应用，直接决定今天吃什么。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 特性

- ✅ 极简设计，3秒内给出结果
- ✅ 使用 IndexedDB 存储食物数据（无需后台）
- ✅ 支持 PWA 安装（可添加到主屏幕）
- ✅ 只有一个交互：换一个
- ✅ 预置 40+ 种食物选项

## 项目结构

```
Startup/
├── src/
│   ├── App.vue          # 主应用组件
│   ├── db.js            # IndexedDB 数据管理
│   ├── main.js          # 入口文件
│   └── style.css        # 样式文件
├── public/
│   ├── icon-192.png     # PWA 图标（192x192）
│   ├── icon-512.png     # PWA 图标（512x512）
│   └── manifest.webmanifest
├── index.html
├── vite.config.js
└── package.json
```

## PWA 图标

当前使用的是占位图标。如需自定义图标，请参考 `ICONS.md` 文件。

## 技术栈

- Vue 3 (Composition API)
- Vite
- IndexedDB
- PWA (Service Worker + Manifest)

## 设计理念

- **极简**：页面只显示一个结果和一个按钮
- **快速**：3秒内必须给出结果
- **直接**：不做选择，直接决定
- **离线**：完全本地运行，无需网络
