// TODO Talán egy Action Enum?

export const RedirectForLogin = "RedirectForLogin";
export const StoreToDefault = "StoreToDefault";
export const LoginWithPassword = "LoginWithPassword";
export const LoginWithRefreshToken = "LoginWithRefreshToken";
export const SetStoreDatas = "SetStoreDatas";

export const CreateWebSocket = "CreateWebSocket";
export const StartRefreshTokenTimer = "StartRefreshTokenTimer";
export const StopRefreshTokenTimer = "StopRefreshTokenTimer";
export const StartTimeoutTimer = "StartTimeoutTimer";
export const RefreshTokenTimer = "RefreshTokenTimer";
export const Renewer = "Renewer";

export const RenewAccessTokenWithRefreshToken =
  "RenewAccessTokenWithRefreshToken";

export const LoginSuccess = "LoginSuccess";
export const RefreshLoginSuccess = "RefreshLoginSuccess";
export const LoginError = "LoginError";
export const ServerOffline = "ServerOffline";
export const TokenError = "TokenError";

export const Logout = "Logout";

export const Reconnecting = "Reconnecting";
export const ForceRefreshToken = "ForceRefreshToken";
export const ReceiveMessage = "ReceiveMessage";
export const ErrorMessage = "ErrorMessage";

export const CheckingOffline = "CheckServerOffline";
export const CheckOfflinePing = "CheckOfflinePing";
export const ServerOnline = "ServerOnline";
export const Loading = "Loading";
