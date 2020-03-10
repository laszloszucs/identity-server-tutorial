import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

axios.interceptors.request.use(
  (config) => {
    let access_token: any = localStorage.getItem('access_token');

    if (access_token) {
      config.headers['Authorization'] = `Bearer ${ access_token }`;
    }

    return config;
  }, 

  (error) => {
    return Promise.reject(error);
  }
);