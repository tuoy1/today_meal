import { getDeviceId, getTodayString } from './utils.js'

// 分析工具配置（通过环境变量或配置设置）
const ANALYTICS_CONFIG = {
  // 选择使用的分析工具: 'growingio' | 'umami' | 'plausible' | 'posthog' | 'none'
  provider: import.meta.env.VITE_ANALYTICS_PROVIDER || 'none',
  
  // GrowingIO 配置
  growingio: {
    projectId: import.meta.env.VITE_GROWINGIO_PROJECT_ID || '',
    scriptUrl: import.meta.env.VITE_GROWINGIO_SCRIPT_URL || 'https://assets.giocdn.com/2.1/gio.js',
    hashtag: import.meta.env.VITE_GROWINGIO_HASHTAG === 'true',
    dataCollect: import.meta.env.VITE_GROWINGIO_DATA_COLLECT !== 'false'
  },
  
  // Umami 配置
  umami: {
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID || '',
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://analytics.umami.is/script.js'
  },
  
  // Plausible 配置
  plausible: {
    domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || '',
    apiHost: import.meta.env.VITE_PLAUSIBLE_API_HOST || 'https://plausible.io'
  },
  
  // PostHog 配置
  posthog: {
    apiKey: import.meta.env.VITE_POSTHOG_API_KEY || '',
    apiHost: import.meta.env.VITE_POSTHOG_API_HOST || 'https://app.posthog.com'
  }
}

let analyticsInitialized = false

// 初始化 GrowingIO
function initGrowingIO(deviceId, today) {
  const { projectId, scriptUrl, hashtag, dataCollect } = ANALYTICS_CONFIG.growingio
  
  if (!projectId || projectId === 'your-project-id-here') {
    console.warn('GrowingIO project ID not configured')
    return
  }

  console.log('🚀 Initializing GrowingIO with projectId:', projectId)

  // 初始化 GrowingIO（在脚本加载前先初始化队列）
  window.gio = window.gio || function() {
    (window.gio.q = window.gio.q || []).push(arguments)
  }

  // 动态加载 GrowingIO 脚本
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = scriptUrl
  document.head.appendChild(script)

  // 等待脚本加载完成后初始化
  script.onload = () => {
    console.log('✅ GrowingIO script loaded')
    
    try {
      window.gio('init', projectId, {
        hashtag: hashtag,
        dataCollect: dataCollect,
        compress: true,
        debug: true // 开启调试模式
      })

      // 设置匿名用户ID（使用 device_id）
      window.gio('setUserId', deviceId)
      console.log('✅ GrowingIO userId set:', deviceId)
      
      // 设置用户属性
      window.gio('setUserAttributes', {
        device_id: deviceId,
        date: today
      })
      console.log('✅ GrowingIO user attributes set:', { device_id: deviceId, date: today })

      // 发送页面访问
      window.gio('send')
      console.log('✅ GrowingIO page view sent')
    } catch (error) {
      console.error('❌ GrowingIO initialization error:', error)
    }
  }

  script.onerror = () => {
    console.error('❌ Failed to load GrowingIO script from:', scriptUrl)
  }
}

// 初始化分析工具
export function initAnalytics() {
  if (analyticsInitialized || ANALYTICS_CONFIG.provider === 'none') {
    return
  }

  const deviceId = getDeviceId()
  const today = getTodayString()

  switch (ANALYTICS_CONFIG.provider) {
    case 'growingio':
      initGrowingIO(deviceId, today)
      break
    case 'umami':
      initUmami(deviceId, today)
      break
    case 'plausible':
      initPlausible(deviceId, today)
      break
    case 'posthog':
      initPostHog(deviceId, today)
      break
  }

  analyticsInitialized = true
  
  // 上报页面访问事件（GrowingIO 会自动上报页面访问，这里只上报自定义事件）
  if (ANALYTICS_CONFIG.provider !== 'growingio') {
    trackEvent('page_view', {
      device_id: deviceId,
      date: today
    })
  }
}

