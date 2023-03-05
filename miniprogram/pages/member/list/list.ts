import { getMemberList } from '../../../services/member'

Page({
  data: {
    type: '',
    keyword: '',
    reload: true,
    members: {
      list: <object[]>[],
      lastId: 0,
      isEnd: false,
    },
  },
  onLoad(query : { keyword?: string, type?: string }) {
    this.setData({
      keyword: query.keyword || '',
      type: query.type || '',
    })
  },
  onShow() {
    this.data.reload && this.loadMembers(this.data.members.lastId)
  },
  onPullDownRefresh() {
    this.loadMembers()
  },
  onReachBottom: function() {
    this.data.members.isEnd || this.loadMembers(this.data.members.lastId)
  },
  inputKeyword(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value || '' })
  },
  search(e: WechatMiniprogram.InputConfirm) {
    this.setData({ keyword: e.detail.value || '' })
    this.loadMembers()
  },
  handeSearch() {
    this.loadMembers()
  },
  loadMembers(lastId: number = 0) {
    wx.showLoading({ title: '' })
    getMemberList(this.data.type, this.data.keyword, lastId)
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
      }).finally(() => wx.stopPullDownRefresh())
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
