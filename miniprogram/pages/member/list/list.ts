import { getMemberList } from '../../../services/member'
import { shareHomePage } from '../../../services/share'

type member = {
  id: number,
  name: string,
  tel: string,
  isVip: boolean,
  carLicenseNo: string,
  cover: string,
  canWashCount: number,
  lastConsumerTime: string,
}

Page({
  data: {
    type: '',
    keyword: '',
    reload: true,
    members: {
      list: <member[]>[],
      lastId: 0,
      isEnd: false,
    },
    recharge: {
      name: '',
      index: -1,
      id: 0,
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
  onShareAppMessage: shareHomePage,
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
  handleRecharge(e: WechatMiniprogram.CustomEvent) {
    const { index } = e.currentTarget.dataset
    const member = this.data.members.list[index]
    this.setData({
      recharge: { index, id: member.id, name: member.carLicenseNo || member.tel || member.name },
    })
  },
  handleRechargeCancel() {
    this.setData({ 'recharge.index': -1 })
  },
  handleRechargeSuccess(e: WechatMiniprogram.CustomEvent) {
    const { result } = e.detail
    const index = this.data.recharge.index
    const member = this.data.members.list[index]

    member.canWashCount = result.canWashCount || 0
    member.isVip = true

    this.setData({
      'recharge.index': -1,
      [`members.list[${index}]`]: member,
    })
  },
})
