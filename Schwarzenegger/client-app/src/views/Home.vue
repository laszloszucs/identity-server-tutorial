<template>
  <div class="home">
    <div>Login</div>
    <div v-for="(item, index) in values" :key="index">
      <p>{{ item }}</p>
    </div>
    <button @click="callApi">Call API</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";

@Component
export default class Hello extends Vue {
  private values: string[] = ["no data yet"];

  async callApi() {
    try {
      const response =
        await axios.get("https://localhost:44300/api/identity");
      this.values = response.data;
    } catch (err) {
      this.values = [err];
    }
  }
}
</script>
