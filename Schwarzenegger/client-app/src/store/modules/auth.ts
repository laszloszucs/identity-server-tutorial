import {
  LoginWithPassword,
  LoginError,
  LoginSuccess,
  Logout,
  LoginWithRefreshToken,
  RenewAccessTokenWithRefreshToken,
  RefreshLoginSuccess,
  RedirectForLogin,
  InitStoreToDefault,
  SetStoreDatas,
  CreateWebSocket,
  StartRefreshTokenTimer,
  StartTimeoutTimer,
  ForceRefreshToken,
  StopRefreshTokenTimer,
  ReceiveMessage,
  Reconnecting,
  RefreshTokenTimer,
  Renewer
} from "../actions/auth-actions";
import OAuthService from "../../utils/oauth-service";
import { User } from "@/models/user.model";
import { LoginResponse, AccessToken } from "@/models/login-response.model";
import { PermissionValues } from "@/models/permission.model";
import JwtHelper from "@/helpers/jwt-helper";
import { LoginStatus } from "@/enums/login-status.enum";
import {
  MainWebsocketHub,
  MainWebsocketCallbackOptions
} from "@/utils/mainWebsocketHub";

let hub = null;

const state: any = {
  loginStatus: LoginStatus.Init,
  hasLoadedOnce: false,
  loginUrl: "/login", // TODO config
  homeUrl: "/", // TODO config
  user: null,
  permissions: [],
  accessToken: null,
  refreshToken: null,
  accessTokenExpiry: null,
  rememberMe: null
};

const getters = {
  isSessionExpired: (state: any) => {
    if (state.accessTokenExpiry == null) {
      return true;
    }

    if (state.accessTokenExpiry.valueOf() <= new Date().valueOf()) {
      return true;
    }

    return false;
  },
  isLoggedIn: (state: any) => {
    return state.user != null;
  }
};

const actions = {
  [RedirectForLogin]: (context: any) => {
    context.commit(InitStoreToDefault);
  },
  [LoginWithPassword]: (context: any, loginUser: any) => {
    return new Promise((resolve, reject) => {
      context.commit(LoginWithPassword, loginUser.rememberMe);
      OAuthService.loginWithPassword(loginUser)
        .then((response: LoginResponse) => {
          context.commit(SetStoreDatas, response);
          context.dispatch(CreateWebSocket);
          context.dispatch(StartRefreshTokenTimer);

          if (!context.state.rememberMe) {
            context.dispatch(StartTimeoutTimer);
          }

          context.commit(LoginSuccess);
          resolve();
        })
        .catch((err: Error) => {
          context.commit(LoginError, err);
          context.dispatch(Logout);
          reject(err);
        });
    });
  },
  [LoginWithRefreshToken]: (context: any) => {
    // Ez akkor kell ha változtatunk a user(ek)en.
    // TODO Ekkor lehetne egy websocek küldés, hogy mindenkinek, frissítse a jogosultságait.
    return new Promise((resolve, reject) => {
      context.commit(LoginWithRefreshToken);
      OAuthService.refreshLogin(context.state.refreshToken)
        .then((response: LoginResponse) => {
          context.commit(SetStoreDatas, response);

          context.dispatch(CreateWebSocket);
          context.dispatch(StartRefreshTokenTimer);

          context.commit(RefreshLoginSuccess);
          resolve();
        })
        .catch((err: Error) => {
          debugger;
          context.commit(LoginError, err);
          context.dispatch(Logout);
          reject(err);
        });
    });
  },
  [CreateWebSocket]: (context: any) => {
    hub = new MainWebsocketHub(
      "https://localhost:44300/mainHub",
      new MainWebsocketCallbackOptions(context)
    );

    hub.startConnection();
  },
  [ForceRefreshToken]: (context: any) => {
    context.dispatch(RenewAccessTokenWithRefreshToken);
  },
  [Reconnecting]: () => {
    hub.setNewAccessToken();
  },
  [ReceiveMessage]: () => {
    console.error("TODO");
  },
  [RenewAccessTokenWithRefreshToken]: (context: any) => {
    // Ez akkor kell ha változtatunk a user(ek)en.
    // TODO Ekkor lehetne egy websocek küldés, hogy mindenkinek, frissítse a jogosultságait.
    return new Promise((resolve, reject) => {
      context.commit(RenewAccessTokenWithRefreshToken);
      OAuthService.refreshLogin(context.state.refreshToken)
        .then((response: LoginResponse) => {
          context.commit(SetStoreDatas, response);
          context.commit(RefreshLoginSuccess);
          resolve();
        })
        .catch((err: Error) => {
          debugger;
          context.commit(LoginError, err);
          context.dispatch(Logout);
          reject(err);
        });
    });
  },
  [Logout]: (context: any) => {
    return new Promise(resolve => {
      context.commit(Logout);
      context.dispatch(StopRefreshTokenTimer);
      if (hub) {
        hub.stopConnection();
      }
      context.commit(InitStoreToDefault);
      resolve();
    });
  },
  [StartRefreshTokenTimer]: (context: any) => {
    const accessTokenExpiry = context.state.accessTokenExpiry;
    const now = new Date().valueOf();
    const difference = accessTokenExpiry - now;
    context.dispatch(RefreshTokenTimer, difference);
  },
  [RefreshTokenTimer]: (context: any, difference: any) => {
    const refreshTime = difference - 10000; // Lejárat előtt 10 másodperc
    const refreshTokenTimerId = setTimeout(
      () => context.dispatch(Renewer),
      Math.max(refreshTime, 0)
    );
    context.commit(RefreshTokenTimer, refreshTokenTimerId);
  },
  [Renewer]: (context: any) => {
    if (
      context.state.loginStatus === LoginStatus.Success ||
      context.state.loginStatus === LoginStatus.RefreshSuccess
    ) {
      context.dispatch(RenewAccessTokenWithRefreshToken).then(() => {
        context.dispatch(StartRefreshTokenTimer);
      });
    }
  },
  [StopRefreshTokenTimer]: (context: any) => {
    clearTimeout(context.state.refreshTokenTimerId);
  },
  [RefreshLoginSuccess]: (context: any) => {
    return new Promise(resolve => {
      context.commit(RefreshLoginSuccess);
      resolve();
    });
  }
};

