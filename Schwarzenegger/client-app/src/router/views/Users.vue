<template>
  <div class="users">
    <DxDataGrid
      :ref="gridRefName"
      :allow-column-reordering="true"
      :data-source="users"
      :show-borders="true"
      :column-auto-width="true"
      :row-alternation-enabled="true"
      :show-row-lines="true"
      @init-new-row="onInitNewRow"
      @editing-start="onEditingStart"
      @editor-preparing="onEditorPreparing"
    >
      <DxColumnFixing :enabled="true" />
      <DxEditing
        :allow-updating="hasPermission('users.update')"
        :allow-deleting="hasPermission('users.delete')"
        :allow-adding="hasPermission('users.add')"
        mode="popup"
      >
        <DxDataGridEditPopup
          id="popup"
          :show-title="true"
          :drag-enabled="false"
          title-template="getTitle"
        >
        </DxDataGridEditPopup>
        <DxDatagridEditForm :customize-item="customizeItem">
          <DxFormItem :col-count="2" :col-span="2" item-type="group">
            <DxFormItem :col-span="2" data-field="id" />
            <DxFormItem data-field="email" />
            <DxFormItem data-field="userName" />
            <DxFormItem data-field="fullName" />
            <DxFormItem data-field="phoneNumber" />
          </DxFormItem>
          <!-- TODO A permission vizsgálatokat tesztelni kell, valószínűleg több helyen kell vizsgálni -->
          <DxFormItem
            v-if="hasPermission('roles.view')"
            :col-count="2"
            :col-span="2"
            item-type="group"
          >
            <DxFormItem
              :col-span="2"
              data-field="roles"
              editor-type="dxTagBox"
              :editor-options="{
                dataSource: rolesLookup,
                valueExpr: 'name',
                displayExpr: 'description'
              }"
            />
          </DxFormItem>
          <DxFormItem :col-span="2" itemType="empty"></DxFormItem>
          <DxFormItem
            :col-count="2"
            :col-span="2"
            item-type="group"
            name="changePasswordButton"
          >
            <DxButtonItem
              :col-span="2"
              :button-options="changePasswordButtonOptions"
              horizontal-alignment="left"
            ></DxButtonItem>
          </DxFormItem>
          <DxFormItem :col-count="2" :col-span="2" item-type="group">
            <DxFormItem
              data-field="newPassword"
              :editorOptions="{ mode: 'password' }"
            />
            <DxFormItem :col-span="2" itemType="empty"></DxFormItem>
            <DxFormItem
              data-field="confirmPassword"
              :editorOptions="{ mode: 'password' }"
            />
          </DxFormItem>
        </DxDatagridEditForm>
      </DxEditing>
      <DxGroupPanel :visible="true" />
      <DxGrouping :auto-expand-all="true" />
      <DxPaging />
      <DxSearchPanel :visible="true" />
      <DxColumn data-field="id" :visible="false" :allowEditing="false" />
      <DxColumn data-field="userName" :fixed="true">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="email">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="newPassword" data-type="password" :visible="false">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn
        data-field="confirmPassword"
        data-type="password"
        :visible="false"
      >
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="fullName" />

      <DxColumn data-field="phoneNumber" />
      <DxColumn
        v-if="hasPermission('roles.view')"
        data-field="roles"
        cell-template="rolesCellTemplate"
        width="200"
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
      <DxColumn data-field="isLockedOut" />
      <DxColumn data-field="isEnabled" />
      <template #getTitle>
        <DxToolbar>
          <DxToolbarItem #default location="center">
            <div class="toolbar-label">
              <b>{{ isNewRow ? "New User" : "Edit User" }}</b>
            </div>
          </DxToolbarItem>

          <DxToolbarItem
            :options="closeButtonOptions"
            location="after"
            widget="dxButton"
          />
        </DxToolbar>
      </template>
    </DxDataGrid>
    <DxPopup
      :ref="changePasswordPopupRefName"
      :drag-enabled="false"
      :show-title="true"
      @showing="onShowningChangePasswordPopup"
      title="Change Password"
    >
      <div>
        <DxForm
          :ref="newPasswordFormRefName"
          :form-data.sync="passwordFormData"
        >
          <DxFormItem
            data-field="newPassword"
            editor-type="dxTextBox"
            :editorOptions="{ mode: 'password' }"
          >
            <DxRequiredRule />
          </DxFormItem>
          <DxFormItem
            data-field="confirmPassword"
            editor-type="dxTextBox"
            :editorOptions="{ mode: 'password' }"
          >
            <DxRequiredRule />
          </DxFormItem>
        </DxForm>
      </div>
      <DxPopupToolbarItem
        :options="newPasswordSaveButtonOptions"
        toolbar="bottom"
        location="after"
        widget="dxButton"
      />
      <DxPopupToolbarItem
        :options="newPasswordCancelButtonOptions"
        toolbar="bottom"
        location="after"
        widget="dxButton"
      />
    </DxPopup>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import accountService from "../../services/account.service";
