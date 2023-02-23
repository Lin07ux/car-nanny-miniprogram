import { getMemberDetail, getMemberActions } from '../../../services/member'

Page({
  data: {
    loading: false,
    visible: false,
    selectedIds: <number[]>[],
    detail: {
      id: 0,
      tel: '',
      name: '',
      carBodyNo: '',
      carLicenseNo: '',
      canWashCount: 0,
      rechargeMoney: 0,
      profile: { birthday: '' },
      photos: [],
      labels: [],
    },
    actions: {
      lastId: 0,
      isEnd: false,
      list: <object[]>[],
    },
  },
  onLoad(query: { id?: number }) {
    this.loadDetail(+(query.id || 0))
  },
  onPullDownRefresh() {
    this.loadDetail(this.data.detail.id)
  },
  onReachBottom: function() {
    this.data.actions.isEnd || this.loadActions()
  },
  loadDetail(id: number): any {
    if (id <= 0) {
      return wx.showToast({ title: '会员信息不存在', icon: 'error' })
    }

    if (this.data.loading) {
      return
    }

    wx.showLoading({ title: '' })
    this.setData({ loading: true })
    getMemberDetail(id).then(res => {
      wx.hideLoading()
      // @ts-ignore
      this.setData({ detail: res })
      this.loadActions()
      this.setSelectedIds()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'error' })
      setTimeout(() => wx.navigateBack(), 600)
    }).finally(() => this.setData({ loading: false }))
  },
  loadActions() {
    wx.showLoading({ title: '' })
    getMemberActions(this.data.detail.id).then(res => {
      wx.hideLoading()
      this.setData({ actions: res as { lastId: number, isEnd: boolean, list: Array<object> }})
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'error' })
    })
  },
  setSelectedIds() {
    this.setData({ selectedIds: this.data.detail.labels.map((label: { id: number}) => label.id)})
  },
  previewPhotos() {
    wx.previewImage({ urls: this.data.detail.photos })
  },
  callTelphone() {
    wx.makePhoneCall({ phoneNumber: this.data.detail.tel })
  },
  handleAddTag() {
    this.setData({ visible: true })
  },
  handleCancel() {
    this.setData({ visible: false })
  },
  handleConform(e: WechatMiniprogram.CustomEvent) {
    console.log(e)
  },
})