import { getLabelList, createLabel, updateLabel, deleteLabel } from '../../services/label'

type labelItem = {
  id: number,
  name: string,
  input?: string,
  error?: boolean,
  selected: boolean,
  editing: boolean,
  focusing: boolean,
  submitting: boolean,
}

const _click = {
  timer: 0,
  lastId: 0,
  lastTime: 0,
}

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
    labels: <labelItem[]>[],
  },
  observers: {
    visible: function(visible: boolean) {
      visible && ! this.data.loaded && this.loadLabels()
    },
  },
  methods: {
    cancel() {
      this.triggerEvent('cancel', {})
    },
    confirm() {
      const selected = this.data.labels.filter(label => label.selected).map(label => ({ id: label.id, name: label.name }))
      this.triggerEvent('confirm', { selected })
    },
    loadLabels() {
      // @ts-ignore
      getLabelList().then((res: Array<{ id: number, name: string }>) => {
        const labels = this._formatLabels(res)
        labels.push(this._getCreateItem())
        this.setData({ loaded: true, labels })
      }).catch(() => {
        wx.showToast({ title: '获取标签失败', icon: 'error' })
      })
    },
    _formatLabels(labels: Array<{ id: number, name: string }>): labelItem[] {
      return labels.map(item => {
        return {
          id: item.id,
          name: item.name,
          selected: this.data.selected.includes(item.id),
          editing: false,
          focusing: false,
          submitting: false,
        }
      })
    },
    _getCreateItem(): labelItem {
      return { id: 0, name: '', selected: false, editing: true, focusing: false, submitting: false }
    },
    handlePress(e: WechatMiniprogram.CustomEvent) {
      const { index } = e.currentTarget.dataset
      const label = this.data.labels[index]

      if (label.editing) {
        return
      }

      wx.showModal({
        content: `确定要删除 [${label.name}] 标签吗`,
        confirmText: '删除',
        confirmColor: '#F56C6C',
        cancelColor: '#424243',
        success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => res.confirm && this._deleteLabel(index)
      })
    },
    handeClick(e: WechatMiniprogram.CustomEvent) {
      const { index } = e.currentTarget.dataset
      const label = this.data.labels[index]
      const currentTime = e.timeStamp

      // 创建标签或者已是编辑状态，不处理
      if (label.id <= 0 || label.editing) {
        return
      }

      // 双击：前后点击同一个标签，且间隔不超过 80ms
      // 双击时设置标签为可编辑状态，单击时设置标签的选中状态
      if (_click.lastId === label.id && currentTime - _click.lastTime < 80) {
        clearTimeout(_click.timer)
        this.setData({
          [`labels[${index}]`]: Object.assign(label, { input: label.name, editing: true, focusing: true }),
        })
      } else {
        _click.timer = setTimeout(() => this.setData({ [`labels[${index}].selected`]: !label.selected }), 80)
      }

      _click.lastId = label.id
      _click.lastTime = currentTime
    },
    handleSubmit(e: WechatMiniprogram.InputConfirm) {
      const name = e.detail.value.trim()
      if (! name) {
        return
      }

      const index = e.currentTarget.dataset.index
      const label = this.data.labels[index]
      if (label.name === name) {
        return this.setData({ [`labels[${index}]`]: Object.assign(label, { editing: false, focusing: false }) })
      }

      this.setData({ [`labels[${index}]`]: Object.assign(label, { input: name, submitting: true }) })

      const isEdit = label.id > 0
      const request = isEdit ? updateLabel(label.id, name) : createLabel(name)
      request.then(res => {
        if (! isEdit) {
          this.data.labels.push(this._getCreateItem())
        }
        this.data.labels[index] = Object.assign(label, res, { error: false, editing: false, focusing: false, submitting: false })
        this.setData({ labels: this.data.labels })
      }).catch((err: IHttpError) => {
        if (this.data.visible) {
          wx.showToast({ title: err.message, icon: 'none' })
        }
        this.setData({
          [`labels[${index}]`]: Object.assign(label, { error: true, editing: true, submitting: false }),
        })
      })
    },
    _deleteLabel(index: number) {
      const label = this.data.labels[index]
      
      wx.showLoading({ title: '' })
      deleteLabel(label.id).then(() => {
        wx.hideLoading()
        this.data.labels.splice(index, 1)
        this.setData({ labels: this.data.labels })
      }).catch((err: IHttpError) => {
        wx.hideLoading()
        wx.showToast({ title: err.message })
      })
    },
    handleFocus(e: WechatMiniprogram.InputFocus) {
      const { index } = e.currentTarget.dataset
      const label = this.data.labels[index]

      this.setData({
        [`labels[${index}]`]: Object.assign(label, { focusing: true }),
      })
    },
    handleBlur(e: WechatMiniprogram.InputBlur) {
      const { index } = e.currentTarget.dataset
      const label = this.data.labels[index]

      this.setData({
        [`labels[${index}]`]: Object.assign(label, { editing: label.id <= 0 || label.submitting, focusing: false, error: false }),
      })
    },
  },
})
