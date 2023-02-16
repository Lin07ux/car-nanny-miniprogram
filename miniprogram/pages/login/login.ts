import { getStorageSync, setStorageSync, delStorageSync } from "../../services/storage"

const user: IUser = getApp().globalData.user
const REMEMBER_KEY: string = 'login_account_remember'

Page({
  data: {
    form: {
      account: getStorageSync(REMEMBER_KEY) || '',
      password: '',
    },
    rules: [
      {
        name: 'account',
        rules: { required: true, message: '请输入账号' },
      }, {
        name: 'password',
        rules: { required: true, message: '请输入密码' },
      },
    ],
    error: '',
    remember: true,
  },
  formInput(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },
  rememberChange(e: WechatMiniprogram.CheckboxGroupChange) {
    this.setData({ remember: !!e.detail.value.length });
  },
  submit() {
    this.selectComponent('#form').validate((valid: boolean, errors: Array<{ message: string }>) => {
      if (!valid) {
        return this.setData({ error: errors[0]?.message || '请填写登录账号和密码' })
      }
      
      wx.showLoading({ title: '' })
      user.login(this.data.form.account, this.data.form.password).then(res => {
        wx.hideLoading()
        if (! res.success) {
          this.setData({ error: res.message || '登录失败' })
        } else {
          wx.showToast({ title: '登录成功' })

          if (this.data.remember) {
            setStorageSync(REMEMBER_KEY, this.data.form.account)
          } else {
            delStorageSync(REMEMBER_KEY)
          }

          // 回退到前一页
          if (getCurrentPages().length > 1) {
            setTimeout(() => wx.navigateBack(), 500)
          }
        }
      })
    })
  },
})