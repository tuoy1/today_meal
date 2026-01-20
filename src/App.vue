<template>
  <div class="app-container">
    <!-- 顶部标题 -->
    <header class="header">
      <div class="header-content">
        <h1 class="app-title">今天吃什么</h1>
        <div class="time-info">
          <span class="time-badge" :class="getTimeSlotClass(currentTimeSlot)">
            {{ currentTimeSlotName }}
          </span>
          <span class="time-text">{{ currentTimeText }}</span>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 初始状态：显示打开按钮 -->
      <div v-if="!showRecommendation && !loading" class="open-button-container">
        <button @click="handleOpen" class="open-button">
          <div class="open-button-icon">🍽️</div>
          <div class="open-button-text">今天吃什么？</div>
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">正在为你挑选...</p>
      </div>

      <!-- 推荐卡片 -->
      <div v-else-if="currentRecommendation" class="recommendation-card">
        <h2 class="recommendation-title">
          今天的推荐方案（已为你想好）
        </h2>

        <!-- 主方案 -->
        <div class="option-card main-option">
          <div class="option-label">主方案</div>
          <div class="option-content">
            {{ currentRecommendation.main }}
          </div>
        </div>

        <!-- 备选 -->
        <div class="option-card alternative-option">
          <div class="option-label">备选</div>
          <div class="option-content">
            {{ currentRecommendation.backup }}
          </div>
        </div>

        <!-- 再懒一点 -->
        <div class="option-card lazy-option">
          <div class="option-label">再懒一点</div>
          <div class="option-content">
            {{ currentRecommendation.lazy }}
          </div>
        </div>

        <!-- 情绪价值语句 -->
        <div class="emotion-text">
          <p>{{ currentRecommendation.emotion }}</p>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="handleRefresh"
          :disabled="hasRefreshed || loading"
          class="refresh-button"
          :class="{ disabled: hasRefreshed || loading }"
        >
          <span v-if="!hasRefreshed">换一个</span>
          <span v-else>再换就饿了</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { initDB, initFoods, getTodayRecommendation, getCurrentTimeSlot, getTimeSlotName } from './db.js'
import { 
  getTodayStats, 
  hasRefreshedToday, 
  markRefreshedToday, 
  updateTodayStats, 
  getDeviceId,
  hasViewedToday,
  markViewedToday,
  getTodaySavedRecommendation,
  saveTodayRecommendation
} from './utils.js'
import { 
  initAnalytics, 
  trackPageView, 
  trackRecommendationLoaded, 
  trackRecommendationRefreshed 
} from './analytics.js'

const currentRecommendation = ref(null)
const loading = ref(false)
const currentTimeSlot = ref(getCurrentTimeSlot())
const todayStats = ref(getTodayStats())
const hasRefreshed = ref(false)
const showRecommendation = ref(false) // 是否显示推荐

// 初始化 device_id
getDeviceId()

const currentTimeSlotName = computed(() => {
  return getTimeSlotName(currentTimeSlot.value)
})

const currentTimeText = computed(() => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
})

// 获取时间段样式类
function getTimeSlotClass(slot) {
  return `time-badge-${slot}`
}

// 处理打开按钮点击
async function handleOpen() {
  loading.value = true
  showRecommendation.value = true
  
  try {
    // 更新当前时间段
    currentTimeSlot.value = getCurrentTimeSlot()
    
    // 检查是否已经查看过（如果有保存的推荐，直接使用）
    const savedRecommendation = getTodaySavedRecommendation(currentTimeSlot.value)
    if (savedRecommendation) {
      currentRecommendation.value = savedRecommendation
      hasRefreshed.value = hasRefreshedToday(currentTimeSlot.value)
      loading.value = false
      return
    }
    
    // 检查是否已刷新
    hasRefreshed.value = hasRefreshedToday(currentTimeSlot.value)
    
    // 获取推荐
    const recommendation = await getTodayRecommendation(currentTimeSlot.value)
    currentRecommendation.value = recommendation
    
    // 保存推荐
    saveTodayRecommendation(currentTimeSlot.value, recommendation)
    
    // 标记已查看
    markViewedToday(currentTimeSlot.value)
    
    // 追踪推荐加载事件
    trackRecommendationLoaded(currentTimeSlot.value)
    
    // 更新统计
    updateTodayStats(currentTimeSlot.value, false)
    todayStats.value = getTodayStats()
  } catch (error) {
    console.error('Failed to load recommendation:', error)
    alert('加载失败，请刷新页面重试')
    showRecommendation.value = false
  } finally {
    loading.value = false
  }
}

