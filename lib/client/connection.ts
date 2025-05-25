import { responseSchema } from "../server/messages";
import { Api } from "./api";
import { EdenWS } from "@elysiajs/eden/treaty";

export class Connection {
  private socket: EdenWS<any>;
  private connectPromise: Promise<void>;
  private gameId: string | null = null;

  constructor(api: Api) {
    this.socket = api.stream.subscribe();
    this.connectPromise = new Promise((resolve, reject) => {
      this.socket.on("open", () => {
        resolve();
      });
      this.socket.on("error", () => {
        reject();
      });
    });

    this.socket.on("message", (msg) => {
      const object = JSON.parse(msg.data);
      const response = responseSchema.parse(object);

    });
  }

  subscribe(gameId: string) {
  }

  unsubscribe() {

  }

  async waitForConnection() {
    await this.connectPromise;
  }
}
