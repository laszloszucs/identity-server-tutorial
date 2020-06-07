<template>
  <div v-if="user">
    <div>
      <h1>Username: {{ user.userName }}</h1>
    </div>
    <p><strong>Full Name:</strong> {{ user.fullName }}</p>
    <p><strong>Email:</strong> {{ user.email }}</p>
    <p><strong>Phone:</strong> {{ user.phoneNumber }}</p>
    <p><strong>Roles:</strong> {{ user.roles }}</p>
    <p><strong>Permissions:</strong> {{ permissions }}</p>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";

export default class Account extends Vue {
  get user() {
    return this.$store.state.auth.user;
  }
  get permissions() {
    return this.$store.state.auth.permissions;
  }
}
</script>

<style lang="scss" scoped></style>
