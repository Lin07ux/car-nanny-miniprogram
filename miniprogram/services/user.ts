import { getStorageSync, setStorageSync } from "./storage"
import { LOGIN } from "../constants/apis"
import { post } from "../utils/http"

const STORAGE_KEY = 'user'

class User {
  #name: string = '';
  #token: string = '';
  #openid: string = '';

  constructor() {
    const storage = getStorageSync(STORAGE_KEY) || {}
    const { name, token, nickname, expireAt = 0 } = storage

    if (expireAt > Date.now()) {
      this.#name = name || ''
      this.#token = token || ''
      this.#openid = nickname || ''
    }
  }

  get name(): string {
    return this.#name
  }

  get token() : string {
    return this.#token
  }

  get openid() : string {
    return this.#openid
  }

  login(account: string, password: string): Promise<{ success: boolean, message: string }> {
    return this.getWxLoginCode()
      .then(res => post(LOGIN, { account, password, code: res.code }))
      .then(res => {
        this.#name = res.name || ''
        this.#token = res.token || ''
        this.#openid = res.openid || ''

        this.storeLoginData(res.expireAt || 3600)

        return Promise.resolve({ success: true, message: '登录成功' })
      }).catch(err => {
        return Promise.resolve({ success: false, message: err.message })
      })
  }

  private getWxLoginCode(): Promise<{ code: string, message: string }> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => resolve({ code: res.code, message: '获取成功' }),
        fail: err => reject({ code: '', message: err.errMsg }),
      })
    })
  }

  private storeLoginData(expireAt: number): void {
    setStorageSync(STORAGE_KEY, {
      name: this.#name,
      token: this.#token,
      openid: this.#openid,
      expireAt: Date.now() + expireAt * 1000,
    })
  }
}

export default new User()