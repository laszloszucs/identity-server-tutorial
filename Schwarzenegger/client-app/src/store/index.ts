import Vue from "vue";
import Vuex from "vuex";
import auth from "./modules/auth";
import VuexPersist from "vuex-persist";

const vuexPersist = new VuexPersist({
  key: "my-app",
  storage: window.localStorage
});

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    auth
  },
  strict: debug,
  plugins: [vuexPersist.plugin]
});
