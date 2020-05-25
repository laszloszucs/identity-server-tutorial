<template>
  <div :class="{ 'error': errorMessage }" class="main">
    <div v-if="errorMessage" class="errorMessage">{{ errorMessage }}</div>
    <App v-if="isLoginSuccess" />
    <Login v-if="showLoginScreen" />
    <loader :load="loadingStatus" :isWhite="true"></loader>
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
import { LoginStatus } from "./enums/login-status.enum";
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

  get loadingStatus() {
    return this.$store.state.auth.loginStatus === LoginStatus.Loading;
  }

  get showLoginScreen() {
    return (
      this.$store.state.auth.loginStatus === LoginStatus.Logout ||
      this.$store.state.auth.loginStatus === LoginStatus.Error
    );
  }

  get isLoginSuccess() {
    return this.$store.state.auth.loginStatus === LoginStatus.Success;
  }

  get errorMessage() {
    return this.$store.state.auth.errorMessage;
  }

  created() {
    // this.$store.dispatch(ErrorMessage, null);
    this.$store.dispatch(CheckingOffline).then(() => {
      if (this.$store.state.auth.rememberMe) {
        this.$store.dispatch(LoginWithRefreshToken);
      } else {
        this.$store.dispatch(RedirectForLogin);
      }
    });
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
  background-color: #ff7958;
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
