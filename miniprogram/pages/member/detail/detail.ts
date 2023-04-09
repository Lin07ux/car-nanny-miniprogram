import { getMemberDetail, getMemberActions, updateMemberLabels, deleteMember } from '../../../services/member'

const ACTION_TYPE_MAINTAIN = 'maintain'
const ACTION_TYPE_RECORD = 'record'
type actionTab = 'maintain' | 'record'

Page({
  data: {
    _id: 0,
    _loading: false,
    visible: false,
    showConsume: false,
    showRecharge: false,
    selectedIds: <number[]>[],
    consumeUrl: '',
    detail: {
      id: 0,
      tel: '',
      name: '',
      carBodyNo: '',
      carLicenseNo: '',
      canWashCount: 0,
      rechargeMoney: 0,
      profile: { birthday: '' },
      photos: <{car?: string, vin?: string}>{},
      labels: <{id: number, name: string}[]>[],
    },
    actions: {
      tab: <actionTab>ACTION_TYPE_MAINTAIN,
      [ACTION_TYPE_MAINTAIN]: {
        lastId: 0,
        isEnd: false,
        list: <{id: number, image: string}[]>[],
      },
      [ACTION_TYPE_RECORD]: {
        lastId: 0,
        isEnd: false,
        list: <{id: number, image: string}[]>[],
      },
    },
  },
  onLoad(query: { id?: number, url?: string }) {
    this.setData({ _id: query.id || 0 })
    this._loadDetail().then(() => {
      // 扫码接车进来直接扣费
      if (this.data.detail.id > 0) {
        this._loadActions()
        if (query.url) {
          this.setData({ consumeUrl: query.url })
          this.handleConsume()
        }
      }
    })
  },
  onPullDownRefresh() {
    this._loadDetail()
  },
  onReachBottom() {
    const type = this.data.actions.tab

    this.data.actions[type].isEnd || this._loadActions(this.data.actions[type].lastId)
  },
  _loadDetail(): Promise<void> {
    if (this.data._id <= 0) {
      wx.showToast({ title: '会员信息不存在', icon: 'error' })
      return Promise.resolve()
    }

    if (this.data._loading) {
      return Promise.resolve()
    }

    wx.showLoading({ title: '' })
    this.setData({ _loading: true })
    
    return getMemberDetail(this.data._id).then(res => {
      this.setData({ detail: res })
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
    const type = this.data.actions.tab

    wx.showLoading({ title: '' })
    getMemberActions(this.data.detail.id, type, lastId).then(res => {
      if (lastId > 0) {
        res.list = this.data.actions[type].list.concat(res.list)
      }
      this.setData({ [`actions.${type}`]: res })
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
    // @ts-ignore
    wx.previewImage({ urls: Object.values(this.data.detail.photos).filter((v?: string) => !!v) })
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
    this.setData({ showConsume: true })
  },
  handleConsumeCancel() {
    this.setData({ showConsume: false })
  },
  handleConsumeSuccess(e: WechatMiniprogram.CustomEvent) {
    const { canWashCount, isMaintain } = e.detail
    this.setData({
      showConsume: false,
      'detail.canWashCount': canWashCount,
    })

    this.setData({ 'actions.tab': isMaintain ? ACTION_TYPE_MAINTAIN : ACTION_TYPE_RECORD })
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
  previewConsumeImage(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset
    const action = this.data.actions[this.data.actions.tab].list[index] || null
    if (action && action.image) {
      wx.previewImage({ urls: [action.image] })
    }
  },
  onActionTabChange(e: WechatMiniprogram.CustomEvent) {
    const { value } = e.detail

    this.setData({ 'actions.tab': value })
    this._loadActions()
  },
})