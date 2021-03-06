<template>
  <div :class="{ error: errorMessage }" class="main">
    <div v-if="errorMessage" class="errorMessage">{{ errorMessage }}</div>
    <App v-if="isLoginSuccess" />
    <Login v-else />
    <loader :load="isLoading" :isFull="isFullLoad"></loader>
  </div>
</template>

<script lang="ts">
import {
  LoginWithRefreshToken,
  RedirectForLogin,
  CheckingOffline
} from "./store/actions/auth-actions";
import { Component, Vue } from "vue-property-decorator";
import App from "./App.vue";
import Login from "./Login.vue";
import { AppStatus } from "./enums/app-status.enum";
import Loader from "./components/Loader.vue";

@Component({
  components: {
    App,
    Login,
    Loader
  }
})
export default class Main extends Vue {
  refreshTimer = null;
  hub = null;
  mainWebsocketHubStarted = false;

  get isLoading() {
    return (
      this.$store.state.auth.appStatus === AppStatus.Logging ||
      this.$store.state.auth.appStatus === AppStatus.Init ||
      this.$store.state.auth.appStatus === AppStatus.AutoLogging ||
      this.$store.state.auth.appStatus === AppStatus.AutoReLogging
    );
  }

  get isFullLoad() {
    return (
      this.$store.state.auth.appStatus === AppStatus.Init ||
      this.$store.state.auth.appStatus === AppStatus.AutoLogging ||
      this.$store.state.auth.appStatus === AppStatus.AutoReLogging
    );
  }

  get isLoginSuccess() {
    return this.$store.state.auth.appStatus === AppStatus.Success;
  }

  get errorMessage() {
    return this.$store.state.auth.errorMessage;
  }

  created() {
    if (this.$store.state.auth.rememberMe) {
      this.$store.dispatch(CheckingOffline).then(() => {
        this.$store.dispatch(LoginWithRefreshToken);
      });
    } else {
      this.$store.dispatch(RedirectForLogin);
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr;
  &.error {
    grid-template-rows: 30px 1fr;
  }
}
.errorMessage {
  @import "public/variables";
  z-index: 10000;
  background-color: $attention-color;
  color: black;
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 18px;
  display: flex;
  justify-content: center; /* align horizontal */
  align-items: center; /* align vertical */
}
</style>
