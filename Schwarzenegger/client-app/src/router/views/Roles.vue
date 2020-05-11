<template>
  <div class="roles">
    <DxDataGrid
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
          <DxFormItem :col-count="1" :col-span="1" item-type="group">
            <DxFormItem :col-span="1" data-field="id" />
            <DxFormItem data-field="name" />
            <DxFormItem data-field="description" />
          </DxFormItem>
          <DxFormItem :col-count="1" :col-span="1" item-type="group">
            <DxFormItem
              :col-span="1"
              data-field="permissions"
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
        data-field="permissions"
        cell-template="permissionsCellTemplate"
        edit-cell-template="permissionsEditCellTemplate"
        width="200"
      />
      <DxColumn data-field="createdBy" />
      <DxColumn data-field="updatedBy" />
      <DxColumn data-field="CreatedDate" />
      <DxColumn data-field="UpdatedDate" />
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
      <template #permissionsEditCellTemplate="cell">
        <DxList
          :dataSource="groupedPermissionsLookup"     
          :show-selection-controls="true"
          :grouped="true"
          selection-mode="multiple"
          :selected-item-keys.sync="cell.data.value"
          valueExpr="value"
          displayExpr="name"
          :on-selection-changed="(value) => onValueChanged(cell)"
        >
        </DxList>
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
import DxList from "devextreme-vue/list";
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
import DataSource from 'devextreme/data/data_source';
import { createStore } from 'devextreme-aspnet-data-nojquery';

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
    DxSelectBox,
    DxList
  }
})
export default class Roles extends Vue {
  private isNewRow = false;
  private gridRefName = "rolesGrid";
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
      logger.log(e.editorOptions.value, "purple");
      e.editorOptions.onValueChanged = function(args) {
        // Implement your logic here
        debugger;
        e.setValue(args.value); // Updates the cell value
      };
    }
  }

  onInitNewRow() {
    this.isNewRow = true;
  }

  onEditingStart() {
    this.isNewRow = false;
  }

  onValueChanged(cellInfo) {
    debugger;
    cellInfo.data.setValue(cellInfo.data.value);
    cellInfo.data.component.updateDimensions();
  }
  
  groupBy(array, key) {
    return array.reduce(function(rv, item) {
      (rv[item[key]] = rv[item[key]] || []).push(item);
      return rv;
    }, {});
  };

  get dataGrid() {
    return (this.$refs[this.gridRefName] as any).instance;
  }

  permissionGrouped() {
    const permissions = this.groupBy(Permission.getAllPermissions(), 'groupName');

    const arr = Object.entries(permissions).map(([index, item]) => {
      return {
        key: index,
        items: item
      }
    });

    return arr;
  }

  private permissionsLookup = new DataSource({
    store: {
        type: "array",
        data: Permission.getAllPermissions(),
        key: 'value'
    }
  });

  private groupedPermissionsLookup = new DataSource({
    store: {
        type: "array",
        data: this.permissionGrouped(),
        group: 'groupName',
        key: 'value'
    }
  });
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
