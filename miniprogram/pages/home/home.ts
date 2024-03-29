import { getMemberStatistics } from '../../services/member'
import { shareHomePage } from '../../services/share'

Page({
  data: {
    items: [
      { label: '全部会员', name: 'total' },
      { label: '本月新增', name: 'monthNewly' },
      { label: '消费统计', name: 'actions' },
      { label: '活跃会员', name: 'active' },
      { label: '即将流失', name: 'churn' },
      { label: '待充值会员', name: 'unRecharged' },
    ],
    statistics: {
      total: <number>0,
      monthNewly: <number>0,
      birthday: <number>0,
      active: <number>0,
      churn: <number>0,
      unRecharged: <number>0,
      imprefect: <number>0,
    },
  },
  onShow() {
    this._loadStaistics()
  },
  onPullDownRefresh() {
    this._loadStaistics()
  },
  onShareAppMessage: shareHomePage,
  _loadStaistics() {
    wx.showLoading({ title: '' })
    getMemberStatistics().then(res => {
      this.setData({ statistics: res })
      wx.hideLoading()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'none' })
    }).finally(() => wx.stopPullDownRefresh())
  },
  handleRecognized(e: WechatMiniprogram.CustomEvent) {
    const { id, url, plateNumber } = e.detail

    if (id > 0) {
      wx.navigateTo({ url: `/pages/member/detail/detail?id=${id}&url=${url}`})
    } else {
      wx.navigateTo({ url: `/pages/member/form/form?url=${url}&plateNumber=${plateNumber}` })
    }
  }
})