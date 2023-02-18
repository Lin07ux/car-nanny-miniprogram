import { getMemberList } from '../../services/member'

Page({
  data: {
    keyword: '',
    reload: true,
    members: {
      list: <object[]>[],
      lastId: 0,
      isEnd: false,
    },
  },
  onLoad(query : { keyword?: string }) {
    this.setData({ keyword: query.keyword || '' })
  },
  onShow() {
    if (this.data.reload) {
      this.loadMembers(this.data.keyword, this.data.members.lastId)
    }
  },
  onPullDownRefresh() {
    this.loadMembers(this.data.keyword)
  },
  onReachBottom: function() {
    this.loadMembers(this.data.keyword, this.data.members.lastId)
  },
  inputKeyword(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value || '' })
  },
  search(e: WechatMiniprogram.InputConfirm) {
    this.setData({ keyword: e.detail.value || '' })
    this.loadMembers(this.data.keyword)
  },
  loadMembers(keyword: string, lastId: number = 0) {
    wx.showLoading({ title: '' })
    getMemberList(keyword, lastId)
      .then(res => {
        const list = lastId > 0 ? this.data.members.list : []
        const members = {
          list: list.concat(res.list),
          lastId: res.lastId || 0,
          isEnd: res.isEnd || false,
        }
        this.setData({ members, reload: false })
        wx.hideLoading()
      })
      .catch((err: IHttpError) => {
        wx.hideLoading()
        wx.showToast({ title: err.message, icon: "error" })
        this.setData({ reload: true })
      })
  },
  gotoMemberForm() {
    wx.navigateTo({
      url: `/pages/member/form/form?keyword=${this.data.keyword}`,
      events: {
        created: () => { // 用户创建成功
          this.setData({
            reload: true,
            'members.lastId': 0,
          })
        },
      },
    })
  },
})
