import "normalize.css/normalize.css";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import "../public/style.scss";
import "sass-material-colors";
import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
import i18n from "./i18n";
import EventBus from "./helpers/event-bus";
import { RefreshLogin } from "./store/actions/auth-actions";
import startRefreshTokenTimer from "./utils/loginRefresh";

axios.interceptors.request.use(
  config => {
    const accessToken = store.getters.accessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },

  error => {
    return Promise.reject(error);
  }
);

Vue.config.productionTip = false;

export default new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
  created() {
    if (!this.$store.getters.rememberMe()) {
      if (this.$route.path !== "/login") {
        this.$router.push("/login");
      }
    } else {
      if (this.$store.getters.isSessionExpired()) {
        EventBus.$emit("LOADING");
        this.$store.dispatch(RefreshLogin).then(() => {
          startRefreshTokenTimer(this.$store);
          this.$router.push("/").then(() => {
            EventBus.$emit("LOGIN");
          });
        });
      } else {
        startRefreshTokenTimer(this.$store);
      }
    }
  }
}).$mount("#app");
