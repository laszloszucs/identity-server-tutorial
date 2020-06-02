import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  IRetryPolicy
} from "@microsoft/signalr";
import { WebsocketMethodType } from "@/enums/websocket-method-type.enum";
import {
  ForceRefreshToken,
  ReceiveMessage,
  Logout,
  Reconnecting,
  StartRefreshTokenTimer
} from "@/store/actions/auth-actions";

let _callbackOptions: MainWebsocketCallbackOptions;
let store = null;

export class MainWebsocketHub {
  private url = null;
  public hubConnection = null;

  constructor(url: string, callbackOptions: MainWebsocketCallbackOptions) {
    this.url = url;
    _callbackOptions = callbackOptions;
  }

  public startConnection(storeInput: any) {
    store = storeInput;
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.url, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        logger: console,
        accessTokenFactory: () => {
          return store.state.accessToken;
        }
      })
      .withAutomaticReconnect(new RetryPolicy(this.retry))
      .configureLogging(LogLevel.Trace)
      .build();

    this.hubConnection.on(
      WebsocketMethodType.ForceRefreshToken.toString(),
      () => {
        _callbackOptions.context.dispatch(ForceRefreshToken);
      }
    );

    this.hubConnection.on(WebsocketMethodType.ForceLogout.toString(), () => {
      _callbackOptions.context.dispatch(Logout);
    });

    this.hubConnection.on(
      WebsocketMethodType.Message.toString(),
      (user: string, message: string) => {
        const msg = message
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        _callbackOptions.context.dispatch(ReceiveMessage, { user, msg });
      }
    );

    this.hubConnection.start().catch((err: any) => {
      return console.error(err.toString());
    });

    this.hubConnection.onclose(() => {
      _callbackOptions.context.dispatch(Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      _callbackOptions.context.dispatch(StartRefreshTokenTimer);
    });
  }

  public retry() {
    _callbackOptions.context.dispatch(ForceRefreshToken);
  }

  public sendMessage(user: string, message: string) {
    this.hubConnection
      .invoke("SendMessage", user, message)
      .catch((err: any) => {
        return console.error(err.toString());
      });
    event.preventDefault();
  }
}

export class MainWebsocketCallbackOptions {
  context: any;
  constructor(context: any) {
    this.context = context;
  }
}

class RetryPolicy implements IRetryPolicy {
  retry: () => void;
  constructor(retry: () => void) {
    this.retry = retry;
  }
  nextRetryDelayInMilliseconds(): number {
    this.retry();
    return 5000;
  }
}
