<template>
  <div id="app">
    <div v-if="isLoggedIn()" class="navbar">
      <div class="navs">
        <DxButton v-if="true || hasPermission('home.view')"
          @click="navigate('/home')"
          text="Home"
          icon="home"
          :disabled="$route.matched.some(({ name }) => name === 'Home')"
        />
        <DxButton v-if="true || hasPermission('users.view')"
          @click="navigate('/users')"
          text="Users"
          icon="group"
          :disabled="$route.matched.some(({ name }) => name === 'Users')"
        />
        <DxButton v-if="true || hasPermission('about.view')"
          @click="navigate('/about')"
          text="About"
          icon="info"
          :disabled="$route.matched.some(({ name }) => name === 'About')"
        />
      </div>
      <div class="other-buttons">
        <DxButton v-if="true || hasPermission('account.view')"
          @click="navigate('/account')"
          :text="profile().userName"
          icon="user"
          :disabled="$route.matched.some(({ name }) => name === 'Account')"
        />
        <DxButton @click="logout($event)" text="Logout" type="danger" />
      </div>      
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
import { Logout } from "../src/store/actions/auth-actions";
import { mapState } from "vuex";
import accountService from "./services/account.service";
import { PermissionValues } from "./models/permission.model";

@Component({
  components: {
    DxTabs,
    DxItem,
    DxButton
  },
  computed: mapState({
    profile: (state: any, getters: any) => () => {
      return getters.currentUser();
    },
    isLoggedIn: (state, getters) => () => {
      return getters.isLoggedIn();
    }
  })
})
export default class App extends Vue {
  onItemClickRoute(e: any) {
    this.navigate(e.itemData.path);
  }

  navigate(to) {
    if (this.$route.path !== to) {
      this.$router.push(to);
    }
  }

  logout() {
    this.$store.dispatch(Logout);
  }

  hasPermission(permissionValue: string) {
    return accountService.userHasPermission(permissionValue as PermissionValues);
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
  grid-template-columns: auto 15%;
}

.navs {
  display: grid;
  grid-template-columns: auto auto auto;
}

.other-buttons {
  display: grid;
  grid-template-columns: auto auto;
  gap: 5px;
}

.userName {
  margin: auto;
}

.dx-button {
  border-radius: 0px !important;
  border: none !important;
}

.navs .dx-button {
  border-right: 1px solid #2c3e50 !important;
}

.dx-button.dx-button-danger {
  background-color: #fff !important;
  color: #d9534f !important;
  border: 1px solid #d9534f !important;
  &:hover {
    background-color: #d9534f !important;
    color: #fff !important;
    border: 1px solid #d9534f !important;
  }
}

.dx-button.dx-state-disabled {
  opacity: 100 !important;
  background-color: #e1e2e1c7 !important;
  i {
    opacity: 100 !important;
  }
  span {
    opacity: 100 !important;
  }
}

main {
  width: 80%;
  margin: auto;
}
</style>
