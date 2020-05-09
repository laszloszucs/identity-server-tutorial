<template>
  <div class="roles">
    <DxDataGrid
      v-if="users"
      :ref="gridRefName"
      :data-source="roles"
      :show-borders="true"
      :column-auto-width="true"
      :row-alternation-enabled="true"
      :show-row-lines="true"
      @init-new-row="onInitNewRow"
      @editing-start="onEditingStart"
      @editor-preparing="onEditorPreparing"
    >
      <!-- <DxColumnFixing :enabled="true" /> -->
      <DxEditing
        :allow-updating="true"
        :allow-deleting="true"
        :allow-adding="true"
        mode="popup"
      >
        <DxDataGridEditPopup
          id="popup"
          :show-title="true"
          :drag-enabled="false"
          title-template="getTitle"
        >
        </DxDataGridEditPopup>
        <DxDatagridEditForm>
          <DxFormItem :col-count="2" :col-span="2" item-type="group">
            <DxFormItem :col-span="2" data-field="id" />
            <DxFormItem data-field="name" />
            <DxFormItem data-field="description" />
          </DxFormItem>
          <DxFormItem :col-count="2" :col-span="2" item-type="group">
            <DxFormItem
              :col-span="2"
              data-field="users"
              editor-type="dxTagBox"
              :editor-options="{
                dataSource: users,
                valueExpr: 'userId',
                displayExpr: 'userName'
              }"
            />
          </DxFormItem>
          <DxFormItem :col-count="2" :col-span="2" item-type="group">
            <DxFormItem
              :col-span="2"
              data-field="permissions"
              editor-type="dxList"
              :editor-options="{
                dataSource: permissionsLookup,
                valueExpr: 'value',
                displayExpr: 'name',
                selectionMode: 'none',
                activeStateEnabled: false,
                focusStateEnabled: false,
                hoverStateEnabled: false,
                itemTemplate: 'permissionListItemTemplate'
              }"
            />
          </DxFormItem>
          <!-- <DxFormItem :col-span="2" itemType="empty"></DxFormItem> -->
        </DxDatagridEditForm>
      </DxEditing>
      <DxGroupPanel :visible="true" />
      <DxGrouping :auto-expand-all="true" />
      <DxPaging />
      <DxSearchPanel :visible="true" />
      <DxColumn data-field="id" :visible="false" :allowEditing="false" />
      <DxColumn data-field="name" />
      <DxColumn data-field="description" />
      <DxColumn
        data-field="users"
        cell-template="usersCellTemplate"
        width="200"
      />
      <DxColumn
        data-field="permissions"
        cell-template="permissionsCellTemplate"
        width="200"
      />
      <DxColumn data-field="createdBy" />
      <DxColumn data-field="updatedBy" />
      <DxColumn data-field="CreatedDate" />
      <DxColumn data-field="UpdatedDate" />
      <template #usersCellTemplate="cell">
        <DxTagBox
          :readOnly="true"
          :dataSource="users"
          :value="cell.data.value"
          valueExpr="userId"
          tag-template="usersTagTemplate"
        >
          <template #usersTagTemplate="item">
            <div class="dx-tag-content" style="padding: 3px 6px 4px 2px;">
              {{ getUserUserNameById(item.data.userId) }}
            </div>
          </template>
        </DxTagBox>
      </template>
      <template #permissionsCellTemplate="cell">
        <DxTagBox
          :readOnly="true"
          :dataSource="permissionsLookup"
          :value="cell.data.value"
          valueExpr="value"
          tag-template="permissionsTagTemplate"
        >
          <template #permissionsTagTemplate="item">
            <div class="dx-tag-content" style="padding: 3px 6px 4px 2px;">
              {{ item.data.name }}
            </div>
          </template>
        </DxTagBox>
      </template>
      <template #getTitle>
        <DxToolbar>
          <DxToolbarItem #default location="center">
            <div class="toolbar-label">
              <b>{{ isNewRow ? "New Role" : "Edit Role" }}</b>
            </div>
          </DxToolbarItem>

          <DxToolbarItem
            :options="closeButtonOptions"
            location="after"
            widget="dxButton"
          />
        </DxToolbar>
      </template>
      <template #permissionListItemTemplate="item">
        <div class="permission-list-item">
          <div>{{ console.log(item) }}</div>
          <div>{{ item.data.group }}</div>
          <DxSelectBox
            class="selectbox"
            width="200px"
            keyExpr="value"
            displayExpr="name"
            :items="item.data.values"
            :value="getValue(item.data.values)"
          ></DxSelectBox>
        </div>
        <!-- <b>{{ console.log(item) }}</b> -->
      </template>
    </DxDataGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import accountService from "../../services/account.service";
