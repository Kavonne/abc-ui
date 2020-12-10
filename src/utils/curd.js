const merge = require('webpack-merge')
import request from '@/utils/request'
import { success, error, confirm } from '@utils/message'
import { jsonToString, stringToJson } from '@utils/tool'

const defaultData = {
  baseUrl: '',
  ui: {
    form: {
      labelWidth: '128px' // 确保8个字不换行
    },
    page: {
      layout: 'total, prev, pager, next, sizes',
      pageSizes: [10, 20, 50, 100, 200, 500, 1000]
    }
  },
  ue: {
    isSafeMode: true // 是否安全模式：取消或关闭修改过的表单是否需要弹出用户确认框。
  },
  searchForm: {
    data: {
      record: {}
    },
    snapshotForReset: '', // 初始化时的快照，用于表单重置
    snapshotForPage: '', // 点击搜索后对查询表单的快照，以此对比查询表单是否修改，如是则禁用翻页栏。
    isChanged: false
  },
  table: {
    data: [], // 表格数据
    checkedIds: [] // 已选中表格数据的id数组
  },
  page: {
    size: 10,
    current: 1,
    asc: null, // 升序字段
    desc: null, // 降序字段
    total: 0,
    disabled: false
  },
  addForm: {
    visible: false,
    data: {
      record: {}
    },
    snapshotForReset: '',
    rules: {},
    isChanged: false
  },
  editForm: {
    visible: false,
    data: {
      record: {}
    },
    snapshotForReset: '',
    rules: {},
    isChanged: false
  },
  detailForm: {
    visible: false,
    data: {
      record: {}
    }
  },
  references: {}
}
export { defaultData }

const defaultComputed = {
  searchFormDataJson() {
    return jsonToString(this.searchForm.data)
  },
  isTableRowUnChecked() {
    return this.table.checkedIds.length === 0
  },
  addFormDataJson() {
    return jsonToString(this.addForm.data)
  },
  editFormDataJson() {
    return jsonToString(this.editForm.data)
  }
}
export { defaultComputed }

const defaultWatch = {
  searchFormDataJson(newValue) {
    this.searchForm.isChanged = (newValue !== this.searchForm.snapshotForReset)
    this.page.disabled = (newValue !== this.searchForm.snapshotForPage)
  },
  addFormDataJson(newValue) {
    this.addForm.isChanged = (newValue !== this.addForm.snapshotForReset)
  },
  editFormDataJson(newValue) {
    this.editForm.isChanged = (newValue !== this.editForm.snapshotForReset)
  }
}
export { defaultWatch }

