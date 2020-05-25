import "normalize.css/normalize.css";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import "../public/style.scss";
import "sass-material-colors";
import Vue from "vue";
import Main from "./Main.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
import i18n from "./i18n";

axios.interceptors.request.use(
  config => {
    const accessToken = (store.state as any).auth.accessToken;
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
  render: h => h(Main)
}).$mount("#app");
