// 生成或获取 device_id（用于匿名分析）
// device_id 存储在 localStorage，用于统计唯一设备数
export function getDeviceId() {
  let id = localStorage.getItem('device_id')
  if (!id) {
    // 生成UUID v4
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    localStorage.setItem('device_id', id)
    
    // 记录 device_id 创建时间
    localStorage.setItem('device_id_created', new Date().toISOString())
  }
  return id
}

// 获取 device_id 创建日期（用于统计不同日期的 device_id）
export function getDeviceIdCreatedDate() {
  const created = localStorage.getItem('device_id_created')
  if (created) {
    return new Date(created).toISOString().split('T')[0]
  }
  return getTodayString()
}

// 兼容旧接口
export function getAnonymousId() {
  return getDeviceId()
}

// 获取今天的日期字符串（YYYY-MM-DD）
export function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

// 获取今天的统计信息
export function getTodayStats() {
  const today = getTodayString()
  const statsKey = `stats_${today}`
  const stats = JSON.parse(localStorage.getItem(statsKey) || '{}')
  
  return {
    count: stats.count || 0,
    breakfast: stats.breakfast || false,
    lunch: stats.lunch || false,
    dinner: stats.dinner || false
  }
}

// 更新今天的统计信息
export function updateTodayStats(mealType, hasRefreshed = false) {
  const today = getTodayString()
  const statsKey = `stats_${today}`
  const stats = getTodayStats()
  
  stats.count = (stats.count || 0) + 1
  stats[mealType] = hasRefreshed
  
  localStorage.setItem(statsKey, JSON.stringify(stats))
}

// 检查今天该餐次是否已刷新
export function hasRefreshedToday(mealType) {
  const today = getTodayString()
  const refreshKey = `refreshed_${today}_${mealType}`
  return localStorage.getItem(refreshKey) === 'true'
}

// 标记今天该餐次已刷新
export function markRefreshedToday(mealType) {
  const today = getTodayString()
  const refreshKey = `refreshed_${today}_${mealType}`
  localStorage.setItem(refreshKey, 'true')
}

// 检查今天该餐次是否已查看过推荐
export function hasViewedToday(mealType) {
  const today = getTodayString()
  const viewKey = `viewed_${today}_${mealType}`
  return localStorage.getItem(viewKey) === 'true'
}

// 标记今天该餐次已查看
export function markViewedToday(mealType) {
  const today = getTodayString()
  const viewKey = `viewed_${today}_${mealType}`
  localStorage.setItem(viewKey, 'true')
}

// 获取今天该餐次已保存的推荐（如果有）
export function getTodaySavedRecommendation(mealType) {
  const today = getTodayString()
  const saveKey = `recommendation_${today}_${mealType}`
  const saved = localStorage.getItem(saveKey)
  return saved ? JSON.parse(saved) : null
}

// 保存今天该餐次的推荐
export function saveTodayRecommendation(mealType, recommendation) {
  const today = getTodayString()
  const saveKey = `recommendation_${today}_${mealType}`
  localStorage.setItem(saveKey, JSON.stringify(recommendation))
}
