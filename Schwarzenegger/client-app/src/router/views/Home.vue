<template>
  <div class="home">
    <DxButton @click="callApi" type="success" height="35" width="95"
      >Call API</DxButton
    >
    <DxDataGrid
      :allow-column-reordering="true"
      :data-source="values"
      :show-borders="true"
    >
      <DxGroupPanel :visible="true" />
      <DxGrouping :auto-expand-all="true" />
      <DxPaging />
      <DxSearchPanel :visible="true" />
    </DxDataGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import {
  DxDataGrid,
  DxGrouping,
  DxGroupPanel,
  DxSearchPanel,
  DxPaging
} from "devextreme-vue/data-grid";
import DxButton from "devextreme-vue/button";

@Component({
  components: {
    DxDataGrid,
    DxGrouping,
    DxGroupPanel,
    DxSearchPanel,
    DxPaging,
    DxButton
  }
})
export default class Home extends Vue {
  values: string[] = [];
  hub: any;
  user: string = null;
  typedMessage: string = null;
  messages: string[] = [];

  async callApi() {
    try {
      const response = await axios.get("https://localhost:44300/api/identity");
      this.values = response.data;
    } catch (err) {
      this.values = [err];
    }
  }
}
</script>
