import { getMemberList } from '../../services/member'

Page({
  data: {
    keyword: '',
    retry: false,
    members: {
      list: <object[]>[],
      lastId: 0,
      isEnd: false,
    },
  },
  onLoad(query : { keyword?: string }) {
    this.setData({ keyword: query.keyword || '' })
    this.search()
  },
  onShow() {
    if (this.data.retry) {
      this.search()
    }
  },
  inputKeyword(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value || '' })
  },
  search(e?: WechatMiniprogram.InputConfirm) {
    if (e) {
      this.setData({ keyword: e.detail.value || '' })
    }

    wx.showLoading({ title: '' })
    getMemberList(this.data.keyword, this.data.members.lastId)
      .then(res => {
        const members = {
          list: this.data.members.list.concat(res.list),
          lastId: res.lastId || 0,
          isEnd: res.isEnd || false,
        }
        this.setData({ members, loaded: true })
        wx.hideLoading()
      })
      .catch((err: IHttpError) => {
        wx.hideLoading()
        wx.showToast({ title: err.message, icon: "error" })
        this.setData({ retry: true })
      })
  },
})
