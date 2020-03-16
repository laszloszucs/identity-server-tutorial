import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import DBkeys from "@/models/DBkeys";
import localStore from "@/helpers/local-store-manager";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

axios.interceptors.request.use(
  config => {
    const accessToken: any = localStorage.getItem("access_token");
    const at = localStore.getData(DBkeys.ACCESS_TOKEN);
    console.log("--- Access Token: \n");
    console.log(accessToken);
    console.log(at);
    debugger;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },

  error => {
    return Promise.reject(error);
  }
);
