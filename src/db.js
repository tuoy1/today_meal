import recipeData from './recipe.json'

const DB_NAME = 'WhatToEatDB'
const DB_VERSION = 5  // 升级版本号以适配新数据结构
const STORE_NAME = 'meals'

let db = null

// 根据当前时间判断时间段（新规则：早餐6-10，午餐11-14，晚餐17-20）
export function getCurrentTimeSlot() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour <= 10) {
    return 'breakfast'  // 早餐 6-10
  } else if (hour >= 11 && hour <= 14) {
    return 'lunch'      // 午餐 11-14
  } else if (hour >= 17 && hour <= 20) {
    return 'dinner'     // 晚餐 17-20
  } else {
    // 其他时间根据最近的时间段判断
    if (hour < 6 || hour > 20) {
      return 'dinner'  // 深夜或凌晨默认晚餐
    } else if (hour < 11) {
      return 'breakfast'  // 10点后到11点前，显示早餐
    } else {
      return 'lunch'  // 14点后到17点前，显示午餐
    }
  }
}

// 获取时间段中文名称
export function getTimeSlotName(timeSlot) {
  const names = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐'
  }
  return names[timeSlot] || '晚餐'
}

// 初始化数据库
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      const oldVersion = event.oldVersion
      
      // 删除旧的数据存储（如果存在）
      if (oldVersion < 5 && database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME)
      }
      
      // 创建菜品数据存储
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('mealType', 'mealType', { unique: false })
      }
    }
  })
}

// 初始化数据
export function initFoods() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const countRequest = store.count()

    countRequest.onsuccess = () => {
      const shouldReimport = countRequest.result === 0 || countRequest.result < 50
      
      if (shouldReimport) {
        if (countRequest.result > 0) {
          console.log('Clearing old data and reimporting...')
          const clearRequest = store.clear()
          clearRequest.onsuccess = () => {
            importMeals(store, resolve, reject)
          }
          clearRequest.onerror = () => reject(clearRequest.error)
        } else {
          importMeals(store, resolve, reject)
        }
      } else {
        console.log('Database already has', countRequest.result, 'meals')
        resolve()
      }
    }
    
    function importMeals(store, resolve, reject) {
      let dataArray = []
      try {
        dataArray = Array.isArray(recipeData) ? recipeData : []
        console.log('Loading recipe data, count:', dataArray.length)
      } catch (e) {
        console.error('Failed to parse recipe data:', e)
        reject(e)
        return
      }
      
      if (dataArray.length === 0) {
        console.warn('No recipe data found')
        resolve()
        return
      }
      
      const meals = dataArray.map(item => ({
        id: item.id,
        mealType: item.mealType,
        main: item.main,
        backup: item.backup,
        lazy: item.lazy,
        emotion: item.emotion
      }))

      console.log('Importing meals, count:', meals.length)
      const addPromises = meals.map(meal => {
        return new Promise((resolve, reject) => {
          const addRequest = store.add(meal)
          addRequest.onsuccess = () => resolve()
          addRequest.onerror = () => {
            console.error('Failed to add meal:', meal.id, addRequest.error)
            reject(addRequest.error)
          }
        })
      })
      Promise.all(addPromises).then(() => {
        console.log('Meals imported successfully')
        resolve()
      }).catch(reject)
    }
    countRequest.onerror = () => reject(countRequest.error)
  })
}

// 获取当前餐次的推荐（随机选择）
export function getTodayRecommendation(mealType) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('mealType')
    const request = index.getAll(mealType)

    request.onsuccess = () => {
      const meals = request.result
      if (meals.length === 0) {
        reject(new Error(`No meals available for ${mealType}`))
        return
      }
      
      // 随机选择一个
      const randomIndex = Math.floor(Math.random() * meals.length)
      const selectedMeal = meals[randomIndex]
      
      resolve({
        id: selectedMeal.id,
        main: selectedMeal.main,
        backup: selectedMeal.backup,
        lazy: selectedMeal.lazy,
        emotion: selectedMeal.emotion
      })
    }

    request.onerror = () => reject(request.error)
  })
}