const mutations = {
  [InitStoreToDefault]: (state: any) => {
    (state.loginStatus = LoginStatus.Init),
      (state.hasLoadedOnce = false), // TODO Ezt még át kell nézni
      (state.loginUrl = "/login"), // TODO config
      (state.homeUrl = "/"), // TODO config
      (state.user = null),
      (state.permissions = []),
      (state.accessToken = null),
      (state.refreshToken = null),
      (state.accessTokenExpiry = null),
      (state.rememberMe = null);
  },
  [LoginWithPassword]: (state: any, rememberMe: boolean) => {
    state.loginStatus = LoginStatus.Loading;
    state.rememberMe = rememberMe;
    state.hasLoadedOnce = true; // TODO Ezt még át kell nézni
  },
  [LoginWithRefreshToken]: (state: any) => {
    state.loginStatus = LoginStatus.Loading;
  },
  [SetStoreDatas]: (state: any, response: any) => {
    const jwtHelper = new JwtHelper();
    const decodedAccessToken = jwtHelper.decodeToken(
      response.access_token
    ) as AccessToken;
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
      decodedAccessToken.phone_number,
      true, // TODO Paraméterezhető?
      false, // TODO Paraméterezhető?
      Array.isArray(decodedAccessToken.role)
        ? decodedAccessToken.role
        : [decodedAccessToken.role],
      decodedAccessToken.is_admin
    );

    const tokenExpiryDate = new Date();
    tokenExpiryDate.setSeconds(
      tokenExpiryDate.getSeconds() + response.expires_in
    );

    state.user = user;
    state.permissions = permissions;
    state.accessToken = response.access_token;
    state.refreshToken = response.refresh_token;
    state.accessTokenExpiry = tokenExpiryDate;
  },
  [RenewAccessTokenWithRefreshToken]: (state: any) => {
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
  [Logout]: (state: any) => {
    state.loginStatus = LoginStatus.Logout;
  },
  [RefreshTokenTimer]: (state: any, refreshTokenTimerId: number) => {
    state.refreshTokenTimerId = refreshTokenTimerId;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
