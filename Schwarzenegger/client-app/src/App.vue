<template>
  <div id="app">
    <div v-if="!isSessionExpired()" class="navbar">
      <div class="navs">
        <!-- TODO: Csere DxToolbar-ra? -->
        <DxButton
          @click="navigate('/home')"
          :text="isSmall('Home')"
          icon="home"
          :disabled="$route.matched.some(({ name }) => name === 'Home')"
        />
        <DxButton
          v-if="hasPermission('users.view')"
          @click="navigate('/users')"
          :text="isSmall('Users')"
          icon="group"
          :disabled="$route.matched.some(({ name }) => name === 'Users')"
        />
        <DxButton
          v-if="hasPermission('roles.view')"
          @click="navigate('/roles')"
          :text="isSmall('Roles')"
          icon="fieldchooser"
          :disabled="$route.matched.some(({ name }) => name === 'Roles')"
        />
        <DxButton
          v-if="hasPermission('about.view')"
          @click="navigate('/about')"
          :text="isSmall('About')"
          icon="info"
          :disabled="$route.matched.some(({ name }) => name === 'About')"
        />
      </div>
      <div :class="{ 'other-buttons': hasPermission('account.view') }">
        <DxButton
          id="adminButton"
          class="admin-button"
          v-if="hasPermission('account.view')"
          @click="navigate('/account')"
          :text="isSmall(profile().userName)"
          icon="user"
          :disabled="$route.matched.some(({ name }) => name === 'Account')"
        />
        <DxButton
          id="logout"
          class="logout-button"
          @click="logout()"
          :text="logoutText"
          :icon="isNotSmall('runner')"
          type="danger"
        />
      </div>
    </div>
    <main :class="{ 'logged-in': !isSessionExpired() }">
      <router-view />
    </main>
    <loader :load="!hasLoadedOnce && isLoading" :isWhite="true"></loader>
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
import EventBus from "./helpers/event-bus";
import { LoginStatus } from "@/enums/login-status.enum";

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
    hasLoadedOnce: (state: any) => {
      return state.auth.hasLoadedOnce;
    },
    isLoading: (state: any) => {
      return state.auth.loginStatus === LoginStatus.Loading;
    }
  })
})
export default class App extends Vue {
  // private displayAtRemainedMilliSeconds = 31000;
  // private IdleTimeoutMilliSeconds = 45000;
  private displayAtRemainedMilliSeconds = 450000;
  private IdleTimeoutMilliSeconds = 450000;
  private breakPoint = 768;
  private isBig = window.innerWidth >= this.breakPoint;

  private prettyIdleTime = "";
  private idleTimeExp = null;
  private isIdle = false;
  private idleTimedifference = null;
  private logoutText = null;

  isNotSmall(text) {
    return this.isBig ? null : text;
  }

  isSmall(text) {
    return !this.isBig ? null : text;
  }

  getLogoutText() {
    return `${this.isBig ? "Logout" : ""}${this.isBig ? " " : ""}${
      this.isIdle ? "(" + this.prettyIdleTime + ")" : ""
    }`;
  }

  @Watch("isIdle")
  onIsIdleChanged() {
    this.logoutText = this.getLogoutText();
  }

  @Watch("isBig")
  onIsBigChanged() {
    this.logoutText = this.getLogoutText();
  }

  get isLoggedIn() {
    return () => this.$store.getters.isLoggedIn();
  }

  get isSessionExpired() {
    return () => this.$store.getters.isSessionExpired();
  }

  mounted() {
    EventBus.$on("LOGIN", () => {
      this.init();
      this.logoutText = this.getLogoutText();
    });
    if (this.isSessionExpired()) {
      this.navigate("/login");
    } else {
      this.$store.dispatch(RefreshLogin).then(() => {
        this.init();
      });
      this.logoutText = this.getLogoutText();
    }

    document.addEventListener("mousedown", this.resetIdleTimer);
    document.addEventListener("keydown", this.resetIdleTimer);
    document.addEventListener("touchstart", this.resetIdleTimer);

    window.addEventListener("resize", this.reportWindowSize);
  }

