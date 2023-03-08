import { getMemberDetail, getMemberActions, updateMemberLabels, deleteMember } from '../../../services/member'

Page({
  data: {
    _id: 0,
    _loading: false,
    visible: false,
    showConsume: false,
    showRecharge: false,
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
      photos: <{car: string, vin: string}>{},
      labels: <{id: number, name: string}[]>[],
    },
    actions: {
      lastId: 0,
      isEnd: false,
      list: <object[]>[],
    },
  },
  onLoad(query: { id?: number }) {
    this.setData({ _id: query.id || 0 })
    this._loadDetail()
  },
  onPullDownRefresh() {
    this._loadDetail()
  },
  onReachBottom: function() {
    this.data.actions.isEnd || this._loadActions(this.data.actions.lastId)
  },
  _loadDetail() {
    if (this.data._id <= 0) {
      wx.showToast({ title: '会员信息不存在', icon: 'error' })
      return
    }

    if (this.data._loading) {
      return
    }

    wx.showLoading({ title: '' })
    this.setData({ _loading: true })
    getMemberDetail(this.data._id).then(res => {
      this.setData({ detail: res })
      this._loadActions()
      this._setSelectedIds()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'error' })
      setTimeout(() => wx.navigateBack(), 600)
    }).finally(() => {
      this.setData({ _loading: false })
      wx.stopPullDownRefresh()
    })
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
    wx.previewImage({ urls: Object.values(this.data.detail.photos) })
  },
  callTelphone() {
    wx.makePhoneCall({ phoneNumber: this.data.detail.tel })
  },
  handleMoreActions() {
    wx.showActionSheet({
      alertText: '会员管理',
      itemList: ['编辑会员信息', '删除会员'],
      itemColor: '#363637',
      success: (res: WechatMiniprogram.ShowActionSheetSuccessCallbackResult) => {
        if (res.tapIndex === 0) {
          this._editMemberInfo()
        } else if (res.tapIndex === 1) {
          this._deleteMember()
        }
      },
    })    
  },
  _editMemberInfo() {
    wx.navigateTo({
      url: '/pages/member/form/form?id='+this.data.detail.id,
      events: {
        updated: () => this._loadDetail(),
      },
    })
  },
  _deleteMember() {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除该会员信息吗？',
      confirmText: '删除',
      confirmColor: '#F56C6C',
      success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
        if (res.confirm) {
          this._doDeleteMember()
        }
      }
    })    
  },
  _doDeleteMember() {
    wx.showLoading({ title: '' })
    deleteMember(this.data.detail.id).then(() => {
      this._gotoMemberListPage()
      wx.hideLoading()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'none' })
    })
  },
  _gotoMemberListPage() {
    const pages = getCurrentPages()
    const listPage = 'pages/member/list/list'

    if (pages.length >= 2 && pages[pages.length - 2].route === listPage) {
      wx.navigateBack()
    } else {
      wx.redirectTo({ url: '/'+listPage })
    }
  },
  handleRecharge() {
    this.setData({ showRecharge: true })
  },
  handleRechargeCancel() {
    this.setData({ showRecharge: false })
  },
  handleRechargeSuccess(e: WechatMiniprogram.CustomEvent) {
    const { result } = e.detail
    this.setData({
      showRecharge: false,
      'detail.canWashCount': result.canWashCount || 0,
      'detail.rechargeMoney' : result.rechargeMoney || 0,
    })
    this._loadActions()
  },
  handleConsume() {
    if (this.data.detail.canWashCount < 1) {
      wx.showToast({ title: '请先充值再消费', icon: 'none' })
      return
    }

    this.setData({ showConsume: true })
  },
  handleConsumeCancel() {
    this.setData({ showConsume: false })
  },
  handleCinsumeSuccess(e: WechatMiniprogram.CustomEvent) {
    const { canWashCount } = e.detail
    this.setData({
      showConsume: false,
      'detail.canWashCount': canWashCount,
    })
    this._loadActions()
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