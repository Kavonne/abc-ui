<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form ref="searchFormRef" slot="header" :label-width="ui.form.labelWidth">
        <slot name="curd-search" />
        <el-row type="flex" justify="center">
          <el-button :disabled="!searchForm.isChanged" @click="resetSearchForm"><svg-icon icon-class="abc-reset" /> 重置</el-button>
          <el-button type="primary" @click="submitSearchForm"><svg-icon icon-class="abc-search" /> 搜索</el-button>
        </el-row>
      </el-form>

      <!-- 批操作工具栏 -->
      <el-row class="curd-toolbar">
        <slot name="curd-toolbar" />
      </el-row>

      <!-- 搜索结果 -->
      <el-table
        ref="tableRef"
        :data="table.data"
        stripe
        border
        @selection-change="onTableSelectionChange"
        @sort-change="onTableSortChange"
        @row-dblclick="onTableRowDoubleClick"
      >
        <slot name="curd-table-columns" />
      </el-table>

      <!-- 分页 -->
      <el-row type="flex" justify="center">
        <el-pagination
          :disabled="page.disabled"
          :layout="ui.page.layout"
          :page-size="page.size"
          :page-sizes="ui.page.pageSizes"
          :total="page.total"
          :current-page="page.current"
          @size-change="onPageSizeChange"
          @current-change="onPageCurrentChange"
          @prev-click="onPageCurrentChange"
          @next-click="onPageCurrentChange"
        />
      </el-row>
    </el-card>

    <!-- 新增表单 -->
    <el-dialog :visible="addForm.visible" :title="'新增' + module.name" @close="closeAddForm">
      <el-form ref="addFormRef" :label-width="ui.form.labelWidth" :model="addForm.data.record" :rules="addForm.rules">
        <slot name="curd-add" />
      </el-form>
      <div slot="footer">
        <el-button :disabled="!addForm.isChanged" @click="resetAddForm">
          <svg-icon icon-class="abc-reset" /> 重置
        </el-button>
        <el-button type="primary" :disabled="!addForm.isChanged" @click="submitAddForm">
          <svg-icon icon-class="abc-save" /> 保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 编辑表单 -->
    <el-dialog :visible="editForm.visible" :title="'编辑' + module.name" @close="closeEditForm">
      <el-form ref="editFormRef" :label-width="ui.form.labelWidth" :model="editForm.data.record" :rules="editForm.rules">
        <slot name="curd-edit" />
      </el-form>
      <div slot="footer">
        <el-button :disabled="!editForm.isChanged" @click="resetEditForm">
          <svg-icon icon-class="abc-reset" /> 重置
        </el-button>
        <el-button :disabled="!editForm.isChanged" type="primary" @click="submitEditForm">
          <svg-icon icon-class="abc-save" /> 保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 明细表单 -->
    <el-dialog :visible="detailForm.visible" :title="module.name + '详情'" @close="closeDetailForm">
      <el-form ref="detailFormRef" :label-width="ui.form.labelWidth">
        <slot name="curd-detail" />
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="closeDetailForm">
          <svg-icon icon-class="abc-close" /> 关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const merge = require('webpack-merge')
import request from '@/utils/request'
import { success, error, confirm } from '@utils/message'
import { jsonToString, stringToJson } from '@utils/tool'

