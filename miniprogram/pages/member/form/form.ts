import { formatDate } from '../../../utils/util'
import { uploadImage } from '../../../services/uploader'
import { createMember } from '../../../services/member'

type uploaderFile = {
  url: string,
  href: string,
  error: boolean,
  loading: boolean,
}

const carLicenseNoPattern = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/

Page({
  data: {
    error: '',
    today: formatDate(),
    visible: false,
    images: {
      car: <uploaderFile[]>[],
      vin: <uploaderFile[]>[],
    },
    labels: [],
    form: {
      name: '',
      birthday: '',
      tel: '',
      carLicenseNo: '',
      labelIds: '',
      car: '',
      vin: '',
    },
    rules: [
      {
        name: 'name',
        rules: { required: true, message: '请输入会员名称' },
      }, {
        name: 'birthday',
        rules: { required: true, message: '请选择会员生日' },
      }, {
        name: 'tel',
        rules: [
          { required: true, message: '请输入会员手机号码' },
          { mobile: true, message: '请输入正确的大陆手机号' },
        ],
      }, {
        name: 'carLicenseNo',
        rules: {
          validator: function(_rule: any, value: string, _param: any, _modeels: any): string {
            if (!value || value.length < 7) {
              return '请输入完整的车牌号码'
            }
            if (!carLicenseNoPattern.test(value)) {
              return '请输入有效的车牌号码'
            }
            return ''
          }
        },
      }, {
        name: 'labelIds',
        rules: { required: true, message: '请选择车主标签' }
      }, {
        name: 'car',
        rules: { required: true, message: '请设置车型图片' }
      }, {
        name: 'vin',
        rules: { required: true, message: '请设置车架号图片' }
      },
    ],
  },
  onLoad(query : { keyword?: string }) {
    const keyword = (query.keyword || '').trim()

    if (keyword) {
      if (carLicenseNoPattern.test(keyword)) {
        this.data.form.carLicenseNo = keyword
      } else if (/^1[3-9]\d{9}$/.test(keyword)) {
        this.data.form.tel = keyword
      }
    }
  },
  formInput(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },
  handleSelect(e: WechatMiniprogram.CustomEvent) {
    const { field } = e.currentTarget.dataset
    const detail = e.detail as { tempFilePaths: string[], tempFiles: object[] }

    if (detail.tempFilePaths.length) {
      const url = detail.tempFilePaths[0] || ''
      const file = url ? <uploaderFile>{url, href: '', error: false, loading: false} : null

      this.setData({
        [`images.${field}`]: url ? [file] : [],
        [`form.${field}`]: url,
      })
    }
  },
  handleDelete(e: WechatMiniprogram.CustomEvent) {
    const { field } = e.currentTarget.dataset

    this.setData({
      [`images.${field}`]: [],
      [`form.${field}`]: '',
    })
  },
  handleLabelShow() {
    this.setData({ visible: true })
  },
  handleLabelCancel() {
    this.setData({ visible: false })
  },
  handleLabelConfirm(e: WechatMiniprogram.CustomEvent) {
    const { selected } = e.detail

    this.setData({
      visible: false,
      labels: selected,
      'form.labelIds': selected.map((label: { id: number }) => label.id)
    })
  },
  submit() {
    this.selectComponent('#form').validate((valid: boolean, errors: Array<{ message: string }>) => {
      if (!valid) {
        return this.setData({ error: errors[0]?.message || '完善表单信息后再提交' })
      }

      wx.showLoading({ title: '上传图片中' })
      Promise.all([this._uploadImage('car'), this._uploadImage('vin')])
        .then(() => {
          wx.showLoading({ title: '提交创建中' })
          return createMember(this.data.form)
        }).then((res: { id: number }) => {
          this.getOpenerEventChannel()?.emit('created')
          wx.showToast({ title: '创建成功', icon: 'success' })
          setTimeout(() => wx.redirectTo({ url: `/pages/member/detail/detail?id=${res.id}` }), 600)
        }).catch((err: IHttpError) => {
          this.setData({ error: err.message })
          wx.hideLoading()
        })
    })
  },
  _uploadImage(type: 'car'|'vin'): any {
    const image = this.data.images[type][0] || {}
    if (!image.url || image.href) {
      return true
    }

    image.loading = true
    this.setData({ [`images.${type}`]: [image] })

    return uploadImage(type, image.url)
      .then((res: { url: string, path: string }) => {
        image.href = res.url
        image.loading = false

        this.setData({
          [`images.${type}`]: [image],
          [`form.${type}`]: res.path,
        })
      })
      .catch((err: IHttpError) => {
        image.loading = false
        image.error = true

        this.setData({ [`images.${type}`]: [image] })

        throw err
      })
  },
})