import roleService from "../../services/role.service";
import DxDataGrid, {
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
import notify from "devextreme/ui/notify";
import DxPopup, {
  DxToolbarItem as DxPopupToolbarItem
} from "devextreme-vue/popup";
import { ChangePassword } from "../../models/change-password.model";
import { PermissionValues } from "@/models/permission.model";

@Component({
  components: {
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
    DxDataGrid
  }
})
export default class Users extends Vue {
  private isNewRow = false;
  private gridRefName = "grid";
  private newPasswordFormRefName = "newPasswordForm";
  private changePasswordPopupRefName = "changePasswordPopup";

  public passwordFormData: ChangePassword = {
    userId: 0,
    newPassword: null,
    confirmPassword: null
  };

  public users = new CustomStore({
    key: "id",
    load: () => accountService.getUsers(),
    insert: (values: any) => {
      // TODO Van-e DevExtreme-es megoldás arra, hogy ne postolja?
      values.confirmPassword = undefined; // Nem szükséges postolni a confirmPassword-öt
      return accountService.insertUser(values);
    },
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
    load: async () => await roleService.get()
  });

  get dataGrid() {
    return (this.$refs[this.gridRefName] as any).instance;
  }

  get newPasswordForm() {
    return (this.$refs[this.newPasswordFormRefName] as any).instance;
  }

  get changePasswordPopup() {
    return (this.$refs[this.changePasswordPopupRefName] as any).instance;
  }

  closeButtonOptions = {
    icon: "close",
    onClick: () => {
      this.dataGrid.cancelEditData();
    }
  };

  changePasswordButtonOptions = {
    icon: "key",
    text: "Change Password",
    onClick: () => {
      this.changePasswordPopup.show();
    }
  };

  newPasswordSaveButtonOptions = {
    text: "Save",
    onClick: () => {
      const validation = this.newPasswordForm.validate();
      if (validation.isValid) {
        this.changePasswordPopup.hide();
        notify("Save New Password!");
      }
      accountService.changePassword(this.passwordFormData);
    }
  };

  newPasswordCancelButtonOptions = {
    text: "Cancel",
    onClick: () => {
      this.changePasswordPopup.hide();
    }
  };

  onShowningChangePasswordPopup() {
    this.initPasswordFields();
  }

  initPasswordFields() {
    this.newPasswordForm.resetValues();
  }

  onEditingStart() {
    this.isNewRow = false;
  }

  hasPermission(permissionValue: string) {
    return accountService.userHasPermission(
      permissionValue as PermissionValues
    );
  }

  onEditorPreparing(e) {
    if (e.dataField == "id" && e.parentType === "dataRow") {
      this.passwordFormData.userId = e.value;
    }

    if (e.dataField == "roles" && e.parentType === "dataRow") {
      e.editorName = "dxTagBox"; // Changes the editor's type
      e.editorOptions.onValueChanged = function(args) {
        // Implement your logic here
        e.setValue(args.value); // Updates the cell value
      };
    }
  }

  onInitNewRow() {
    this.isNewRow = true;
  }

  customizeItem(item) {
    if (
      item.dataField === "newPassword" ||
      item.dataField === "confirmPassword"
    ) {
      if (!this.isNewRow) {
        item.visible = false;
      }
    }

    if (item.dataField === "id" || item.name === "changePasswordButton") {
      if (this.isNewRow) {
        item.visible = false;
      }
    }
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
