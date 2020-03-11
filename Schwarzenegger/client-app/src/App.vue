<template>
  <div id="app">
    <div v-if="isAuthenticated" class="navbar">
      <DxTabs :items="tabs" :onItemClick="route" height="10px"> </DxTabs>
      <DxButton @click="logout($event)" text="Logout" type="danger" />
    </div>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { DxTabs, DxItem } from "devextreme-vue/tabs";
import { DxButton } from "devextreme-vue/button";
import { AUTH_LOGOUT } from "../src/store/actions/auth";
import store from "./store";

@Component({
  components: {
    DxTabs,
    DxItem,
    DxButton
  }
})
export default class App extends Vue {
  private tabs = [
    { text: "Home", path: "/" },
    { text: "About", path: "/about" },
    { text: "Account", path: "/account" }
  ];

  get isAuthenticated() {
    return store.getters.isAuthenticated;
  }

  route(e: any) {
    if (this.$route.path !== e.itemData.path) {
      this.$router.push(e.itemData.path);
    }
  }

  logout() {
    this.$store.dispatch(AUTH_LOGOUT).then(() => {
      this.$router.push("/login");
    });
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  display: grid;
  gap: 20px;
  grid-template-rows: auto auto;
}

.navbar {
  display: grid;
  grid-template-columns: auto 82px;
  gap: 20px;
  padding: 20px 20px 20px 20px;
}

main {
  text-align: center;
}
</style>
