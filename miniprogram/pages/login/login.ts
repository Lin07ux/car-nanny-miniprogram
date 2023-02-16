
const user: IUser = getApp().globalData.user

Page({
  data: {
    form: {
      account: '',
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
  },
  formInput(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
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

          // 回退到前一页
          if (getCurrentPages().length > 1) {
            setTimeout(() => wx.navigateBack(), 500)
          }
        }
      })
    })
  },
})