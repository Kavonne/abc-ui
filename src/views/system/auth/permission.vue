<template>
  <curd ref="curdRef" :module="module" :search-form="searchForm" :table="table" :add-form="addForm" :edit-form="editForm" :detail-form="detailForm">
    <template slot="curd-search">
      <el-row>
        <el-col :span="8">
          <el-form-item :label="module.name + '编号'">
            <el-input v-model="searchForm.data.record.permissionCode" maxlength="32" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="module.name + '名称'">
            <el-input v-model="searchForm.data.record.permissionName" maxlength="32" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="备注">
            <el-input v-model="searchForm.data.record.remark" maxlength="255" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    <template slot="curd-toolbar">
      <el-button type="primary" @click="openAddForm"><svg-icon icon-class="abc-add" /> 新增</el-button>
      <el-button type="danger" :disabled="isTableRowUnChecked" @click="requestDeletes"><svg-icon icon-class="abc-delete" /> 删除</el-button>
    </template>
    <template slot="curd-table-columns">
      <el-table-column type="selection" width="40" header-align="center" align="center" fixed="left" />
      <el-table-column label="序号" type="index" :index="generateTableIndex" width="64" header-align="center" align="center" fixed="left" />
      <el-table-column :label="module.name + '编号'" prop="permissionCode" header-align="center" align="left" sortable />
      <el-table-column :label="module.name + '名称'" prop="permissionName" header-align="center" align="left" sortable />
      <el-table-column label="备注" prop="remark" header-align="center" align="left" />
      <!-- 留一列做自适应匹配，可选择设置min-width -->
      <!-- 单操作工具栏 -->
      <el-table-column label="操作" width="340" header-align="center" align="left" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" @click="openDetailForm(scope.row, scope.column, scope.$index, scope.store)"><svg-icon icon-class="abc-detail" /> 明细</el-button>
          <el-button type="primary" @click="openEditForm(scope.row, scope.column, scope.$index, scope.store)"><svg-icon icon-class="abc-edit" /> 编辑</el-button>
          <el-popconfirm :title="'确定删除' + module.name + '“' + scope.row.permissionName + '”吗？'" cancel-button-type="primary" confirm-button-type="text" @confirm="requestDelete(scope.row.id)">
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
    </template>
    <template slot="curd-add">
      <el-row>
        <el-col :span="24">
          <el-form-item prop="permissionCode" :label="module.name + '编号'">
            <el-input v-model="addForm.data.record.permissionCode" maxlength="32" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="permissionName" :label="module.name + '名称'">
            <el-input v-model="addForm.data.record.permissionName" maxlength="32" clearable />
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
    </template>
    <template slot="curd-edit">
      <el-row>
        <el-col :span="24">
          <el-form-item prop="permissionCode" :label="module.name + '编号'">
            <el-input v-model="editForm.data.record.permissionCode" maxlength="32" clearable disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="permissionName" :label="module.name + '名称'">
            <el-input v-model="editForm.data.record.permissionName" maxlength="32" clearable />
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
    </template>
    <template slot="curd-detail">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="module.name + '编号'">
            <span v-text="detailForm.data.record.permissionCode" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="module.name + '名称'">
            <span v-text="detailForm.data.record.permissionName" />
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
    </template>
  </curd>
</template>

<script>
const merge = require('webpack-merge')
import Curd from '@/components/Curd'

export default {
  components: { Curd },
  data() {
    return merge(Curd.defaultData, {
      module: {
        url: '/auth-permission',
        name: '许可'
      },
      addForm: {
        rules: {
          'permissionCode': [{
            required: true, message: '不能为空', trigger: 'blur'
          }],
          'permissionName': [{
            required: true, message: '不能为空', trigger: 'blur'
          }]
        }
      },
      editForm: {
        rules: {
          'permissionName': [{
            required: true, message: '不能为空', trigger: 'blur'
          }]
        }
      }
    })
  },
  computed: merge(Curd.defaultComputed, {

  }),
  watch: merge(Curd.defaultWatch, {

  }),
  mounted() {
    this.init()
  },
  methods: merge(Curd.defaultMethods, {
    // ------------ option start ------------
    // ------------ option end ------------
  })
}
</script>
