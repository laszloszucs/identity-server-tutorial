<template>
  <div id="app">
    <navbar :logoutText="logoutText"></navbar>
    <main class="logged-in">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Logout } from "../src/store/actions/auth-actions";
import accountService from "./services/account.service";
import { PermissionValues } from "./models/permission.model";
import Navbar from "./components/Navbar.vue";

@Component({
  components: {
    Navbar
  }
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

  mounted() {
    if (!this.$store.state.auth.rememberMe) {
      this.resetIdleTimer();
      this.idleTimer();

      document.addEventListener("mousedown", this.resetIdleTimer);
      document.addEventListener("keydown", this.resetIdleTimer);
      document.addEventListener("touchstart", this.resetIdleTimer);
    }

    this.logoutText = this.getLogoutText();

    window.addEventListener("resize", this.reportWindowSize);
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
    const hasPermission = accountService.userHasPermission(
      permissionValue as PermissionValues
    );
    return hasPermission;
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
  font-family: "Roboto", sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: grid;
  grid-template-rows: auto 1fr max-content;
}

main {
  overflow: auto;
  &.logged-in {
    border-radius: 0.3rem;
    padding: 30px;
    -webkit-box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
    box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
  }
}
</style>
