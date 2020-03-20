<template>
  <div id="app">
    <div v-if="isLoggedIn()" class="navbar">
      <div class="navs">
        <DxButton
          v-if="true || hasPermission('home.view')"
          @click="navigate('/home')"
          :text="'Home'"
          icon="home"
          :disabled="$route.matched.some(({ name }) => name === 'Home')"
        />
        <DxButton
          v-if="true || hasPermission('users.view')"
          @click="navigate('/users')"
          text="Users"
          icon="group"
          :disabled="$route.matched.some(({ name }) => name === 'Users')"
        />
        <DxButton
          v-if="true || hasPermission('about.view')"
          @click="navigate('/about')"
          text="About"
          icon="info"
          :disabled="$route.matched.some(({ name }) => name === 'About')"
        />
      </div>
      <div class="other-buttons">
        <DxButton
          v-if="true || hasPermission('account.view')"
          @click="navigate('/account')"
          :text="profile().userName"
          icon="user"
          :disabled="$route.matched.some(({ name }) => name === 'Account')"
        />
        <DxButton
          @click="logout($event)"
          :text="loginButtonText"
          type="danger"
        />
      </div>
    </div>
    <main>
      <router-view />
    </main>
    <loader></loader>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { DxTabs, DxItem } from "devextreme-vue/tabs";
import { DxButton } from "devextreme-vue/button";
import { Logout, RefreshLogin } from "../src/store/actions/auth-actions";
import { mapState } from "vuex";
import accountService from "./services/account.service";
import { PermissionValues } from "./models/permission.model";
import Loader from "./components/Loader.vue";
import { OnIdle, OnActive } from "vue-plugin-helper-decorator";
import { LoginStatus } from "./enums/login-status.enum";
import EventBus from "./helpers/event-bus";

@Component({
  components: {
    DxTabs,
    DxItem,
    DxButton,
    Loader
  },
  computed: mapState({
    profile: (state: any, getters: any) => () => {
      return getters.currentUser();
    },
  })
})
export default class App extends Vue {
  private prettyIdleTime = "";
  private isIdle = false;
  private refreshTokenTimeoutId: number = null;
  private idleTimerId: number = null;
  private idleTimeExp: number = null;
  get isLoggedIn() { 
    return () => this.$store.getters.isLoggedIn();
  };

  mounted() {
    if (!this.isLoggedIn()) {
      this.navigate("/login");
    } else {
      this.calcRefreshTokenTimer();
    }
  }

  calcRefreshTokenTimer() {
    const accessTokenExpiryDate = this.$store.getters.accessTokenExpiryDate();
    const now = new Date().valueOf();
    const difference = accessTokenExpiryDate - now;
    this.refreshTokenTimer(difference);
  }

  refreshTokenTimer(difference: number) {
    const refreshTime = difference - 10 * 1000; // Lejárat előtt 10 másodperc

    console.log("Next Refresh: ");
    console.log(new Date(new Date().getTime() + refreshTime));

    this.refreshTokenTimeoutId = setTimeout(
      () => this.dispatchRefreshToken(),
      Math.max(refreshTime, 0)
    );
  }

  dispatchRefreshToken() {
    if(this.isLoggedIn() && this.$store.state.auth.loginStatus === LoginStatus.Success) {
      this.$store.dispatch(RefreshLogin).then(() => {
        this.calcRefreshTokenTimer();
      });
    }
  }

  prettyDate(time) {
    const date = new Date(parseInt(time));
    return date.toLocaleTimeString(navigator.language, {
      minute: "2-digit",
      second: "2-digit"
    });
  }

  onItemClickRoute(e: any) {
    this.navigate(e.itemData.path);
  }

  navigate(to) {
    if (this.$route.path !== to) {
      this.$router.push(to);
    }
  }

  logout() {
    clearTimeout(this.idleTimerId);
    this.idleTimerId = null;
    clearTimeout(this.refreshTokenTimeoutId);
    this.refreshTokenTimeoutId = null;

    this.$store.dispatch(Logout);
  }

  hasPermission(permissionValue: string) {
    return accountService.userHasPermission(
      permissionValue as PermissionValues
    );
  }

  @Watch('$store.state.auth.loginStatus')
  private onPropertyChanged(value: LoginStatus, oldValue: LoginStatus) {
    if(value === LoginStatus.Success) {
      this.calcRefreshTokenTimer();
    }
  }

  get loginButtonText() {
    if (this.isIdle) {
      return `Logout (${this.prettyIdleTime})`;
    }
    return "Logout";
  }

  idleTimer() {
    if (this.isLoggedIn() && this.isIdle) {
      const now = new Date().valueOf();
      const idleTimedifference = this.idleTimeExp - now;
      this.prettyIdleTime = this.prettyDate(idleTimedifference);
      console.log(this.prettyIdleTime);
      this.idleTimerId = setTimeout(this.idleTimer, 1000);
      if (idleTimedifference < 0) {
        this.logout();
      }
    }
  }

  @OnIdle()
  public whenIdle() {
    this.isIdle = true;
    if (this.isLoggedIn()) {
      const dateTimeNow = new Date();
      this.idleTimeExp = new Date(dateTimeNow.getTime() + 1 * 7000).valueOf();
      // if (!this.idleTimerId) {
      this.idleTimer();
      // }
    }
  }

  @OnActive()
  public whenActive() {
    this.isIdle = false;
    // if (this.$store.getters.isLoggedIn()) {
    //   clearTimeout(this.idleTimerId);
    //   this.idleTimerId = null;
    // }
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
  grid-template-columns: auto 20%;
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
