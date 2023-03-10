import { formatDate } from '../../../utils/util'
import { uploadImage } from '../../../services/uploader'
import { createMember, getMemberDetail, updateMember } from '../../../services/member'

type uploaderFile = {
  url: string,
  href: string,
  error: boolean,
  loading: boolean,
}

const carLicenseNoPattern = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳使领]))$/

Page({
  data: {
    _id: 0,
    error: '',
    today: formatDate(),
    visible: false,
    images: {
      car: <uploaderFile[]>[],
      vin: <uploaderFile[]>[],
    },
    labels: <{id: number, name: string}[]>[],
    form: {
      name: '',
      birthday: '',
      tel: '',
      carLicenseNo: '',
      labelIds: <number[]>[],
      car: '',
      vin: '',
    },
    rules: [
      {
        name: 'carLicenseNo',
        rules: {
          validator: function(_rule: any, value: string, _param: any, _modeels: any): string {
            if (value) {
              if (value.length < 7) {
                return '请输入完整的车牌号码'
              }
              if (!carLicenseNoPattern.test(value)) {
                return '请输入有效的车牌号码'
              }
            }
            return ''
          }
        },
      }, {
        name: 'tel',
        rules: [
          { required: true, message: '请输入会员手机号码' },
          { mobile: true, message: '请输入正确的大陆手机号' },
        ],
      }, {
        name: 'car',
        rules: { required: true, message: '请设置车型图片' }
      },
    ],
  },
  onLoad(query : { id?: number, keyword?: string }) {
    const id = +(query.id || 0)
    if (id > 0) {
      wx.setNavigationBarTitle({ title: '会员编辑' })
      this.setData({ _id: id })
      this._loadMemberDetail()
      return
    }

    const keyword = (query.keyword || '').trim()
    if (keyword) {
      if (carLicenseNoPattern.test(keyword)) {
        this.data.form.carLicenseNo = keyword
      } else if (/^1[3-9]\d{9}$/.test(keyword)) {
        this.data.form.tel = keyword
      }
    }
  },
  _loadMemberDetail() {
    wx.showLoading({ title: '' })
    getMemberDetail(this.data._id).then(res => {
      const car = []
      if (res.photos.car) {
        car.push({ url: res.photos.car, href: res.photos.car, error: false, loading: false })
      }

      const vin = []
      if (res.photos.vin) {
        vin.push({ url: res.photos.vin, href: res.photos.vin, error: false, loading: false })
      }

      this.setData({
        labels: res.labels,
        images: { car, vin },
        form: {
          tel: res.tel,
          name: res.name,
          birthday: res.profile.birthday,
          carLicenseNo: res.carLicenseNo,
          labelIds: res.labels.map(label => label.id),
          car: res.photos.car || '',
          vin: res.photos.vin || '',
        },
      })
      wx.hideLoading()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
    })
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
      const file = url ? {url, href: '', error: false, loading: false} : null

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

      const isUpdate = this.data._id > 0
      wx.showLoading({ title: '上传图片中' })
      Promise.all([this._uploadImage('car'), this._uploadImage('vin')])
        .then(() => {
          wx.showLoading({ title: '提交创建中' })
          return isUpdate ? updateMember(this.data._id, this.data.form) : createMember(this.data.form)
        }).then((res: { id?: number }) => {
          if (isUpdate) {
            this.getOpenerEventChannel()?.emit('updated')
            wx.showToast({ title: '保存成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1000)
          } else {
            this.getOpenerEventChannel()?.emit('created')
            wx.showToast({ title: '创建成功', icon: 'success' })
            setTimeout(() => wx.redirectTo({ url: `/pages/member/detail/detail?id=${res.id}` }), 600)
          } 
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
          [`form.${type}`]: res.url,
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