  init() {
    if (!this.$store.getters.rememberMe()) {
      this.resetIdleTimer();
      this.idleTimer();
    }
  }

  reportWindowSize() {
    this.isBig = window.innerWidth >= this.breakPoint;
  }

  resetIdleTimer(event: any = null) {
    this.isIdle = false;
    const dateTimeNow = new Date();
    this.idleTimeExp = new Date(
      dateTimeNow.getTime() + this.IdleTimeoutMilliSeconds
    ).valueOf();
    if (event?.target.closest("#logout") && event?.which === 1) {
      // Valamiért nem mindig fut le a logout-ra kötött click esemény
      this.logout();
    }
  }

  prettyDate(time) {
    const date = new Date(parseInt(time)); // TODO moment.js-t be kell vezetni
    return date.toLocaleTimeString(navigator.language, {
      minute: "2-digit",
      second: "2-digit"
    });
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
      this.logoutText = this.getLogoutText();
      setTimeout(() => this.idleTimer(), 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: grid;
  grid-template-rows: auto 1fr max-content;
}

.navbar {
  margin: 0 15px 15px 15px;
  display: grid;
  grid-template-columns: 1fr max-content;
}

.navs {
  display: grid;
  // grid-template-columns: repeat(3, 1fr);
  grid-auto-flow: column;
}

.other-buttons {
  display: grid;
  grid-template-areas: "admin-button logout-button";
  @media (max-width: 767px) {
    grid-template-columns: 70px 120px; // repeat(2, 100px);
  }
  @media (min-width: 768px) {
    grid-template-columns: 105px 130px; // repeat(2, 150px);
  }
}

.admin-button {
  grid-area: admin-button;
}

.logout-button {
  grid-area: logout-button;
}

.userName {
  margin: auto;
}

.dx-button {
  border-radius: 0px !important;
  border: none !important;
}

.navbar .navs .dx-button {
  border-bottom: 1px solid grey !important;
  border-right: 1px solid #2c3e50 !important;
  &:first-child {
    border-left: 1px solid #2c3e50 !important;
  }
  &:last-child {
    border-right: none !important;
  }
  &.dx-state-disabled {
    border-bottom: none !important;
  }
}

#adminButton {
  // border: none !important;
  border-left: 1px solid grey !important;
  border-bottom: 1px solid grey !important;
  &.dx-state-disabled {
    border-bottom: none !important;
  }
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
  z-index: -1;
  opacity: 100 !important;
  background-color: rgba(0, 165, 187, 0.28) !important;
  border-bottom: none !important;
  -webkit-box-shadow: 0px 0px 35px -4px rgba(0, 165, 187, 0.75);
  -moz-box-shadow: 0px 0px 35px -4px rgba(0, 87, 187, 0.75);
  box-shadow: 0px 0px 35px -4px rgba(0, 165, 187, 0.75);
  i {
    opacity: 100 !important;
  }
  span {
    opacity: 100 !important;
  }
}

.dx-button.dx-state-hover {
  background-color: rgba(0, 165, 187, 0.1) !important;
  // -webkit-box-shadow: 0px 0px 40px 5px rgba(0, 165, 187, 0.75);
  // -moz-box-shadow: 0px 0px 40px 5px rgba(0, 87, 187, 0.75);
  // box-shadow: 0px 0px 40px 5px rgba(0, 165, 187, 0.75);
}

main {
  overflow: auto;
  margin: 1%;
  &.logged-in {
    border-radius: 0.3rem;
    padding: 30px;
    -webkit-box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
    box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
  }
}

.dx-button.dx-button-danger {
  ::v-deep .dx-icon-runner {
    color: red !important;
  }
  &.dx-state-hover {
    ::v-deep .dx-icon.dx-icon-runner {
      color: #fff !important;
    }
  }
}
</style>
