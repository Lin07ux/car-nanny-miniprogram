import { getMemberDetail, getMemberActions, updateMemberLabels } from '../../../services/member'

Page({
  data: {
    _id: 0,
    _loading: false,
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
    this.setData({ _id: query.id || 0 })
  },
  onShow() {
    this._loadDetail()
  },
  onPullDownRefresh() {
    this._loadDetail()
  },
  onReachBottom: function() {
    this.data.actions.isEnd || this._loadActions()
  },
  _loadDetail(): any {
    if (this.data._id <= 0) {
      return wx.showToast({ title: '会员信息不存在', icon: 'error' })
    }

    if (this.data._loading) {
      return
    }

    wx.showLoading({ title: '' })
    this.setData({ _loading: true })
    getMemberDetail(this.data._id).then(res => {
      wx.hideLoading()
      // @ts-ignore
      this.setData({ detail: res })
      this._loadActions()
      this._setSelectedIds()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'error' })
      setTimeout(() => wx.navigateBack(), 600)
    }).finally(() => this.setData({ _loading: false }))
  },
  _loadActions() {
    wx.showLoading({ title: '' })
    getMemberActions(this.data.detail.id).then(res => {
      wx.hideLoading()
      this.setData({ actions: res as { lastId: number, isEnd: boolean, list: Array<object> }})
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'error' })
    })
  },
  _setSelectedIds() {
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
  handleConfirm(e: WechatMiniprogram.CustomEvent) {
    const { selected } = e.detail
    const labelIds = selected.map((label: { id: number }) => label.id)
    
    wx.showLoading({ title: '' })
    updateMemberLabels(this.data.detail.id, labelIds).then(() => {
      this.setData({ visible: false, 'detail.labels': selected })
      wx.hideLoading()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },
})