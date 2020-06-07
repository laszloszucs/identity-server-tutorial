import Vue from "vue";
import Vuex from "vuex";
import auth from "./modules/auth";
import VuexPersist from "vuex-persist";
import { SetInitLoadingState } from "./actions/auth-actions";

const vuexPersist = new VuexPersist({
  key: "my-app",
  storage: window.localStorage
});

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

const vuex = new Vuex.Store({
  modules: {
    auth
  },
  strict: debug,
  plugins: [vuexPersist.plugin]
});

vuex.commit(SetInitLoadingState);

export default vuex;
