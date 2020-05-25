// // TODO main.ts-be átszervezni?

// import { LoginStatus } from "@/enums/login-status.enum";
// import { RenewAccessTokenWithRefreshToken } from "@/store/actions/auth-actions";

// let store = null;

// function dispatchRefreshToken() {
//   console.log(store);
//   debugger;
//   if (
//     store.state.auth.loginStatus === LoginStatus.Success ||
//     store.state.auth.loginStatus === LoginStatus.RefreshSuccess
//   ) {
//     store.dispatch(RenewAccessTokenWithRefreshToken).then(() => {
//       startRefreshTokenTimer(store);
//     });
//   }
// }

// function refreshTokenTimer(difference: number): NodeJS.Timeout {
//   const refreshTime = difference - 10000; // Lejárat előtt 10 másodperc
//   return setTimeout(() => dispatchRefreshToken(), Math.max(refreshTime, 0));
// }

// export default function startRefreshTokenTimer(
//   storeInput: any
// ): NodeJS.Timeout {
//   store = storeInput;
//   const accessTokenExpiry = store.state.auth.accessTokenExpiry;
//   const now = new Date().valueOf();
//   const difference = accessTokenExpiry - now;
//   return refreshTokenTimer(difference);
// }
