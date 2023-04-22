import { formatDate } from '../../utils/util'
import { shareHomePage } from '../../services/share'
import { getCarWashActions, downloadCarWash } from '../../services/statistics'

Page({
  data: {
    today: '',
    downloading: false,
    actionIndex: 0,
    actionName: '',
    query: {
      actionType: 0,
      startTime: '',
      endTime: '',
    },
    actionTypes: [
      { value: 0, name: '全部记录' },
      { value: 1, name: '洗车-充值' },
      { value: 100, name: '洗车-养护' },
      { value: 101, name: '洗车-记录' },
    ],
    actions: {
      list: <object[]>[],
      lastId: -1,
    },
  },
  onLoad() {
    const today = formatDate()
    this.setData({
      today,
      actionIndex: 0,
      query: {
        actionType: this.data.actionTypes[0].value,
        startTime: today,
        endTime: today,
      },
    })
    this._reloadActions()
  },
  onPullDownRefresh() {
    this._reloadActions()
  },
  onReachBottom() {
    this.data.actions.lastId > 0 && this._loadActions(this.data.actions.lastId)
  },
  onShareAppMessage: shareHomePage,
  _reloadActions() {
    this._loadActions(-1)
  },
  _loadActions(lastId: number) {
    wx.showLoading({ title: '' })
    getCarWashActions(this.data.query, lastId).then(res => {
      if (lastId > 0) {
        res.list = this.data.actions.list.concat(res.list)
      }
      this.setData({ actions: res })
      wx.hideLoading()
    }).catch((err: IHttpError) => {
      wx.hideLoading()
      wx.showToast({ title: err.message, icon:'none' })
    })
  },
  bindDateChange(e: WechatMiniprogram.PickerChange) {
    const value = '' + e.detail.value
    const { field } = e.currentTarget.dataset
    let { startTime, endTime } = this.data.query

    if (field === 'startTime') {
      if (new Date(value) > new Date(endTime)) {
        startTime = endTime
        endTime = value
      } else {
        startTime = value
      }
    } else {
      if (new Date(value) < new Date(startTime)) {
        endTime = startTime
        startTime = value
      } else {
        endTime = value
      }
    }

    this.setData({
      'query.startTime': startTime,
      'query.endTime': endTime,
    })

    this._reloadActions()
  },
  bindActionChange(e: WechatMiniprogram.PickerChange) {
    const index = +e.detail.value
    this.setData({
      actionIndex: index,
      'query.actionType': this.data.actionTypes[index].value,
    })
    this._reloadActions()
  },
  download() {
    if (this.data.downloading) {
      wx.showToast({ title: '下载中，请稍后', icon: 'none' })
      return
    }

    this.setData({ downloading: true })
    downloadCarWash(this.data.query).then(res => {
      wx.downloadFile({
        url: res.url,
        success: (result: WechatMiniprogram.DownloadFileSuccessCallbackResult) => {
          console.log(result.filePath, res)
          wx.showToast({ title: '下载成功', icon: 'success' })
        },
        fail: (error: WechatMiniprogram.GeneralCallbackResult) => {
          throw new Error(error.errMsg)
        },
      })
    }).catch((err: IHttpError|Error) => {
      wx.showToast({ title: err.message, icon: 'none' })
    }).finally(() => this.setData({ downloading: false }))
  },
})