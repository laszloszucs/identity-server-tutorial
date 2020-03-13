import {
  AUTH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT
} from "../actions/auth";
import OAuthService from "../../utils/oauth-service";
import { User } from "@/models/User";
import DBkeys from "@/models/DBkeys";
import { localStore } from "@/helpers/local-store-manager";
import { LoginResponse } from "@/models/login-response.model";
import { processLoginResponse, logout } from "@/services/auth-service";

export interface AuthState {
  user?: User;
  status: string;
  hasLoadedOnce: boolean;
}

const state: AuthState = {
  user: localStore.getDataObject(DBkeys.CURRENT_USER),
  status: "",
  hasLoadedOnce: false
};

const getters = {
  isAuthenticated: () => !!localStore.getData(DBkeys.ACCESS_TOKEN),
  authStatus: (state: AuthState) => state.status
};

const actions = {
  [AUTH_REQUEST]: (context: any, user: any, rememberMe?: boolean) => {
    return new Promise((resolve, reject) => {
      context.commit(AUTH_REQUEST);
      OAuthService.login(user)
        .then((response: LoginResponse) => {
          processLoginResponse(response, rememberMe);
          context.commit(AUTH_SUCCESS, user);
          resolve(user);
        })
        .catch((err: Error) => {
          context.commit(AUTH_ERROR, err);
          logout();
          reject(err);
        });
    });
  },
  [AUTH_LOGOUT]: (context: any) => {
    return new Promise(resolve => {
      context.commit(AUTH_LOGOUT);
      logout();
      resolve();
    });
  }
};

const mutations = {
  [AUTH_REQUEST]: (state: AuthState) => {
    state.status = "loading";
  },
  [AUTH_SUCCESS]: (state: AuthState, user: User) => {
    state.status = "success";
    state.user = user;
    state.hasLoadedOnce = true;
  },
  [AUTH_ERROR]: (state: AuthState) => {
    state.status = "error";
    state.hasLoadedOnce = true;
  },
  [AUTH_LOGOUT]: (state: AuthState) => {
    state.user = null;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
