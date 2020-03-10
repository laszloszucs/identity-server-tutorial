<template>
  <div>
    <div class="headline">
      <!-- <img src="./src/assets/logo.png" /> -->
      <h1>Your doge profile</h1>
    </div>
    <p v-if="profile.name">
      <strong>Name:</strong> {{ profile.title }} {{ profile.name }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapState } from "vuex";

@Component({
  computed: mapState({ profile: (state: any) => state.user.profile })
})
export default class Account extends Vue {}
</script>

<style lang="scss" scoped>
.headline {
  margin-top: 1em;
  display: flex;
  img {
    height: 80px;
    width: 80px;
    border-radius: 50%;
  }
}
</style>
