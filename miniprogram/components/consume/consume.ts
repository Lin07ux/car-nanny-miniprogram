import { memberConsume } from '../../services/member'

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
  },
  data: {
    file: '',
  },
  methods: {
    handleVisibleChange(e: WechatMiniprogram.CustomEvent) {
      e.detail.visible || this.triggerEvent('cancel')
    },
    handleClose() {
      this.triggerEvent('cancel')
    },
    consume() {
      if (! this.data.file) {
        return
      }

      wx.showModal({
        title: '消费确认',
        content: '确认要消费【1 次】该用户的洗车次数吗？',
        success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
          if (res.confirm) {
            this._doConsume()
          }
        }
      })  
    },
    _doConsume() {
      wx.showLoading({ title: '消费洗车次数' })
      memberConsume(this.data.memberId, this.data.file).then(result => {
        wx.hideLoading()
        this.setData({ file: '' })
        this.triggerEvent('success', { canWashCount: result.canWashCount })
      }).catch((err: IHttpError) => {
        wx.hideLoading()
        wx.showToast({ title: err.message, icon: 'none' })
      })
    },
    handleSelect(e: WechatMiniprogram.CustomEvent) {
      const detail = e.detail as { tempFilePaths: string[], tempFiles: object[] }
      if (detail.tempFilePaths.length && detail.tempFilePaths[0]) {
        this.setData({ file: detail.tempFilePaths[0] })
      }
    },
    handleDelete() {
      this.setData({ file: '' })
    },
  }
})