const defaultMethods = {
  // ------------ searchForm start ------------
  requestSearch() {
    this.table.data = []
    this.table.checkedIds = []
    // this.page.total = 0 // 翻页有问题

    return request({
      url: this.baseUrl + '/page',
      method: 'post',
      data: merge(this.searchForm.data, { page: this.page })
    }).then(response => {
      const data = response.data
      this.table.data = data.records
      this.page.total = data.total
      this.page.disabled = false
      return response
    }).catch(() => { })
  },
  resetSearchForm() {
    this.searchForm.data = stringToJson(this.searchForm.snapshotForReset)
  },
  submitSearchForm() {
    this.searchForm.snapshotForPage = jsonToString(this.searchForm.data)
    this.page.current = 1
    this.page.asc = null
    this.page.desc = null
    this.$refs.tableRef.clearSort() // 只有点击搜索的时候才清空排序要求
    this.requestSearch()
  },
  // ------------ searchForm end ------------

  // ------------ batch start ------------
  requestDeletes() {
    const checkedIds = this.table.checkedIds
    const length = checkedIds.length
    confirm('确定删除选中的' + length + '条记录吗？').then(() => {
      request({
        url: this.baseUrl + '/batch',
        method: 'delete',
        data: checkedIds
      }).then(response => {
        if (response.success) {
          success(response.success)
        }
        if (this.page.current > 1 && this.table.data.length === length && (this.page.total === ((this.page.current - 1) * this.page.size + length))) {
          // 在至少两页的前提下，如果删除最后一页的全部记录行的话就跳至前一页
          this.page.current = this.page.current - 1
        }
        this.requestSearch()
      }).catch(() => { })
    }).catch(() => { })
  },
  // ------------ batch start ------------

  // ------------ table start ------------
  onTableSelectionChange(selection) {
    const checkedIds = []
    selection.forEach(row => {
      checkedIds.push(row.id)
    })
    this.table.checkedIds = checkedIds
  },
  onTableSortChange({ column, prop, order }) {
    if (order === 'ascending') {
      this.page.asc = prop
      this.page.desc = null
    } else if (order === 'descending') {
      this.page.asc = null
      this.page.desc = prop
    } else { // null
      this.page.asc = null
      this.page.desc = null
    }
    this.page.current = 1
    this.requestSearch()
  },
  onTableRowDoubleClick(row, column, event) {
    this.$refs.tableRef.toggleRowSelection(row)
  },
  generateTableIndex(index) {
    return (this.page.current - 1) * this.page.size + index + 1
  },
  // ------------ table end ------------

  // ------------ option start ------------
  // ------------ option end ------------

  // ------------ pagination start ------------
  onPageSizeChange(pageSize) {
    this.page.size = pageSize
    this.onPageCurrentChange(1)
  },
  onPageCurrentChange(currentPage) {
    this.page.current = currentPage
    this.requestSearch()
  },
  // ------------ pagination end ------------

  // ------------ addForm start ------------
  openAddForm() {
    this.addForm.visible = true
  },
  doCloseAddForm() {
    this.addForm.visible = false
    this.resetAddForm()
  },
  closeAddForm() {
    if (this.ue.isSafeMode === true && this.addForm.isChanged === true) {
      confirm('数据还未保存，确认关闭？').then(this.doCloseAddForm).catch(() => { })
    } else {
      this.doCloseAddForm()
    }
  },
  resetAddForm() {
    this.addForm.data = stringToJson(this.addForm.snapshotForReset)
    this.$refs.addFormRef.clearValidate()
  },
  submitAddForm() {
    this.$refs.addFormRef.validate((valid) => {
      if (valid) {
        return request({
          url: this.baseUrl,
          method: 'post',
          data: this.addForm.data
        }).then(response => {
          this.doCloseAddForm()
          if (response.success) {
            success(response.success)
          }
        }).catch(() => {})
      } else {
        error('表单验证未通过')
      }
    })
  },
  // ------------ addForm end ------------

  // ------------ editForm start ------------
  openEditForm(row, column, $index, store, callbackFn) {
    return request({
      url: this.baseUrl + '?id=' + row.id,
      method: 'get'
    }).then(response => {
      this.editForm.data.record = response.data
      this.editForm.snapshotForReset = jsonToString(this.editForm.data)
      if (callbackFn) {
        callbackFn(response)
      }
      this.editForm.isChanged = false
      this.editForm.visible = true
      return response
    }).catch(() => { })
  },
  doCloseEditForm() {
    this.editForm.visible = false
    // this.resetEditForm()
    // 重置表单，无需重置data，重置isChanged即可。
    this.editForm.isChanged = false
    this.$refs.editFormRef.clearValidate()
  },
  closeEditForm() {
    if (this.ue.isSafeMode === true && this.editForm.isChanged === true) {
      confirm('数据还未保存，确认关闭？').then(this.doCloseEditForm).catch(() => { })
    } else {
      this.doCloseEditForm()
    }
  },
  resetEditForm() {
    this.editForm.data = stringToJson(this.editForm.snapshotForReset)
    this.$refs.editFormRef.clearValidate()
  },
  submitEditForm() {
    this.$refs.editFormRef.validate((valid) => {
      if (valid) {
        return request({
          url: this.baseUrl,
          method: 'put',
          data: this.editForm.data
        }).then(response => {
          this.doCloseEditForm()
          if (response.success) {
            success(response.success)
          }
          this.requestSearch()
        }).catch(() => { })
      } else {
        error('表单验证未通过')
      }
    })
  },
  // ------------ editForm end ------------

  // ------------ detailForm start ------------
  openDetailForm(row, column, $index, store) {
    this.detailForm.data.record = row
    this.detailForm.visible = true
  },
  closeDetailForm() {
    this.detailForm.visible = false
  },
  // ------------ detailForm end ------------

  // ------------ public start ------------
  init() {
    this.submitSearchForm()
    // 保存查询表单初始快照以便重置操作恢复
    this.searchForm.snapshotForReset = jsonToString(this.searchForm.data)
    this.searchForm.snapshotForPage = jsonToString(this.searchForm.data)
    this.addForm.snapshotForReset = jsonToString(this.addForm.data)
  },
  getReferenceLabel(referenceKey, value, defaultLabel) {
    const options = this.references[referenceKey]
    for (let i = 0, length = options.length; i < length; i++) {
      if (options[i].value === value) {
        return options[i].label
      }
    }
    return defaultLabel
  }
  // ------------ public end ------------
}
export { defaultMethods }
