<template>
  <div>
    <div v-if="profile()">
      <!-- <img src="./src/assets/logo.png" /> -->
      <h1>Username: {{ profile().userName }}</h1>
    </div>
    <p><strong>Full Name:</strong> {{ profile().fullName }}</p>
    <p><strong>Email:</strong> {{ profile().email }}</p>
    <p><strong>Phone:</strong> {{ profile().phoneNumber }}</p>
    <p><strong>Roles:</strong> {{ profile().roles }}</p>
    <p><strong>UserPermissions:</strong> {{ userPermissions() }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapState } from "vuex";

@Component({
  computed: mapState({
    profile: (state: any, getters: any) => () => {
      return getters.currentUser();
    },
    userPermissions: (state: any, getters: any) => () => {
      return getters.userPermissions();
    }
  })
})
export default class Account extends Vue {}
</script>

<style lang="scss" scoped></style>
