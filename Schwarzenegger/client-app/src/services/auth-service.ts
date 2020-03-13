import { User } from "@/models/User";
import DBkeys from "@/models/DBkeys";
import { PermissionValues } from "@/models/PermissionValues";
import { LoginResponse, AccessToken } from "@/models/login-response.model";
import JwtHelper from "@/helpers/jwt-helper";
import { localStore } from "@/helpers/local-store-manager";

class AuthService {
    private static instance: AuthService;
    // public get loginUrl() { return this.configurations.loginUrl; }
    // public get homeUrl() { return this.configurations.homeUrl; }

    public loginRedirectUrl: string;
    public logoutRedirectUrl: string;

    public reLoginDelegate: () => void;

    private previousIsLoggedInCheck = false;
    // private _loginStatus = new Subject<boolean>();

    constructor() {
        if (AuthService.instance) {
          return AuthService.instance;
        }
        AuthService.instance = this;
    
        return this;
      }

    reevaluateLoginStatus(currentUser?: User) {
        const user =
          currentUser ||
          localStore.getDataObject(/*<User>*/ DBkeys.CURRENT_USER); // TODO Kell a típus megadás?
        const isLoggedIn = user != null;
      
        if (this.previousIsLoggedInCheck != isLoggedIn) {
          setTimeout(() => {
            // this._loginStatus.next(isLoggedIn);
          });
        }
      
        this.previousIsLoggedInCheck = isLoggedIn;
      }
      
    saveUserDetails(
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
          localStore.saveSyncedSessionData(
            permissions,
            DBkeys.USER_PERMISSIONS
          );
          localStore.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
        }
      
        localStore.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
      }
      
        logout(): void {
        localStore.deleteData(DBkeys.ACCESS_TOKEN);
        localStore.deleteData(DBkeys.REFRESH_TOKEN);
        localStore.deleteData(DBkeys.TOKEN_EXPIRES_IN);
        localStore.deleteData(DBkeys.USER_PERMISSIONS);
        localStore.deleteData(DBkeys.CURRENT_USER);
      
        // this.configurations.clearLocalChanges();
      
        this.reevaluateLoginStatus();
      }
      
        processLoginResponse(
        response: LoginResponse,
        rememberMe?: boolean
      ) {
        const accessToken = response.access_token;
      
        if (accessToken == null) {
          throw new Error("accessToken cannot be null");
        }
      
        rememberMe = rememberMe || this.rememberMe;
      
        const refreshToken = response.refresh_token || this.refreshToken;
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
      
        // if (!this.isLoggedIn) {
        //     this.configurations.import(decodedAccessToken.configuration);
        // }
      
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
      
        this.saveUserDetails(
          user,
          permissions,
          accessToken,
          refreshToken,
          accessTokenExpiry,
          rememberMe
        );
      
        this.reevaluateLoginStatus(user);
      
        return user;
    }      

    
    getLoginStatusEvent(): Observable<boolean> {
        return this._loginStatus.asObservable();
    }

    get currentUser(): User {

        const user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        this.reevaluateLoginStatus(user);

        return user;
    }

    get userPermissions(): PermissionValues[] {
        return this.localStorage.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) || [];
    }

    get accessToken(): string {
        return this.oidcHelperService.accessToken;
    }

    get accessTokenExpiryDate(): Date {
        return this.oidcHelperService.accessTokenExpiryDate;
    }

    get refreshToken(): string {
        return this.oidcHelperService.refreshToken;
    }

    get isSessionExpired(): boolean {
        return this.oidcHelperService.isSessionExpired;
    }

    get isLoggedIn(): boolean {
        return this.currentUser != null;
    }

    get rememberMe(): boolean {
        return this.localStorage.getDataObject<boolean>(DBkeys.REMEMBER_ME) == true;
    }

}


export const authService = new AuthService();