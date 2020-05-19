import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  IRetryPolicy,
  RetryContext
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
      .withAutomaticReconnect(new RetryPolicy())
      .configureLogging(LogLevel.Trace)
      .build();

    this.connection.on(WebsocketMethodType.ForceRefreshToken.toString(), () => {
      _callbackOptions.forceRefreshToken();
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

    this.connection.onreconnected(() => {
      _callbackOptions.forceRefreshToken();
    });
  }

  sendMessage(user: string, message: string) {
    this.connection.invoke("SendMessage", user, message).catch((err: any) => {
      return console.error(err.toString());
    });
    event.preventDefault();
  }
}

export class MainWebsocketCallbackOptions {
  constructor(
    forceRefreshToken: () => void,
    receiveMessage: (user: string, msg: string) => void
  ) {
    this.forceRefreshToken = forceRefreshToken;
    this.receiveMessage = receiveMessage;
  }

  forceRefreshToken(): void {
    this.forceRefreshToken();
  }

  receiveMessage(user: string, msg: string): void {
    this.receiveMessage(user, msg);
  }
}

class RetryPolicy implements IRetryPolicy {
  nextRetryDelayInMilliseconds(retryContext: RetryContext): number {
    return 5000;
  }
}