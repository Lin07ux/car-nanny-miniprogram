const KEY_CURRENT_USER = 'user';

// 同步获取本地缓存
export const getStorageSync = (key: string): any => {
  try {
    return wx.getStorageSync(key)
  } catch (e) {
    console.error('同步获取 storage 数据失败:', key, e)
    return null
  }
};

// 同步设置本地缓存
export const setStorageSync = (key: string, value: any): void => {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
    console.error('同步设置 storage 数据失败:', key, value, e)
  }
}

// 同步删除本地缓存
export const delStorageSync = (key: string): void => {
  try {
    wx.removeStorageSync(key)
  } catch (e) {
    console.error('同步删除 storage 数据失败:', key, e)
  }
}