// 加载推荐（已废弃，改为 handleOpen）
async function loadRecommendation() {
  // 不再自动加载，改为手动点击按钮
}

// 处理刷新
async function handleRefresh() {
  if (hasRefreshed.value) {
    return
  }
  
  loading.value = true
  try {
    // 获取新的推荐
    const recommendation = await getTodayRecommendation(currentTimeSlot.value)
    currentRecommendation.value = recommendation
    
    // 保存新的推荐
    saveTodayRecommendation(currentTimeSlot.value, recommendation)
    
    // 标记已刷新
    markRefreshedToday(currentTimeSlot.value)
    hasRefreshed.value = true
    
    // 追踪刷新事件
    trackRecommendationRefreshed(currentTimeSlot.value)
    
    // 更新统计
    todayStats.value = getTodayStats()
  } catch (error) {
    console.error('Failed to refresh:', error)
    alert('刷新失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // 初始化分析工具
    initAnalytics()
    
    // 追踪页面浏览
    trackPageView()
    
    // 初始化数据库
    await initDB()
    await initFoods()
    
    // 检查是否已经查看过（如果有保存的推荐，自动显示）
    const currentTimeSlotValue = getCurrentTimeSlot()
    currentTimeSlot.value = currentTimeSlotValue
    
    const savedRecommendation = getTodaySavedRecommendation(currentTimeSlotValue)
    if (savedRecommendation) {
      currentRecommendation.value = savedRecommendation
      hasRefreshed.value = hasRefreshedToday(currentTimeSlotValue)
      showRecommendation.value = true
    }
  } catch (error) {
    console.error('Initialization error:', error)
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #FAFAFA;
}

.header {
  background-color: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin: 0;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.time-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.time-badge-breakfast {
  background-color: #FED7AA;
  color: #9A3412;
}

.time-badge-lunch {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.time-badge-dinner {
  background-color: #E9D5FF;
  color: #6B21A8;
}

.time-text {
  font-size: 0.875rem;
  color: #6B7280;
}

.main-content {
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 120px);
}

.open-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.open-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.open-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.open-button:hover::before {
  width: 300px;
  height: 300px;
}

.open-button:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(79, 70, 229, 0.4);
}

.open-button:active {
  transform: scale(0.98);
}

.open-button-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.open-button-text {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 2px solid #E5E7EB;
  border-top-color: #4F46E5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #6B7280;
}

.recommendation-card {
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.recommendation-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  text-align: center;
}

.option-card {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.main-option {
  background-color: #EFF6FF;
  border-left-color: #3B82F6;
}

.alternative-option {
  background-color: #FEF3C7;
  border-left-color: #F59E0B;
}

.lazy-option {
  background-color: #F3F4F6;
  border-left-color: #6B7280;
}

.option-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  color: #6B7280;
}

.option-content {
  font-size: 0.9375rem;
  color: #111827;
  font-weight: 500;
  line-height: 1.5;
}

.emotion-text {
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
  text-align: center;
  margin-top: 1rem;
}

.emotion-text p {
  font-size: 0.875rem;
  color: #6B7280;
  font-style: italic;
  margin: 0;
}

.refresh-button {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: #4F46E5;
  color: #FFFFFF;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover:not(.disabled) {
  background-color: #4338CA;
}

.refresh-button.disabled {
  background-color: #D1D5DB;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .main-content {
    padding: 1rem 0.75rem;
    min-height: calc(100vh - 100px);
  }
  
  .open-button {
    width: 160px;
    height: 160px;
  }
  
  .open-button-icon {
    font-size: 3rem;
  }
  
  .open-button-text {
    font-size: 1rem;
  }
  
  .recommendation-card {
    padding: 1.25rem;
  }
}
</style>
