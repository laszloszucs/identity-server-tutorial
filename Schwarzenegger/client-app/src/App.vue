<template>
  <div id="app">
    <div v-if="!isSessionExpired()" class="navbar">
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
          v-if="hasPermission('users.view')"
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
          id="logout"
          @click="logout()"
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
import { Component, Vue } from "vue-property-decorator";
import { DxTabs, DxItem } from "devextreme-vue/tabs";
import { DxButton } from "devextreme-vue/button";
import { Logout, RefreshLogin } from "../src/store/actions/auth-actions";
import { mapState } from "vuex";
import accountService from "./services/account.service";
import { PermissionValues } from "./models/permission.model";
import Loader from "./components/Loader.vue";
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
    }
  })
})
export default class App extends Vue {
  private displayAtRemainedMilliSeconds = 31000;
  private IdleTimeoutMilliSeconds = 45000;

  private prettyIdleTime = "";
  private idleTimeExp = null;
  private isIdle = false;
  private idleTimedifference = null;

  get isLoggedIn() {
    return () => this.$store.getters.isLoggedIn();
  }

  get isSessionExpired() {
    return () => this.$store.getters.isSessionExpired();
  }

  get loginState() {
    return this.$store.state.auth.loginStatus;
  }

  get loginButtonText() {
    if (this.isIdle) {
      return `Logout (${this.prettyIdleTime})`;
    }
    return "Logout";
  }

  mounted() {
    EventBus.$on("LOGIN", () => {
      this.init();
    });
    if (this.isSessionExpired()) {
      this.navigate("/login");
    } else {
      this.$store.dispatch(RefreshLogin).then(() => {
        this.init();
      });
    }

    document.addEventListener("mousedown", this.resetIdleTimer);
    document.addEventListener("keydown", this.resetIdleTimer);
    document.addEventListener("touchstart", this.resetIdleTimer);
  }

  init() {
    this.calcRefreshTokenTimer();

    this.resetIdleTimer();
    this.idleTimer();
  }

  resetIdleTimer(event: any = null) {
    this.isIdle = false;
    const dateTimeNow = new Date();
    this.idleTimeExp = new Date(
      dateTimeNow.getTime() + this.IdleTimeoutMilliSeconds
    ).valueOf();
    if (event?.target.closest("#logout")) {
      // Valamiért nem mindig fut le a logout-ra kötött click esemény
      this.logout();
    }
  }

  calcRefreshTokenTimer() {
    const accessTokenExpiryDate = this.$store.getters.accessTokenExpiryDate();
    const now = new Date().valueOf();
    const difference = accessTokenExpiryDate - now;
    this.refreshTokenTimer(difference);
  }

  refreshTokenTimer(difference: number) {
    const refreshTime = difference - 10000; // Lejárat előtt 10 másodperc
    // const currentTime = new Date();
    // console.log("Current Time: ");
    // console.log(currentTime);
    // console.log("Next Refresh: ");
    // console.log(new Date(currentTime.getTime() + refreshTime));

    setTimeout(() => this.dispatchRefreshToken(), Math.max(refreshTime, 0));
  }

  dispatchRefreshToken() {
    const isLoggedIn = this.isLoggedIn();
    const loginState = this.loginState;
    // console.log("isLoggedIn");
    // console.log(isLoggedIn);
    // console.log("loginState");
    // console.log(loginState);

    if (isLoggedIn) {
      if (
        loginState === LoginStatus.Success ||
        loginState === LoginStatus.RefreshSuccess
      ) {
        this.$store.dispatch(RefreshLogin).then(() => {
          this.calcRefreshTokenTimer();
        });
      }
    }

    if (loginState === LoginStatus.Logout) {
      this.navigate("/login");
    }
  }

  prettyDate(time) {
    const date = new Date(parseInt(time)); // TODO moment.js-t be kell vezetni
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
    this.$store.dispatch(Logout);
  }

  hasPermission(permissionValue: string) {
    return accountService.userHasPermission(
      permissionValue as PermissionValues
    );
  }

  idleTimer() {
    if (this.isLoggedIn()) {
      const now = new Date().valueOf();
      const idleTimeExp = this.idleTimeExp;
      this.idleTimedifference = idleTimeExp - now;
      if (this.idleTimedifference < this.displayAtRemainedMilliSeconds) {
        this.isIdle = true;
      }
      if (this.idleTimedifference < 0) {
        console.log("Idle Logout...");
        this.logout();
        return;
      }
      this.prettyIdleTime = this.prettyDate(this.idleTimedifference);
      // console.log(this.prettyIdleTime);
      setTimeout(() => this.idleTimer(), 1000);
    }
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
