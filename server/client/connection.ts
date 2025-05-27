import { GameState, Knowledge } from "../engine";
import { makeMessage, responseSchema } from "../server/messages";
import { Api } from "./api";
import { EdenWS } from "@elysiajs/eden/treaty";

export type ConnectionListener = (data: {
  state: GameState | null, 
  knowledge: Knowledge[] | null, 
  connectionStatus: "connected" | "disconnected" | "loading" | "error"
  error: string | null,
}) => void;

export class Connection {
  private socket: EdenWS<any>;
  private connectPromise: Promise<void>;
  private gameId: string;
  private playerId: string;

  private game: { state: GameState, knowledge: Knowledge[] } | null = null;
  private connectionStatus: "loading" | "connected" | "disconnected" | "error" = "loading";
  private error: string | null = null;

  private listeners: ConnectionListener[] = [];


  constructor(api: Api, playerId: string, gameId: string) {
    this.gameId = gameId;
    this.playerId = playerId;

    this.socket = api.stream.subscribe();
    this.connectPromise = new Promise((resolve, reject) => {
      this.socket.on("open", () => {
        resolve();
      });
      this.socket.on("error", () => {
        reject();
      });
      this.socket.on("close", () => {
        reject();
      });
    });

    this.socket.on("message", (msg) => {
      const object = JSON.parse(msg.data);
      const response = responseSchema.parse(object);

      if (response.type === "info") {
        if (response.result === "failure") {
          throw new Error(`Socket error: ${response.message}`)
        }
      } else {
        this.game = {
          state: response.state,
          knowledge: response.knowledge,
        }

        this.dispatch();
      }
    });

    this.socket.on("open", () => {
      this.connectionStatus = "connected";
      this.dispatch();
    });

    this.socket.on("close", () => {
      this.connectionStatus = "disconnected";
      this.dispatch();
    });

    this.socket.on("error", () => {
      this.connectionStatus = "error"
      this.dispatch();
    })
  }

  subscribe() {
    const message = makeMessage({
      gameId: this.gameId,
      playerId: this.playerId,
      action: "subscribe",
    })

    this.socket.send(message);
  }

  unsubscribe() {
    const message = makeMessage({
      gameId: this.gameId,
      playerId: this.playerId,
      action: "unsubscribe",
    })

    this.socket.send(message);
  }

  async waitForConnection() {
    await this.connectPromise;
  }

  private dispatch() {
    for (const listener of this.listeners) {
      listener({
        connectionStatus: this.connectionStatus,
        state: this.game?.state ?? null,
        knowledge: this.game?.knowledge ?? null,
        error: this.error,
      });
    }
  }

  onUpdate() {

  }
}

