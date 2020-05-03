import { LoginStatus } from "@/enums/login-status.enum";
import { RefreshLogin } from "@/store/actions/auth-actions";

let store = null;

function dispatchRefreshToken() {
  if (
    store.state.auth.loginStatus === LoginStatus.Success ||
    store.state.auth.loginStatus === LoginStatus.RefreshSuccess
  ) {
    store.dispatch(RefreshLogin).then(() => {
      startRefreshTokenTimer(store);
    });
  }

  if (store.state.auth.loginStatus === LoginStatus.Logout) {
    this.navigate("/login");
  }
}

function refreshTokenTimer(difference: number) {
  const refreshTime = difference - 10000; // Lejárat előtt 10 másodperc
  setTimeout(() => dispatchRefreshToken(), Math.max(refreshTime, 0));
}

export default function startRefreshTokenTimer(storeInput: any) {
  store = storeInput;
  const accessTokenExpiryDate = store.getters.accessTokenExpiryDate();
  const now = new Date().valueOf();
  const difference = accessTokenExpiryDate - now;
  refreshTokenTimer(difference);
}
