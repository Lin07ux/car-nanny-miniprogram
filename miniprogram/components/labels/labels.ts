import { getLabelList, createLabel } from '../../services/label'

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    selected: {
      type: Array,
      value: [],
    },
  },
  data: {
    loaded: false,
    labels: <Array<{id: number, name: string, selected: boolean}>>[],
    submitting: false,
    focus: false,
    name: '',
  },
  observers: {
    visible: function(visible: boolean) {
      visible && ! this.data.loaded && this.loadLabels()
    },
  },
  methods: {
    loadLabels() {
      wx.showLoading({ title: '获取标签列表' })
      // @ts-ignore
      getLabelList().then((res: Array<{ id: number, name: string }>) => {
        wx.hideLoading()
        this.setData({
          loaded: true,
          labels: res.map(item => ({ id: item.id, name: item.name, selected: this.data.selected.includes(item.id) })),
        })
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '获取标签失败', icon: 'error' })
      })
    },
    handeLabelClick(e: WechatMiniprogram.CustomEvent) {
      const { index } = e.currentTarget.dataset
      const label = this.data.labels[index]
  
      this.setData({ [`labels[${index}].selected`]: !label.selected })
    },
    cancel() {
      this.triggerEvent('cancel', {})
    },
    confirm() {
      const selected = this.data.labels.filter(label => label.selected).map(label => ({ id: label.id, name: label.name }))
      this.triggerEvent('confirm', { selected })
    },
    createLabel() {
      if (! this.data.name) {
        return
      }

      this.setData({ submitting: true })
      createLabel(this.data.name).then(res => {
        this.data.labels.push(Object.assign(res, { selected: true }))
        this.setData({ labels: this.data.labels, submitting: false, name: '' })
      }).catch((err: IHttpError) => {
        if (this.data.visible) {
          wx.showToast({ title: err.message })
        }
        this.setData({ submitting: false })
      })
    },
    handleInput(e: WechatMiniprogram.Input) {
      this.setData({ name: e.detail.value || '' })
    },
    handleFocus() {
      this.setData({ focus: true })
    },
    handleBlur() {
      this.setData({ focus: false })
    },
  },
})
