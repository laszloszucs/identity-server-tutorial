<template>
  <div>
    <App v-if="isLoginSuccess" />
    <Login v-else />
    <loader :load="!hasLoadedOnce && isLoading" :isWhite="true"></loader>
  </div>
</template>

<script lang="ts">
import {
  LoginWithRefreshToken,
  RedirectForLogin
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
  // computed: mapState({
  //   profile: (state: any, getters: any) => () => {
  //     return getters.currentUser();
  //   },
  //   hasLoadedOnce: (state: any) => {
  //     return state.auth.hasLoadedOnce;
  //   },
  //   isLoading: (state: any) => {
  //     return state.auth.loginStatus === LoginStatus.Loading;
  //   }
  // })
})
export default class Main extends Vue {
  refreshTimer = null;
  hub = null;
  mainWebsocketHubStarted = false;

  get isLoginSuccess() {
    debugger;
    return (
      this.$store.state.auth.loginStatus === LoginStatus.Success ||
      this.$store.state.auth.loginStatus === LoginStatus.RefreshSuccess
    );
  }

  get hasLoadedOnce() {
    return this.$store.state.auth.hasLoadedOnce;
  }

  get isLoading() {
    return this.$store.state.auth.loginStatus === LoginStatus.Loading;
  }

  created() {
    if (this.$store.state.auth.rememberMe) {
      this.$store.dispatch(LoginWithRefreshToken);
    } else {
      this.$store.dispatch(RedirectForLogin);
    }
  }
}
</script>

<style lang="scss" scoped></style>
