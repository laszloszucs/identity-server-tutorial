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
import { RefreshLogin, Logout } from "./store/actions/auth-actions";
import startRefreshTokenTimer from "./utils/loginRefresh";
import {
  MainWebsocketHub,
  MainWebsocketCallbackOptions
} from "./utils/mainWebsocketHub";
import { WebsocketMethodType } from "./enums/websocket-method-type.enum";

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
  data: {
    refreshTimer: null
  },
  created() {
    EventBus.$on("START_MAIN_WEBSOCKET_HUB", () => {
      if (!this.mainWebsocketHubStarted) {
        this.mainWebsocketHubStarted = true;
        this.hub = new MainWebsocketHub(
          "https://localhost:44300/mainHub",
          new MainWebsocketCallbackOptions(
            this.forceRefreshToken,
            this.forceLogout,
            this.receiveMessage,
            this.disconnected,
            this.reconnecting
          )
        );

        this.hub.startConnection();
      }
    });
    if (!this.$store.getters.rememberMe()) {
      if (this.$route.path !== "/login") {
        this.$router.push("/login");
      }
    } else {
      EventBus.$emit("LOADING");
      this.$store.dispatch(RefreshLogin).then(() => {
        this.refreshTimer = startRefreshTokenTimer(this.$store);
        this.$router.push("/").then(() => {
          EventBus.$emit("LOGIN");
          EventBus.$emit("START_MAIN_WEBSOCKET_HUB");
        });
      });
    }
  },
  methods: {
    forceRefreshToken() {
      clearTimeout(this.refreshTimer);
      this.$store.dispatch(RefreshLogin).then(() => {
        this.refreshTimer = startRefreshTokenTimer(this.$store);
        location.reload();
      });
    },
    forceLogout() {
      clearTimeout(this.refreshTimer);
      this.$store.dispatch(Logout);
      this.hub.stopConnection();
    },
    receiveMessage(user: string, message: string) {
      EventBus.$emit(WebsocketMethodType.Message.toString(), user, message);
    },
    disconnected() {
      clearTimeout(this.refreshTimer);
    },
    reconnecting() {
      this.$store.dispatch(RefreshLogin).then(() => {
        this.refreshTimer = startRefreshTokenTimer(this.$store);
        this.hub.setNewAccessToken();
      });
    }
  }
}).$mount("#app");
