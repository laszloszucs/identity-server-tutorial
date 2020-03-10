import { USER_REQUEST, USER_ERROR, USER_SUCCESS } from "../actions/user";
import api from "../../utils/api";
import Vue from "vue";
import { AUTH_LOGOUT } from "../actions/auth";

export interface UserState {
  status: string;
  profile: any; // TODO ne any legyen
}

const state: UserState = { status: "", profile: {} };

const getters = {
  getProfile: (state: UserState) => state.profile,
  isProfileLoaded: (state: UserState) => !!state.profile.name
};

const actions = {
  [USER_REQUEST]: (context: any) => {
    context.commit(USER_REQUEST);
    api
      .identity()
      .then((resp: any) => {
        context.commit(USER_SUCCESS, resp);
      })
      .catch(() => {
        context.commit(USER_ERROR);
        // if resp is unauthorized, logout, to
        context.dispatch(AUTH_LOGOUT);
      });
  }
};

const mutations = {
  [USER_REQUEST]: (state: UserState) => {
    state.status = "loading";
  },
  [USER_SUCCESS]: (state: UserState, resp: any) => {
    state.status = "success";
    Vue.set(state, "profile", resp);
  },
  [USER_ERROR]: (state: UserState) => {
    state.status = "error";
  },
  [AUTH_LOGOUT]: (state: UserState) => {
    state.profile = {};
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
