<template>
  <div class="home">
    <button @click="callApi">Call API</button>
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

@Component({
  components: {
    DxDataGrid,
    DxGrouping,
    DxGroupPanel,
    DxSearchPanel,
    DxPaging
  }
})
export default class Hello extends Vue {
  private values: string[] = [];

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
