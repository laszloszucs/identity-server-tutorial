<template>
  <div class="users">
    <p>{{ users }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import accountService from "../../services/account.service";

@Component
export default class Users extends Vue {
  public users = [];

  async mounted() {
    this.users = await accountService.getUsers();
  }
}
</script>

<style lang="scss" scoped>
.about {
  text-align: center;
}
</style>
