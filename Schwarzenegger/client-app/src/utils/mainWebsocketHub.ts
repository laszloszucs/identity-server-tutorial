import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  IRetryPolicy
} from "@microsoft/signalr";
import store from "../store";
import { WebsocketMethodType } from "@/enums/websocket-method-type.enum";
import {
  Reconnecting,
  ForceRefreshToken,
  ReceiveMessage,
  Logout
} from "@/store/actions/auth-actions";

let _callbackOptions: MainWebsocketCallbackOptions;

export class MainWebsocketHub {
  private url = null;
  private connection = null;
  private retryIntervalId = null;

  constructor(url: string, callbackOptions: MainWebsocketCallbackOptions) {
    this.url = url;
    _callbackOptions = callbackOptions;
  }

  public startConnection() {
    const accessToken = (store.state as any).auth.accessToken;
    this.connection = new HubConnectionBuilder()
      .withUrl(this.url, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        logger: console,
        accessTokenFactory: () => accessToken
      })
      // .withAutomaticReconnect(new RetryPolicy(this.retry))
      .configureLogging(LogLevel.Trace)
      .build();

    this.connection.on(WebsocketMethodType.ForceRefreshToken.toString(), () => {
      _callbackOptions.context.dispatch(ForceRefreshToken);
    });

    this.connection.on(WebsocketMethodType.ForceLogout.toString(), () => {
      _callbackOptions.context.dispatch(Logout);
    });

    this.connection.on(
      WebsocketMethodType.Message.toString(),
      (user: string, message: string) => {
        const msg = message
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        _callbackOptions.context.dispatch(ReceiveMessage, { user, msg });
      }
    );

    this.connection.start().catch((err: any) => {
      debugger;
      return console.error(err.toString());
    });

    // this.connection.onreconnecting(() => {
    //   console.log("Fooooo");
    //   // this.retry();
    // });

    // this.connection.onreconnected(() => {
    //   _callbackOptions.context.dispatch(ForceRefreshToken);
    // });

    this.connection.onclose(() => {
      this.startRetry();      
    });
  }

  startRetry() {
    this.retry().then(() => {
      setTimeout(() => this.connection.start().catch((err: any) => {
        debugger;
        return console.error(err.toString());
      }), 10000);
      
    }).catch(()=> {
      setTimeout(() => this.startRetry(), 5000);
    });
  }

  public stopConnection() {
    this.connection.stop();
  }

  public retry() {
    return new Promise((resolve, reject) => {      
      _callbackOptions.context.dispatch(ForceRefreshToken).then(()=> {
        _callbackOptions.context.dispatch(Reconnecting).then(()=>{
          resolve();
        });        
      }).catch((error: any)=> {
        reject(error);
      });
    });
  }

  public sendMessage(user: string, message: string) {
    this.connection.invoke("SendMessage", user, message).catch((err: any) => {
      return console.error(err.toString());
    });
    event.preventDefault();
  }

  public setNewAccessToken() {
    this.connection.baseUrl = `${
      this.connection.baseUrl.split("?")[0]
    }?access_token=${(store.state as any).auth.accessToken}`;
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
