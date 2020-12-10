<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form ref="searchFormRef" slot="header" :label-width="ui.form.labelWidth">
        <el-row>
          <el-col :span="8">
            <el-form-item label="租户编号">
              <el-input v-model="searchForm.data.record.tenantCode" maxlength="32" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="租户名称">
              <el-input v-model="searchForm.data.record.tenantName" maxlength="32" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">
              <el-input v-model="searchForm.data.record.remark" maxlength="255" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" justify="center">
          <el-button :disabled="!searchForm.isChanged" @click="resetSearchForm"><svg-icon icon-class="abc-reset" /> 重置</el-button>
          <el-button type="primary" @click="submitSearchForm"><svg-icon icon-class="abc-search" /> 搜索</el-button>
        </el-row>
      </el-form>

      <!-- 批操作工具栏 -->
      <el-row class="curd-toolbar">
        <el-button type="primary" @click="openAddForm"><svg-icon icon-class="abc-add" /> 新增</el-button>
        <el-button type="danger" :disabled="isTableRowUnChecked" @click="requestDeletes"><svg-icon icon-class="abc-delete" /> 删除</el-button>
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
        <el-table-column type="selection" width="40" header-align="center" align="center" fixed="left" />
        <el-table-column label="序号" type="index" :index="generateTableIndex" width="64" header-align="center" align="center" fixed="left" />
        <el-table-column label="租户编号" prop="tenantCode" header-align="center" align="left" sortable />
        <el-table-column label="租户名称" prop="tenantName" header-align="center" align="left" sortable />
        <el-table-column label="备注" prop="remark" header-align="center" align="left" />
        <!-- 留一列做自适应匹配，可选择设置min-width -->
        <!-- 单操作工具栏 -->
        <el-table-column label="操作" width="340" header-align="center" align="left" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" @click="openDetailForm(scope.row, scope.column, scope.$index, scope.store)"><svg-icon icon-class="abc-detail" /> 明细</el-button>
            <el-button type="primary" @click="openEditForm(scope.row, scope.column, scope.$index, scope.store)"><svg-icon icon-class="abc-edit" /> 编辑</el-button>
            <el-popconfirm :title="'确定删除租户“' + scope.row.tenantName + '”吗？'" cancel-button-type="primary" confirm-button-type="text" @confirm="requestDelete(scope.row.id)">
              <el-button slot="reference" type="danger" class="curd-option-button"><svg-icon icon-class="abc-delete" /> 删除</el-button>
            </el-popconfirm>
            <el-dropdown trigger="click">
              <el-button type="primary" class="curd-option-button">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>操作1</el-dropdown-item>
                <el-dropdown-item>操作2</el-dropdown-item>
                <el-dropdown-item>操作3</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
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
    <el-dialog :visible="addForm.visible" title="新增租户" @close="closeAddForm">
      <el-form ref="addFormRef" :label-width="ui.form.labelWidth" :model="addForm.data.record" :rules="addForm.rules">
        <el-row>
          <el-col :span="24">
            <el-form-item prop="tenantCode" label="租户编号">
              <el-input v-model="addForm.data.record.tenantCode" maxlength="32" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="tenantName" label="租户名称">
              <el-input v-model="addForm.data.record.tenantName" maxlength="32" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="remark" label="备注">
              <el-input v-model="addForm.data.record.remark" type="textarea" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
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
    <el-dialog :visible="editForm.visible" title="编辑租户" @close="closeEditForm">
      <el-form ref="editFormRef" :label-width="ui.form.labelWidth" :model="editForm.data.record" :rules="editForm.rules">
        <el-row>
          <el-col :span="24">
            <el-form-item prop="tenantCode" label="租户编号">
              <el-input v-model="editForm.data.record.tenantCode" maxlength="32" clearable disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="tenantName" label="租户名称">
              <el-input v-model="editForm.data.record.tenantName" maxlength="32" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="remark" label="备注">
              <el-input v-model="editForm.data.record.remark" type="textarea" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
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
    <el-dialog :visible="detailForm.visible" title="租户详情" @close="closeDetailForm">
      <el-form ref="detailFormRef" :label-width="ui.form.labelWidth">
        <el-row>
          <el-col :span="24">
            <el-form-item label="租户编号">
              <span v-text="detailForm.data.record.tenantCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="租户名称">
              <span v-text="detailForm.data.record.tenantName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <span v-text="detailForm.data.record.remark" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { success, confirm } from '@utils/message'
import { defaultData, defaultComputed, defaultWatch, defaultMethods } from '@utils/curd'

export default {
  data() {
    return merge(defaultData, {
      baseUrl: '/auth-tenant',
      addForm: {
        rules: {
          'tenantCode': [{
            required: true, message: '不能为空', trigger: 'blur'
          }],
          'tenantName': [{
            required: true, message: '不能为空', trigger: 'blur'
          }]
        }
      },
      editForm: {
        rules: {
          'tenantName': [{
            required: true, message: '不能为空', trigger: 'blur'
          }]
        }
      }
    })
  },
  computed: defaultComputed,
  watch: defaultWatch,
  mounted() {
    this.init()
  },
  methods: merge(defaultMethods, {
    // ------------ option start ------------
    confirmDelete(row, column, $index, store) {
      confirm('确定删除租户“' + row.tenantName + '”吗？').then(() => {
        this.requestDelete(row.id)
      }).catch(() => {})
    },
    requestDelete(id) {
      request({
        url: this.baseUrl + '?id=' + id,
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
    }
    // ------------ option end ------------
  })
}
</script>