export default {
  props: {
    module: {
      type: Object,
      default: function() {
        return {
          // url: '',
          // name: ''
        }
      }
    },
    searchForm: {
      type: Object,
      default: function() {
        return {
          // data: {
          //   record: {}
          // },
          // snapshotForReset: '', // 初始化时的快照，用于表单重置
          // snapshotForPage: '', // 点击搜索后对查询表单的快照，以此对比查询表单是否修改，如是则禁用翻页栏。
          // isChanged: false
        }
      }
    },
    table: {
      type: Object,
      default: function() {
        return {
          // data: [], // 表格数据
          // checkedIds: [] // 已选中表格数据的id数组
        }
      }
    },
    addForm: {
      type: Object,
      default: function() {
        return {
          // visible: false,
          // data: {
          //   record: {}
          // },
          // snapshotForReset: '',
          // rules: {},
          // isChanged: false
        }
      }
    },
    editForm: {
      type: Object,
      default: function() {
        return {
          // visible: false,
          // data: {
          //   record: {}
          // },
          // snapshotForReset: '',
          // rules: {},
          // isChanged: false
        }
      }
    },
    detailForm: {
      type: Object,
      default: function() {
        return {
          // visible: false,
          // data: {
          //   record: {}
          // }
        }
      }
    }
  },
  data() {
    return {
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
      page: {
        size: 10,
        current: 1,
        asc: null, // 升序字段
        desc: null, // 降序字段
        total: 0,
        disabled: true
      }
    }
  },
  computed: {
    searchFormDataJson() {
      return jsonToString(this.searchForm.data)
    },
    addFormDataJson() {
      return jsonToString(this.addForm.data)
    },
    editFormDataJson() {
      return jsonToString(this.editForm.data)
    }
  },
  watch: {
    searchFormDataJson(newValue) {
      this.searchForm.isChanged = (newValue !== this.searchForm.snapshotForReset)
      this.page.disabled = ((this.page.total === 0) || (newValue !== this.searchForm.snapshotForPage))
    },
    addFormDataJson(newValue) {
      this.addForm.isChanged = (newValue !== this.addForm.snapshotForReset)
    },
    editFormDataJson(newValue) {
      this.editForm.isChanged = (newValue !== this.editForm.snapshotForReset)
    }
  },
  methods: {
    // ------------ searchForm start ------------
    requestSearch() {
      this.table.data = []
      this.table.checkedIds = []
      // this.page.total = 0 // 翻页有问题

      return request({
        url: this.module.url + '/page',
        method: 'post',
        data: merge(this.searchForm.data, { page: this.page })
      }).then(response => {
        const data = response.data
        this.table.data = data.records
        this.page.total = data.total
        this.page.disabled = (this.page.total === 0)
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
          url: this.module.url + '/batch',
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
    // clearTableSort() {
    //   this.$refs.tableRef.clearSort()
    // },
    // ------------ table end ------------

    // ------------ option start ------------
    // confirmDelete(row, column, $index, store) {
    //   confirm('确定删除' + this.module.name + '“' + row.tenantName + '”吗？').then(() => {
    //     this.requestDelete(row.id)
    //   }).catch(() => {})
    // },
    requestDelete(id) {
      request({
        url: this.module.url + '?id=' + id,
        method: 'delete'
      }).then(response => {
        if (response.success) {
          success(response.success)
        }
        if (this.page.current > 1 && this.table.data.length === 1 && (this.page.total === ((this.page.current - 1) * this.page.size + 1))) {
          // 在至少两页的前提下，如果删除最后一页的唯一记录行的话就跳至前一页
          this.page.current = this.page.current - 1
        }
        this.requestSearch()
      }).catch(() => {})
    },
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
            url: this.module.url,
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
        url: this.module.url + '?id=' + row.id,
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
            url: this.module.url,
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
  },
  // ------------ default end ------------
  defaultData: {
    module: {
      url: '',
      name: ''
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
  },
  defaultComputed: {
    isTableRowUnChecked() {
      return this.table.checkedIds.length === 0
    }
  },
  defaultMethods: {
    requestDeletes() {
      this.$refs.curdRef.requestDeletes()
    },
    generateTableIndex(index) {
      return this.$refs.curdRef.generateTableIndex(index)
    },
    requestDelete(id) {
      return this.$refs.curdRef.requestDelete(id)
    },
    openAddForm() {
      this.$refs.curdRef.openAddForm()
    },
    openEditForm(row, column, $index, store, callbackFn) {
      this.$refs.curdRef.openEditForm(row, column, $index, store, callbackFn)
    },
    openDetailForm(row, column, $index, store) {
      this.$refs.curdRef.openDetailForm(row, column, $index, store)
    },
    init() {
      this.$refs.curdRef.init()
    }
  }
  // ------------ default end ------------
}
</script>
