<template>
  <div>
    <div>
      <!-- <img src="./src/assets/logo.png" /> -->
      <h1>Your doge profile</h1>
    </div>
    <p v-if="profile.name">
      <strong>Name:</strong> {{ profile.title }} {{ profile.name }} {{ asd }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapState } from "vuex";
import store from "../../store";

@Component({
  computed: mapState({
    profile: (state: any) => {
      return state.user.profile;
    }
  })
})
export default class Account extends Vue {
  mounted() {
    debugger;
  }
  get asd() {
    debugger;
    return store;
  }
}
</script>

<style lang="scss" scoped></style>
