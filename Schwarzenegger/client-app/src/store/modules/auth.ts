import {
  LoginWithPassword,
  LoginError,
  LoginSuccess,
  Logout,
  LoginWithRefreshToken,
  RenewAccessTokenWithRefreshToken,
  RefreshLoginSuccess,
  RedirectForLogin,
  StoreToDefault,
  SetStoreDatas,
  CreateWebSocket,
  StartRefreshTokenTimer,
  StartTimeoutTimer,
  ForceRefreshToken,
  StopRefreshTokenTimer,
  ReceiveMessage,
  Reconnecting,
  RefreshTokenTimer,
  Renewer,
  ServerOffline,
  TokenError,
  ErrorMessage,
  CheckOfflinePing,
  ServerOnline,
  CheckingOffline,
  Loading
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
import axios from "axios";

let hub = null;
let offlineCheckerId = null;

const state: any = {
  loginStatus: LoginStatus.Logout,
  loginUrl: "/login", // TODO config
  homeUrl: "/", // TODO config
  user: null,
  permissions: [],
  accessToken: null,
  refreshToken: null,
  accessTokenExpiry: null,
  rememberMe: null,
  errorMessage: null,
  serverOffline: null
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
    context.commit(StoreToDefault);
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
        .catch((error: any) => {
          if (!error.response) {
            context.commit(ServerOffline);
          } else {
            if (error.response.status === 400) {
              context.commit(LoginError);
            }
          }

          reject(error);
        });
    });
  },
  [LoginWithRefreshToken]: (context: any) => {
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
        .catch((error: any) => {
          if (!error.response) {
            context.commit(ServerOffline);
          } else {
            if (error.response.status === 400) {
              if(hub) {
                hub.stopConnection();
              }
              context.commit(TokenError);
              context.dispatch(Logout);
              reject(error);
            }
          }
          resolve();
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
    return context.dispatch(RenewAccessTokenWithRefreshToken);
  },
  [Reconnecting]: () => {
    hub.setNewAccessToken();
  },
  [ReceiveMessage]: () => {
    console.error("TODO");
  },
  [RenewAccessTokenWithRefreshToken]: (context: any) => {
    return new Promise((resolve, reject) => {
      OAuthService.refreshLogin(context.state.refreshToken)
        .then((response: LoginResponse) => {
          context.commit(SetStoreDatas, response);
          context.commit(RefreshLoginSuccess);
          resolve();
        })
        .catch((error: any) => {
          if (!error.response) {
            context.commit(ServerOffline);
          } else {
            if (error.response.status === 400) {
              debugger;
              context.commit(TokenError);
              context.commit(Logout);
            }
          }

          reject(error);
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
      context.commit(StoreToDefault);
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
    if (context.state.loginStatus === LoginStatus.Success) {
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
  },
  [ErrorMessage]: (context: any, errorMessage: string) => {
    context.commit(ErrorMessage, errorMessage);
  },
  [CheckingOffline]: (context: any) => {
    return new Promise(resolve => {
      context.commit(Loading);
      offlineCheckerId = setInterval(
        () => context.dispatch(CheckOfflinePing).then(() => {
          resolve();
        }),
        5000
      );
    });
  },
  [CheckOfflinePing]: (context: any) => {
    return new Promise(resolve => {
      axios
        .get("https://localhost:44300/api/identity")
        .then(() => {
          clearInterval(offlineCheckerId);
          context.commit(ServerOnline);
          resolve();
        })
        .catch(() => {
          context.commit(CheckingOffline);
        });
    });
  }
};

const mutations = {
  [StoreToDefault]: (state: any) => {
    state.loginStatus = LoginStatus.Logout;
    state.hasLoadedOnce = false; // TODO Ezt még át kell nézni
    state.loginUrl = "/login"; // TODO config
    state.homeUrl = "/"; // TODO config
    state.user = null;
    state.permissions = [];
    state.accessToken = null;
    state.refreshToken = null;
    state.accessTokenExpiry = null;
    state.rememberMe = null;
  },
  [LoginWithPassword]: (state: any, rememberMe: boolean) => {
    state.loginStatus = LoginStatus.Loading;
    state.rememberMe = rememberMe;
    state.errorMessage = null;
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
  [LoginSuccess]: (state: any) => {
    state.loginStatus = LoginStatus.Success;
  },
  [RefreshLoginSuccess]: (state: any) => {
    state.loginStatus = LoginStatus.Success;
    state.errorMessage = null;
  },
  [LoginError]: (state: any) => {
    state.loginStatus = LoginStatus.Error;
    state.errorMessage = "Hiba a bejelentkezési adatokban.";
  },
  [TokenError]: (state: any) => {
    state.loginStatus = LoginStatus.Error;
    state.errorMessage = "A munkamenet lejárt. Kérem jelentkezzen be újra.";
  },
  [Logout]: (state: any) => {
    state.loginStatus = LoginStatus.Logout;
  },
  [RefreshTokenTimer]: (state: any, refreshTokenTimerId: number) => {
    state.refreshTokenTimerId = refreshTokenTimerId;
  },
  [ServerOnline]: (state: any) => {
    state.serverOffline = false;
    state.errorMessage = null;
  },
  [CheckingOffline]: (state: any) => {
    state.serverOffline = true;
    state.errorMessage = "A szerver nem érhető el.";
    state.loginStatus = LoginStatus.CheckingOffline;
  },
  [ServerOffline]: (state: any) => {
    state.serverOffline = true;
    state.errorMessage = "A szerver nem érhető el.";
  },
  [Loading]: (state: any) => {
    state.errorMessage = null;
    state.loginStatus = LoginStatus.Loading;
  },
  [ErrorMessage]: (state: any, errorMessage: string) => {
    state.errorMessage = errorMessage; // TODO lehet, hogy már nincs rá szükség?
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
