import { IMAGE_TYPE_CAR_LICENSE } from '../../constants/common'
import { uploadOssImage, recognizeLicensePlate } from '../../services/aliyun'

Component({
  properties: {
    size: {
      type: Number,
      value: 25,
    }
  },
  data: {
    _context: <WechatMiniprogram.CameraContext|null>null,
    showCamera: false,
    showImage: false,
    image: '',
  },
  methods: {
    handleClick() {
      this.setData({
        showCamera: true,
        showImage: false,
        image: '',
      })
    },
    handleCancel() {
      this.setData({ showCamera: false })
    },
    takePhoto() {
      this._getCameraContext().takePhoto({
        quality: "normal",
        fail: () => wx.showToast({ title: '拍照失败', icon: 'none' }),
        success: (res : WechatMiniprogram.TakePhotoSuccessCallbackResult) => {
          this.setData({ showImage: true, image: res.tempImagePath })
          this._recognize(res.tempImagePath)
        },
      })
    },
    _getCameraContext(): WechatMiniprogram.CameraContext {
      if (! this.data._context) {
        this.data._context = wx.createCameraContext()
      }
      return this.data._context
    },
    _recognize(file: string) {
      wx.showLoading({ title: '车牌识别中' })
      uploadOssImage(IMAGE_TYPE_CAR_LICENSE, file).then(async (url: string) => {
        const result = await recognizeLicensePlate(url)
        this.triggerEvent('recognized', { url, ...result })
        setTimeout(() => this.setData({ showCamera: false }), 500)
        wx.hideLoading()
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({ title: err.message || '车牌识别失败', icon: 'none', duration: 3000 })
        this.setData({ showImage: false, image: '' })
      })
    },
  }
})
