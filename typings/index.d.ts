/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    user: IUser,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}

interface IUser {
  name: string,
  token: string,
}