import roleService from "../../services/role.service";
import {
  DxDataGrid,
  DxGrouping,
  DxGroupPanel,
  DxSearchPanel,
  DxPaging,
  DxColumn,
  DxEditing,
  DxLookup,
  DxRequiredRule,
  DxPopup as DxDataGridEditPopup,
  DxPosition,
  DxForm as DxDatagridEditForm,
  DxButton,
  DxColumnFixing
} from "devextreme-vue/data-grid";
import DxTagBox from "devextreme-vue/tag-box";
import DxToolbar, { DxItem as DxToolbarItem } from "devextreme-vue/toolbar";
import CustomStore from "devextreme/data/custom_store";
import DxForm, {
  DxItem as DxFormItem,
  DxButtonItem,
  DxLabel
} from "devextreme-vue/form";
import DxPopup, {
  DxToolbarItem as DxPopupToolbarItem
} from "devextreme-vue/popup";
import DxSelectBox from "devextreme-vue/select-box";
import { Permission } from "../../models/permission.model";
import logger from "../../utils/logger";

@Component({
  components: {
    DxDataGrid,
    DxGrouping,
    DxGroupPanel,
    DxSearchPanel,
    DxPaging,
    DxColumn,
    DxEditing,
    DxLookup,
    DxTagBox,
    DxRequiredRule,
    DxPopup,
    DxPosition,
    DxDatagridEditForm,
    DxFormItem,
    DxToolbar,
    DxToolbarItem,
    DxButton,
    DxButtonItem,
    DxLabel,
    DxDataGridEditPopup,
    DxForm,
    DxPopupToolbarItem,
    DxColumnFixing,
    DxSelectBox
  }
})
export default class Roles extends Vue {
  private isNewRow = false;
  private gridRefName = "rolesGrid";
  private users = null;
  private permissionValue = null;
  // private permissions = null;
  console = console;
  public roles = new CustomStore({
    key: "id",
    load: () => roleService.get(),
    insert: (values: any) => {
      // TODO Van-e DevExtreme-es megoldás arra, hogy ne postolja?
      values.confirmPassword = undefined; // Nem szükséges postolni a confirmPassword-öt
      return roleService.insert(values);
    },
    update: (key, values) =>
      roleService.update({
        key: key,
        values: JSON.stringify(values)
      }),
    remove: key => roleService.delete(key)
  });

  closeButtonOptions = {
    icon: "close",
    onClick: () => {
      this.dataGrid.cancelEditData();
    }
  };

  onEditorPreparing(e) {
    logger.log(e.dataField, "blue");
    console.log(e);
    if (e.dataField == "permissions" && e.parentType === "dataRow") {
      this.permissionValue = e.editorOptions.value;
      e.editorOptions.onValueChanged = function(args) {
        // Implement your logic here
        debugger;
        e.setValue(args.value); // Updates the cell value
      };
    }
  }

  getValue(values) {
    logger.log(this.permissionValue, "purple");
    logger.log(values, "gray");
    debugger;

    const manage = values.find(value => value.name === "Manage");

    if (manage) {
      if (this.permissionValue.includes(manage.value)) {
        return manage;
      }
    }

    const viewOnly = values.find(value => value.name === "View Only");

    if (this.permissionValue.includes(viewOnly.value)) {
      return viewOnly;
    }

    return values.find(value => value.name === "None");
  }

  onInitNewRow() {
    this.isNewRow = true;
  }

  onEditingStart() {
    this.isNewRow = false;
  }

  get dataGrid() {
    return (this.$refs[this.gridRefName] as any).instance;
  }

  private permissionsLookup = new CustomStore({
    key: "group",
    loadMode: "raw",
    load: async () => await Permission.getAllPermissions()
  });

  async created() {
    this.users = await accountService.getUsers();
    // this.permissions = Permission.getAllPermissions();
  }

  // getClaimNameByValue(value) {
  //   return this.claims.find(claim => claim.value === value).name;
  // }

  getUserUserNameById(userId) {
    return this.users.find(user => user.id === userId).userName;
  }
}
</script>

<style lang="scss">
.about {
  text-align: center;
}

::v-deep .dx-datagrid-content .dx-datagrid-table .dx-row > td,
.dx-datagrid-content .dx-datagrid-table .dx-row > tr > td {
  vertical-align: middle !important;
}

// TODO Erre visszatérni, mert nem működik, a lista elemén továbbra is a pointer cursor van...
.dx-list-item {
  border-top: none !important;
  cursor: default !important;
}

.permission-list-item {
  display: grid;
  align-items: center;
  justify-items: center;
  grid-template-columns: 0% 0% 5% 95% 0%;
  padding: 5px;
  cursor: default !important;
  border-top: none;
  & .selectbox {
    justify-self: start;
  }
}
</style>
