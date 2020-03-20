import {
  LoginWithPassword,
  LoginError,
  LoginSuccess,
  Logout,
  RefreshLogin,
  RefreshLoginSuccess
} from "../actions/auth-actions";
import OAuthService from "../../utils/oauth-service";
import { User } from "@/models/user.model";
import DBkeys from "@/models/db-keys.model";
import localStore from "@/helpers/local-store-manager";
import { LoginResponse, AccessToken } from "@/models/login-response.model";
import { PermissionValues } from "@/models/permission.model";
import JwtHelper from "@/helpers/jwt-helper";
import { LoginStatus } from "@/enums/login-status.enum";
import router from "../../router";

function saveUserDetails(
  user: User,
  permissions: PermissionValues[],
  accessToken: string,
  refreshToken: string,
  expiresIn: Date,
  rememberMe: boolean
) {
  if (rememberMe) {
    localStore.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
    localStore.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
    localStore.savePermanentData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
    localStore.savePermanentData(permissions, DBkeys.USER_PERMISSIONS);
    localStore.savePermanentData(user, DBkeys.CURRENT_USER);
  } else {
    localStore.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
    localStore.saveSyncedSessionData(refreshToken, DBkeys.REFRESH_TOKEN);
    localStore.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
    localStore.saveSyncedSessionData(permissions, DBkeys.USER_PERMISSIONS);
    localStore.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
  }

  localStore.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
}

function processLoginResponse(
  context: any,
  response: LoginResponse,
  rememberMe?: boolean
) {
  const accessToken = response.access_token;

  if (accessToken == null) {
    throw new Error("accessToken cannot be null");
  }

  rememberMe = rememberMe || context.getters.rememberMe();

  const refreshToken = response.refresh_token || context.getters.refreshToken();
  const expiresIn = response.expires_in;
  const tokenExpiryDate = new Date();
  tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);
  const accessTokenExpiry = tokenExpiryDate;
  const jwtHelper = new JwtHelper();
  const decodedAccessToken = jwtHelper.decodeToken(accessToken) as AccessToken;
  const permissions: PermissionValues[] = Array.isArray(
    decodedAccessToken.permission
  )
    ? decodedAccessToken.permission
    : [decodedAccessToken.permission];

  const user = new User(
    decodedAccessToken.sub,
    decodedAccessToken.name,
    decodedAccessToken.fullname,
    decodedAccessToken.email,
    decodedAccessToken.jobtitle,
    decodedAccessToken.phone_number,
    Array.isArray(decodedAccessToken.role)
      ? decodedAccessToken.role
      : [decodedAccessToken.role]
  );
  user.isEnabled = true;

  saveUserDetails(
    user,
    permissions,
    accessToken,
    refreshToken,
    accessTokenExpiry,
    rememberMe
  );

  return user;
}

function clearLocalStorage(): void {
  localStore.deleteData(DBkeys.ACCESS_TOKEN);
  localStore.deleteData(DBkeys.REFRESH_TOKEN);
  localStore.deleteData(DBkeys.TOKEN_EXPIRES_IN);
  localStore.deleteData(DBkeys.USER_PERMISSIONS);
  localStore.deleteData(DBkeys.CURRENT_USER);
}

function logout(): void {
  localStore.deleteData(DBkeys.ACCESS_TOKEN);
  localStore.deleteData(DBkeys.REFRESH_TOKEN);
  localStore.deleteData(DBkeys.TOKEN_EXPIRES_IN);
  localStore.deleteData(DBkeys.USER_PERMISSIONS);
  localStore.deleteData(DBkeys.CURRENT_USER);

  if (router.currentRoute.path !== "/login") {
    router.push("/login");
  }
}

const state: any = {
  loginStatus: LoginStatus.Init,
  hasLoadedOnce: false,
  loginUrl: "/login", // config
  homeUrl: "/" // config
};

const getters = {
  authStatus: (state: any) => state.loginStatus,
  currentUser: () => (): User => {
    return localStore.getDataObject<User>(DBkeys.CURRENT_USER);
  },
  userPermissions: () => (): PermissionValues[] => {
    return (
      localStore.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) ||
      []
    );
  },
  accessToken: () => (): string => {
    return localStore.getData(DBkeys.ACCESS_TOKEN);
  },
  accessTokenExpiryDate: () => (): Date => {
    return localStore.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
  },
  refreshToken: () => (): string => {
    return localStore.getData(DBkeys.REFRESH_TOKEN);
  },
  isSessionExpired: (state: any, getters: any) => (): boolean => {
    if (getters.accessTokenExpiryDate() == null) {
      return true;
    }

    if (getters.accessTokenExpiryDate().valueOf() <= new Date().valueOf()) {
      // console.log("Valid access token cannot be found");
      return true;
    }

    return false;
  },
  isLoggedIn: (state: any, getters: any) => (): boolean => {
    if (getters.isSessionExpired()) {
      clearLocalStorage();
      return false;
    }
    return getters.currentUser() != null;
  },
  rememberMe: () => (): boolean => {
    return localStore.getDataObject<boolean>(DBkeys.REMEMBER_ME) == true;
  }
};

const actions = {
  [LoginWithPassword]: (context: any, user: any, rememberMe?: boolean) => {
    return new Promise((resolve, reject) => {
      context.commit(LoginWithPassword);
      OAuthService.loginWithPassword(user)
        .then((response: LoginResponse) => {
          const user = processLoginResponse(context, response, rememberMe);
          context.commit(LoginSuccess, user);
          resolve(user);
        })
        .catch((err: Error) => {
          context.commit(LoginError, err);
          logout();
          reject(err);
        });
    });
  },
  [RefreshLogin]: (context: any, rememberMe?: boolean) => {
    // Ez akkor kell leginkább amikor változtatunk a user-en?!
    return new Promise((resolve, reject) => {
      context.commit(RefreshLogin);
      OAuthService.refreshLogin(localStore.getData(DBkeys.REFRESH_TOKEN))
        .then((response: LoginResponse) => {
          processLoginResponse(context, response, rememberMe);
          context.commit(RefreshLoginSuccess);
          resolve();
        })
        .catch((err: Error) => {
          context.commit(LoginError, err);
          logout();
          reject(err);
        });
    });
  },
  [Logout]: (context: any) => {
    return new Promise(resolve => {
      context.commit(Logout);
      logout();
      resolve();
    });
  }
};

const mutations = {
  [LoginWithPassword]: (state: any) => {
    state.loginStatus = LoginStatus.Loading;
  },
  [RefreshLogin]: (state: any) => {
    state.loginStatus = LoginStatus.Loading;
  },
  [LoginSuccess]: (state: any) => {
    state.loginStatus = LoginStatus.Success;
    state.hasLoadedOnce = true;
  },
  [RefreshLoginSuccess]: (state: any) => {
    state.loginStatus = LoginStatus.RefreshSuccess;
    state.hasLoadedOnce = true;
  },
  [LoginError]: (state: any) => {
    state.loginStatus = LoginStatus.Error;
    state.hasLoadedOnce = true;
  },
  [Logout]: () => {
    state.loginStatus = LoginStatus.Init;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
