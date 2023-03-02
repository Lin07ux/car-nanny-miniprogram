import { getMemberStatistics } from '../../services/member'

Page({
  data: {
    reload: true,
    items: [
      { label: '全部会员', name: 'total' },
      { label: '本月新增', name: 'monthNewly' },
      { label: '当天生日', name: 'birthday' },
      { label: '活跃会员', name: 'active' },
      { label: '即将流失会员', name: 'churn' },
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
    this.data.reload && this._loadStaistics()
  },
  onPullDownRefresh() {
    this._loadStaistics()
  },
  _loadStaistics() {
    wx.showLoading({ title: '' })
    getMemberStatistics().then(res => {
      this.setData({ reload: false, statistics: res })
      wx.hideLoading()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon: 'none' })
      this.setData({ reload: true })
    })
  },
})