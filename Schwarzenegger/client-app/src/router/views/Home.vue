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
import { USER_REQUEST } from "../../store/actions/user";

@Component
export default class Hello extends Vue {
  private values: string[] = ["no data yet"];

  async callApi() {
    try {
      this.$store
        .dispatch(USER_REQUEST)
        .then(data => {
          this.values = data;
        })
        .catch((err: Error) => {
          this.values = [err.message];
        });
      const response = await axios.get("https://localhost:44300/api/identity");
      this.values = response.data;
    } catch (err) {
      this.values = [err];
    }
  }
}
</script>
