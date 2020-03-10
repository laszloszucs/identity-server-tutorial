import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

axios.interceptors.request.use(
  config => {
    const accessToken: any = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },

  error => {
    return Promise.reject(error);
  }
);
