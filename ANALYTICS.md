# 匿名分析配置指南

本应用支持多种匿名分析工具，用于统计用户使用情况，同时保护用户隐私。

## 支持的分析工具

### 1. Umami
- 开源、隐私友好的分析工具
- 支持自定义事件和属性
- 配置简单

### 2. Plausible
- 轻量级、隐私友好的分析工具
- 支持自定义事件和属性
- 符合 GDPR

### 3. PostHog
- 功能强大的产品分析工具
- 支持匿名模式
- 支持自定义事件和属性

## 配置方法

### 1. 创建环境变量文件

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

### 2. 配置分析工具

编辑 `.env` 文件，选择并配置你要使用的分析工具：

#### Umami 配置示例

```env
VITE_ANALYTICS_PROVIDER=umami
VITE_UMAMI_WEBSITE_ID=your-website-id-here
VITE_UMAMI_SCRIPT_URL=https://analytics.umami.is/script.js
```

#### Plausible 配置示例

```env
VITE_ANALYTICS_PROVIDER=plausible
VITE_PLAUSIBLE_DOMAIN=your-domain.com
VITE_PLAUSIBLE_API_HOST=https://plausible.io
```

#### PostHog 配置示例

```env
VITE_ANALYTICS_PROVIDER=posthog
VITE_POSTHOG_API_KEY=your-api-key-here
VITE_POSTHOG_API_HOST=https://app.posthog.com
```

#### 禁用分析

```env
VITE_ANALYTICS_PROVIDER=none
```

## 上报的事件

应用会自动上报以下事件：

### 1. page_view
页面访问事件，每次页面加载时触发。

**属性：**
- `device_id`: 设备唯一标识（UUID）
- `date`: 访问日期（YYYY-MM-DD）

### 2. recommendation_view
推荐查看事件，每次显示推荐时触发。

**属性：**
- `device_id`: 设备唯一标识
- `date`: 访问日期
- `meal_type`: 餐次类型（breakfast/lunch/dinner）

### 3. recommendation_refresh
推荐刷新事件，用户点击"换一个"按钮时触发。

**属性：**
- `device_id`: 设备唯一标识
- `date`: 访问日期
- `meal_type`: 餐次类型

## 数据分析

在分析工具后台，你可以通过 `device_id` 这个自定义属性来分析：

### 关键指标

1. **总打开次数**：所有 `page_view` 事件的总数
2. **唯一 device_id 数**：不同 `device_id` 的数量
3. **不同日期的 device_id 数**：按日期分组的唯一 `device_id` 数

### 分析示例

- **总打开 200 次**：所有用户总共访问了 200 次
- **唯一 device_id 120**：有 120 个不同的设备使用过应用
- **不同日期 device_id 45**：有 45 个设备在不同日期访问过

这些数据可以帮助你了解：
- 用户留存情况
- 日活跃用户数
- 用户使用频率
- 不同餐次的使用情况

## 隐私保护

- 所有数据都是匿名的，不收集任何个人信息
- `device_id` 仅存储在用户本地（localStorage），不会上传个人信息
- 所有分析工具都支持匿名模式
- 符合 GDPR 和隐私保护要求

## 开发模式

在开发模式下，如果未配置分析工具，所有事件上报会被静默忽略，不会影响开发体验。
