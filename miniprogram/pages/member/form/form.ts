import { formatDate } from '../../../utils/util'
import { createMember, getMemberDetail, updateMember } from '../../../services/member'
import { uploadOssImage } from '../../../services/aliyun'
import { IMAGE_TYPE_CAR_LICENSE, IMAGE_TYPE_CAR_VIN } from '../../../constants/common'
import { shareHomePage } from '../../../services/share'

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
            if (! value || value.length < 7) {
              return '请输入完整的车牌号码'
            }

            if (! carLicenseNoPattern.test(value)) {
              return '请输入有效的车牌号码'
            }

            return ''
          }
        },
      }, {
        name: 'car',
        rules: { required: true, message: '请设置车型图片' }
      },
    ],
  },
  onLoad(query : { id?: number, url?: string, plateNumber?: string }) {
    const id = +(query.id || 0)
    if (id > 0) {
      wx.setNavigationBarTitle({ title: '会员编辑' })
      this.setData({ _id: id })
      this._loadMemberDetail()
      return
    } else {
      if (query.plateNumber) {
        this.setData({
          'form.car': query.url,
          'form.carLicenseNo': query.plateNumber,
          'images.car': [{ url: query.url, href: query.url, error: false, loading: false }]
        })
      }
      wx.showModal({
        title: '提示',
        content: '我方将使用该信息来创建会员账户，关联会员权益，以为用户提供更优质的服务。同意我方使用该信息请点击确认，否则将取消创建。',
        success (res) {
          if (res.cancel) {
            wx.navigateBack()
          }
        }
      })      
    }
  },
  onShareAppMessage: shareHomePage,
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

    const uploadType = type === 'car' ? IMAGE_TYPE_CAR_LICENSE : IMAGE_TYPE_CAR_VIN

    return uploadOssImage(uploadType, image.url).then(url => {
      image.href = url
      image.loading = false

      this.setData({
        [`images.${type}`]: [image],
        [`form.${type}`]: url,
      })
    }).catch((err: IHttpError) => {
      image.loading = false
      image.error = true

      this.setData({ [`images.${type}`]: [image] })

      throw err
    })
  },
})