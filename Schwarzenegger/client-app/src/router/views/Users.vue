<template>
  <div class="users">
    <DxDataGrid    
      :allow-column-reordering="true"
      :data-source="users"
      :show-borders="true"
      :row-alternation-enabled="true"
      :show-row-lines="true"
      @init-new-row="onInitNewRow"
      @editing-start="onEditingStart"
    >
      <DxEditing
        :allow-updating="true"
        :allow-deleting="true"
        :allow-adding="true"
        mode="popup"
      >
        <DxPopup
          id="popup"
          :show-title="true"
          title="User Info"
          :ref="formRefName"
          @content-ready="onContentReady"
        >
        </DxPopup>
        <DxForm :customize-item="customizeItem">
          <DxItem :col-count="2" :col-span="2" item-type="group">
            <DxItem
              :col-span="2"
              data-field="id"
            />
            <DxItem data-field="email" />
            <DxItem data-field="userName" />
            <DxItem data-field="newPassword" />
            <DxItem data-field="fullName" />
            <DxItem data-field="phoneNumber" />
          </DxItem>
          <DxItem :col-count="2" :col-span="2" item-type="group">
            <DxItem
              :col-span="2"
              data-field="roles"
              editor-type="dxTagBox"
            />
          </DxItem>
        </DxForm>
      </DxEditing>
      <DxGroupPanel :visible="true" />
      <DxGrouping :auto-expand-all="true" />
      <DxPaging />
      <DxSearchPanel :visible="true" />
      <DxColumn data-field="id" :visible="false" :allowEditing="false" />
      <DxColumn data-field="email">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="userName">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="newPassword" data-type="password" :visible="false">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="fullName" />

      <DxColumn data-field="phoneNumber" />
      <DxColumn
        data-field="roles"
        cell-template="rolesCellTemplate"
        edit-cell-template="rolesEditCellTemplate"
      >
      </DxColumn>
      <template #rolesCellTemplate="cell">
        <DxTagBox
          :readOnly="true"
          :dataSource="rolesLookup"
          :value="cell.data.value"
          valueExpr="name"
          displayExpr="description"
          tag-template="tagTemplate"
        >
          <template #tagTemplate="item">
            <div class="dx-tag-content" style="padding: 3px 6px 4px 2px;">
              {{ item.data.description }}
            </div>
          </template>
        </DxTagBox>
      </template>
      <template #rolesEditCellTemplate="cell">
        <DxTagBox
          :dataSource="rolesLookup"
          :value="cell.data.value"
          valueExpr="name"
          displayExpr="description"
        >
        </DxTagBox>
      </template>
      <DxColumn data-field="isLockedOut" />
      <DxColumn data-field="isEnabled" />
    </DxDataGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import accountService from "../../services/account.service";
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
  DxPopup,
  DxPosition,
  DxForm
} from "devextreme-vue/data-grid";
import { DxTagBox } from "devextreme-vue/tag-box";
import CustomStore from "devextreme/data/custom_store";
import { DxItem } from 'devextreme-vue/form';
import { InsertUser } from "../../models/user.model";

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
    DxItem,
    DxPopup,
    DxPosition,
    DxForm
  }
})
export default class Users extends Vue {
  private isNewRow = false;
  private formRefName = "form";

  public users = new CustomStore({
    key: "id",
    load: () => accountService.getUsers(),
    insert: (values: InsertUser) => accountService.insertUser(values),
    update: (key, values) =>
      accountService.updateUser({
        key: key,
        values: JSON.stringify(values)
      }),
    remove: key => accountService.removeUser(key)
  });

  private rolesLookup = new CustomStore({
    key: "Value",
    loadMode: "raw",
    load: async () => await accountService.getRoles()
  });

  onEditingStart(e) {
    // this.popupTitle = "Edit User";
    this.isNewRow = false;
  }

  onInitNewRow(e) {
    // this.popupTitle = "New User";
    this.isNewRow = true;
  }

  customizeItem(item) {
    if (item.dataField === "newPassword") {
      if(!this.isNewRow) {
        item.visible = false;
      }
    }

    if(item.dataField === "id" && this.isNewRow) {
      item.visible = false;
    }
  }

  onContentReady(e) {
    debugger;
  }
}
</script>

<style lang="scss" scoped>
.about {
  text-align: center;
}

::v-deep .dx-datagrid-content .dx-datagrid-table .dx-row > td,
.dx-datagrid-content .dx-datagrid-table .dx-row > tr > td {
  vertical-align: middle !important;
}
</style>
