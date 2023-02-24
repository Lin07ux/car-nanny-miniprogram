import { getMemberDetail, getMemberActions, updateMemberLabels, memberRecharge } from '../../../services/member'

Page({
  data: {
    _id: 0,
    _loading: false,
    visible: false,
    selectedIds: <number[]>[],
    recharge: {
      show: false,
      amount: '',
      counts: '',
      desc: '',
    },
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
    console.log(this.data.actions.isEnd, this.data.actions.lastId)
    this.data.actions.isEnd || this._loadActions(this.data.actions.lastId)
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
  _loadActions(lastId: number = 0) {
    wx.showLoading({ title: '' })
    getMemberActions(this.data.detail.id, lastId).then(res => {
      if (lastId > 0) {
        res.list = this.data.actions.list.concat(res.list)
      }
      this.setData({ actions: res })
      wx.hideLoading()
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
  handleRecharge() {
    this.setData({ 'recharge.show': true })
  },
  handleConsume() {
    //
  },
  handleRechargeCancel() {
    this.setData({ 'recharge.show': false })
  },
  handleRechargeConfirm(e: WechatMiniprogram.FormSubmit) {
    const desc = e.detail.value.desc
    const amount = +this.data.recharge.amount
    const counts = +this.data.recharge.counts
    if (amount <= 0 || counts <= 0) {
      wx.showToast({ title: '请输入有效的充值金额和充值次数', icon: 'none' })
      return
    }

    wx.showLoading({ title: '充值中' })
    memberRecharge(this.data.detail.id, {amount, counts, desc}).then(res => {
      this.setData({
        'recharge': { show: false, amount: '', counts: '', desc: '' },
        'detail.canWashCount': res.canWashCount || 0,
        'detail.rechargeMoney' : res.rechargeMoney || 0,
      })
      this._loadActions()
      wx.hideLoading()
      wx.showToast({ title: '充值成功', icon: 'success' })
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message })
    })
  },
  handleInput(e: WechatMiniprogram.Input) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },
  handleAddTag() {
    this.setData({ visible: true })
  },
  handleLabelCancel() {
    this.setData({ visible: false })
  },
  handleLabelConfirm(e: WechatMiniprogram.CustomEvent) {
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