// 初始化 Umami
function initUmami(deviceId, today) {
  const { websiteId, scriptUrl } = ANALYTICS_CONFIG.umami
  
  if (!websiteId) {
    console.warn('Umami website ID not configured')
    return
  }

  // 动态加载 Umami 脚本
  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.src = scriptUrl
  script.setAttribute('data-website-id', websiteId)
  document.head.appendChild(script)

  // Umami 支持自定义属性
  window.umami = window.umami || function() {
    (window.umami.q = window.umami.q || []).push(arguments)
  }
}

// 初始化 Plausible
function initPlausible(deviceId, today) {
  const { domain, apiHost } = ANALYTICS_CONFIG.plausible
  
  if (!domain) {
    console.warn('Plausible domain not configured')
    return
  }

  // 动态加载 Plausible 脚本
  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.setAttribute('data-domain', domain)
  script.setAttribute('data-api', apiHost)
  script.src = `${apiHost}/js/script.js`
  document.head.appendChild(script)

  // Plausible 支持自定义属性
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments)
  }
}

// 初始化 PostHog
function initPostHog(deviceId, today) {
  const { apiKey, apiHost } = ANALYTICS_CONFIG.posthog
  
  if (!apiKey) {
    console.warn('PostHog API key not configured')
    return
  }

  // 动态加载 PostHog 脚本
  const script = document.createElement('script')
  script.async = true
  script.src = `${apiHost}/static/array.js`
  document.head.appendChild(script)

  window.posthog = window.posthog || []
  window.posthog.push(['_setApiKey', apiKey])
  window.posthog.push(['_setHost', apiHost])
  window.posthog.push(['capture_pageview'])
  
  // 设置 device_id 作为用户标识（匿名模式）
  window.posthog.push(['identify', deviceId, {
    device_id: deviceId,
    date: today
  }])
}

// 上报自定义事件
export function trackEvent(eventName, properties = {}) {
  if (ANALYTICS_CONFIG.provider === 'none') {
    return
  }

  const deviceId = getDeviceId()
  const today = getTodayString()
  
  // 统一添加 device_id 和 date
  const eventProperties = {
    device_id: deviceId,
    date: today,
    ...properties
  }

  switch (ANALYTICS_CONFIG.provider) {
    case 'growingio':
      trackGrowingIOEvent(eventName, eventProperties)
      break
    case 'umami':
      trackUmamiEvent(eventName, eventProperties)
      break
    case 'plausible':
      trackPlausibleEvent(eventName, eventProperties)
      break
    case 'posthog':
      trackPostHogEvent(eventName, eventProperties)
      break
  }
}

// GrowingIO 事件上报
function trackGrowingIOEvent(eventName, properties) {
  if (window.gio) {
    try {
      // GrowingIO 使用 track 方法上报自定义事件
      window.gio('track', eventName, properties)
      console.log('📊 GrowingIO event tracked:', eventName, properties)
    } catch (error) {
      console.error('❌ GrowingIO track error:', error)
    }
  } else {
    console.warn('⚠️ GrowingIO not initialized, event not tracked:', eventName)
  }
}

// Umami 事件上报
function trackUmamiEvent(eventName, properties) {
  if (window.umami) {
    // Umami 支持自定义事件和属性
    window.umami.track(eventName, properties)
  }
}

// Plausible 事件上报
function trackPlausibleEvent(eventName, properties) {
  if (window.plausible) {
    // Plausible 通过 props 传递自定义属性
    window.plausible(eventName, {
      props: properties
    })
  }
}

// PostHog 事件上报
function trackPostHogEvent(eventName, properties) {
  if (window.posthog) {
    window.posthog.push(['capture', eventName, properties])
  }
}

// 上报页面访问
export function trackPageView() {
  trackEvent('page_view')
}

// 上报推荐查看
export function trackRecommendationView(mealType) {
  trackEvent('recommendation_view', {
    meal_type: mealType
  })
}

// 上报推荐加载（兼容别名）
export function trackRecommendationLoaded(mealType) {
  trackRecommendationView(mealType)
}

// 上报推荐刷新
export function trackRecommendationRefresh(mealType) {
  trackEvent('recommendation_refresh', {
    meal_type: mealType
  })
}

// 上报推荐刷新（兼容别名）
export function trackRecommendationRefreshed(mealType) {
  trackRecommendationRefresh(mealType)
}

// 上报按钮点击
export function trackButtonClick(buttonName) {
  trackEvent('button_click', {
    button_name: buttonName
  })
}
