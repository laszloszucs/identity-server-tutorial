import {
  AUTH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT
} from "../actions/auth";
import { USER_REQUEST } from "../actions/user";
import api from "../../utils/api";

export interface AuthState {
    accessToken: string | null,
    status: string,    
    hasLoadedOnce: boolean
}

const state : AuthState = {
  accessToken: localStorage.getItem('access_token'),
  status: "",
  hasLoadedOnce: false
};

const getters = {
  isAuthenticated: (state: AuthState) => !!state.accessToken,
  authStatus: (state: AuthState) => state.status
};

const actions = {
  [AUTH_REQUEST]: (context: any, user: any) => {
    return new Promise((resolve, reject) => {
        context.commit(AUTH_REQUEST);
        api.login(user)
            .then((resp: any) => {
                localStorage.setItem("access_token", resp.access_token);
                context.commit(AUTH_SUCCESS, resp);
                context.dispatch(USER_REQUEST);
                resolve(resp);
            })
            .catch((err: Error) => {
                context.commit(AUTH_ERROR, err);
                localStorage.removeItem("access_token");
                reject(err);
            });
    });
  },
  [AUTH_LOGOUT]: (context: any) => {
    return new Promise(resolve => {
      context.commit(AUTH_LOGOUT);
      localStorage.removeItem("access_token");
      resolve();
    });
  }
};

const mutations = {
  [AUTH_REQUEST]: (state: AuthState) => {
    state.status = "loading";
  },
  [AUTH_SUCCESS]: (state: AuthState, resp: any) => {
    state.status = "success";
    debugger;
    state.accessToken = resp.accessToken;
    state.hasLoadedOnce = true;
  },
  [AUTH_ERROR]: (state: AuthState) => {
    state.status = "error";
    state.hasLoadedOnce = true;
  },
  [AUTH_LOGOUT]: (state: AuthState) => {
    state.accessToken = "";
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
