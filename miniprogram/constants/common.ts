// 获取小程序当前版本信息
// https://developers.weixin.qq.com/miniprogram/dev/api/open-api/account-info/wx.getAccountInfoSync.html
const { miniProgram: { envVersion } } = wx.getAccountInfoSync();

export const isTrail = envVersion === 'trial'; // 体验版
export const isDevelop = envVersion === 'develop'; // 开发版
export const isProduction = envVersion === 'release'; // 正式版

export const REQUEST_DOMAIN = '/'