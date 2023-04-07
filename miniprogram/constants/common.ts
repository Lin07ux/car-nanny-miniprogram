// 获取小程序当前版本信息
// https://developers.weixin.qq.com/miniprogram/dev/api/open-api/account-info/wx.getAccountInfoSync.html
const { miniProgram: { envVersion } } = wx.getAccountInfoSync();

export const isTrail = envVersion === 'trial'; // 体验版
export const isDevelop = envVersion === 'develop'; // 开发版
export const isProduction = envVersion === 'release'; // 正式版

// API 接口域名
const DOMAINS = {
  'trial': 'https://www.zmfly.top',
  'release': 'https://www.zmfly.top',
  'develop': 'http://car-nanny.lin07ux.dev',
}
export const REQUEST_DOMAIN = `${DOMAINS[envVersion]}/car/`

export const IMAGE_TYPE_CAR_LICENSE = 'car-license' // 车牌
export const IMAGE_TYPE_CAR_VIN = 'car-vin' // 车架号
export const IMAGE_TYPE_CONSUME = 'consume' // 消费

export const CONSUME_MAINTAIN = 'maintain' // 洗车消费
export const CONSUME_RECORD = 'record' // 洗车记录