import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  IRetryPolicy
} from "@microsoft/signalr";
import store from "../store";
import { WebsocketMethodType } from "@/enums/websocket-method-type.enum";

let _callbackOptions: MainWebsocketCallbackOptions;

export class MainWebsocketHub {
  private url = null;
  private connection = null;
  // private callbackOptions: MainWebsocketCallbackOptions;

  constructor(url: string, callbackOptions: MainWebsocketCallbackOptions) {
    this.url = url;
    _callbackOptions = callbackOptions;
  }

  startConnection() {
    const accessToken = store.getters.accessToken();
    this.connection = new HubConnectionBuilder()
      .withUrl(this.url, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        logger: console,
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect(new RetryPolicy(this.retry))
      .configureLogging(LogLevel.Trace)
      .build();

    this.connection.on(WebsocketMethodType.ForceRefreshToken.toString(), () => {
      _callbackOptions.forceRefreshToken();
    });

    this.connection.on(WebsocketMethodType.ForceLogout.toString(), () => {
      _callbackOptions.forceLogout();
    });

    this.connection.on(
      WebsocketMethodType.Message.toString(),
      (user: string, message: string) => {
        const msg = message
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        _callbackOptions.receiveMessage(user, msg);
      }
    );

    this.connection.start().catch((err: any) => {
      return console.error(err.toString());
    });

    this.connection.onreconnecting(() => {
      _callbackOptions.reconnecting();
    });

    this.connection.onreconnected(() => {
      _callbackOptions.forceRefreshToken();
    });
  }

  stopConnection() {
    this.connection.stop();
  }

  retry() {
    _callbackOptions.forceRefreshToken();
  }

  sendMessage(user: string, message: string) {
    this.connection.invoke("SendMessage", user, message).catch((err: any) => {
      return console.error(err.toString());
    });
    event.preventDefault();
  }

  setNewAccessToken() {
    const baseUrlAndParams = this.connection.baseUrl.split("?");
    const baseUrl = baseUrlAndParams[0];
    const accessToken = store.getters.accessToken();
    debugger;
    this.connection.baseUrl = `${baseUrl}?access_token=${accessToken}`;
    debugger;
    // "wss://localhost:44300/mainHub?access_token=xxx"
  }
}

export class MainWebsocketCallbackOptions {
  forceRefreshToken: () => void;
  forceLogout: () => void;
  receiveMessage: (user: string, msg: string) => void;
  disconnected: () => void;
  reconnecting: () => void;

  constructor(
    forceRefreshToken: () => void,
    forceLogout: () => void,
    receiveMessage: (user: string, msg: string) => void,
    disconnected: () => void,
    reconnecting: () => void
  ) {
    this.forceRefreshToken = forceRefreshToken;
    this.forceLogout = forceLogout;
    this.receiveMessage = receiveMessage;
    this.disconnected = disconnected;
    this.reconnecting = reconnecting;
  }
}

class RetryPolicy implements IRetryPolicy {
  retry: () => void;
  /**
   *
   */
  constructor(retry: () => void) {
    this.retry = retry;
  }
  nextRetryDelayInMilliseconds(): number {
    this.retry();
    return 5000;
  }
}
