import { memberRecharge } from '../../services/member'

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    memberId: {
      type: Number,
      value: 0,
    },
    memberName: {
      type: String,
      value: '',
    },
  },
  data: {
    amount: '',
    counts: '',
    desc: '',
  },
  methods: {
    handleInput(e: WechatMiniprogram.Input) {
      this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
    },
    handleRechargeConfirm(e: WechatMiniprogram.FormSubmit) {
      const desc = e.detail.value.desc
      const amount = +this.data.amount
      const counts = +this.data.counts
      if (amount <= 0 || counts <= 0) {
        wx.showToast({ title: '请输入有效的充值金额和充值次数', icon: 'none' })
        return
      }
  
      wx.showModal({
        title: '充值确认',
        content: `确定为该用户充值【${amount}元/${counts}次】洗车次数吗？`,
        confirmText: '充值',
        confirmColor: '#67C23A',
        success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
          if (res.confirm) {
            this._doMemberRecharge(amount, counts, desc)
          }
        }
      })    
    },
    _doMemberRecharge(amount: number, counts: number, desc: string) {
      wx.showLoading({ title: '充值中' })
      memberRecharge(this.data.memberId, {amount, counts, desc}).then(result => {
        wx.hideLoading()
        wx.showToast({ title: '充值成功', icon: 'success' })
        this.setData({ amount: '', counts: '', desc: '' })
        this.triggerEvent('success', { result })
      }).catch((err: IHttpError) => {
        wx.hideLoading()
        wx.showToast({ title: err.message })
      })
    },
    handleRechargeCancel() {
      this.triggerEvent('cancel')
    },
  }
})
