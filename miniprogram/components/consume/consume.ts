import { memberConsume } from '../../services/member'
import { uploadOssImage } from '../../services/aliyun'
import { IMAGE_TYPE_CONSUME, CONSUME_MAINTAIN, CONSUME_RECORD } from '../../constants/common'

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
    washCount: {
      type: Number,
      value: 0,
    },
  },
  data: {
    file: '',
    saved: false,
    isMaintain: false,
  },
  observers: {
    washCount: function(count) {
      this.setData({ isMaintain: count > 0 })
    },
    visible: function (visible) {
      if (! visible && this.data.saved && this.data.file) {
        this.handleDelete()
      }
    }
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
        title: this.data.isMaintain ? '消费确认' : '记录确认',
        content: this.data.isMaintain ? '确认要消费【1 次】该用户的洗车次数吗？' : '确定要记录该车的洗车记录吗？',
        success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
          if (res.confirm) {
            this._doConsume()
          }
        }
      })  
    },
    _doConsume() {
      wx.showLoading({ title: this.data.isMaintain ? '消费洗车次数' : '记录洗车消费' })
      uploadOssImage(IMAGE_TYPE_CONSUME, this.data.file).then(url => {
        const type = this.data.isMaintain ? CONSUME_MAINTAIN : CONSUME_RECORD
        return memberConsume(this.data.memberId, url, type)
      }).then(result => {
        wx.hideLoading()
        this.setData({ saved: true })
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
