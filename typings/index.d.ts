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
  login(account: string, password: string): Promise<{ success: boolean, message: string }>,
}

interface IHttpError {
  code: number,
  message: string,
}