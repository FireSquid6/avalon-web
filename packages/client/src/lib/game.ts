import type { GameAction } from "engine/actions";
import { getSocket, treaty } from "./treaty";
import { type GameState, type Knowledge, type Rule } from "engine";
import { makeMessage, responseSchema } from "server/protocol";
import { getBlankState } from "engine/logic";
import type { Message } from "server/db/schema";

export interface GameData {
  state: GameState,
  knowledge: Knowledge[],
}

export async function createGame(ruleset: Rule[], maxPlayers: number, password?: string): Promise<Error | GameData> {
  const { data: id, error } = await treaty.games.post({ ruleset, maxPlayers, password })

  if (error) {
    return new Error(`Error creating game: ${error.status} - ${error.value}`);
  }

  const { data, error: stateError } = await treaty.games({ id: id }).state.get();

  if (stateError) {
    return new Error(`Error fetching game: ${stateError.status} - ${stateError.value} `);
  }

  client.subscribeToGame(data.state.id, data);

  return data;
}

export async function joinGame(id: string, password?: string): Promise<Error | GameData> {
  const { data, error } = await treaty.games({ id: id }).join.post({ password: password });

  if (error) {
    return new Error(`Error joining game: ${error.status} - ${error.value}`);
  }

  client.subscribeToGame(data.state.id, data);
  return {
    state: data.state,
    knowledge: data.knowledge,
  }
}


export type ClientEvent =
  | {
    type: "state";
    id: string;
    data: GameData;
  } | {
    type: "chat";
    chats: Message[];
  } | {
    type: "active";
    active: boolean;
  } | {
    type: "error";
    error: Error;
  }

export type Listener = (arg0: ClientEvent) => void;


export class GameClient {
  private gameData: Map<string, GameData> = new Map();
  private chats: Record<string, Message[]> = {};
  private connected: boolean = false;
  //@ts-expect-error we do actually define it in the constructor. It's fine.
  private socket: WebSocket;
  private listeners: Listener[] = [];
  private subscribedGames: Set<string> = new Set();
  private reconnecting: boolean = false;

  async reconnect() {
    // we don't want to reconnect if we are already trying to
    if (this.reconnecting || this.connected) {
      return;
    }

    this.reconnecting = true;

    // we want to automatically resubscribe to all stuff we had previously
    const previousSubscribed = Array.from(this.subscribedGames);
    const previousData = new Map<string, GameData>();
    for (const k of this.gameData.keys()) {
      previousData.set(k, this.gameData.get(k)!);
    }

    // reset all state
    this.listeners = [];
    this.chats = {}
    this.gameData = new Map();
    this.subscribedGames = new Set();

    this.socket = getSocket();
    this.socket.onmessage = async (e) => {
      const response = responseSchema.parse(JSON.parse(e.data));

      switch (response.type) {
        case "info":
          if (response.result === "failure") {
            this.dispatch({ type: "error", error: new Error(`Error recieved from socket: ${response.message}`) });
          } else {
            console.log(response.message);
          }
          break;
        case "state":
          const id = response.state.id;
          const data = { state: response.state, knowledge: response.knowledge };
          this.gameData.set(id, data);

          console.log("Dispatching new state...");
          this.dispatch({ type: "state", id, data });
          break;
        case "chat":
          const { gameId, sent, userId, content, id: messageId } = response.message;
          this.chats[gameId].push({
            id: messageId,
            sent: new Date(sent),
            gameId,
            userId,
            content,
          });

          this.dispatch({ type: "chat", chats: this.chats[gameId] })
      }

    }
    this.socket.onopen = () => {
      this.connected = true;
      this.dispatch({ type: "active", active: true });
    }
    this.socket.onclose = (e) => {
      this.connected = false;
      this.dispatch({ type: "active", active: false });
      this.dispatch({ type: "error", error: new Error(`Socket disconnected: ${e.reason}`) });
    }

    // re-subscribe to all stuff we have disconnected from
    await this.waitForConnection();
    for (const s of previousSubscribed) {
      this.subscribeToGame(s, previousData.get(s), true);
    }

    this.reconnecting = false;
  }

  constructor() {
    this.reconnect();
  }

  async pullChatMessages(gameId: string) {
    const { data, error } = await treaty.games({ id: gameId }).chat.get();

    if (error !== null) {
      this.dispatch({
        type: "error",
        error: new Error(`Error fetching chat messages: ${error.status} - ${error.value}`),
      });
    }

    //@ts-ignore
    this.chats[gameId] = data;
    this.chats[gameId].sort((a, b) => a.sent > b.sent ? 1 : -1);
    this.dispatch({ type: "chat", chats: this.chats[gameId] })
  }

  async waitForConnection(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const ul = this.listen((e) => {
        if (e.type === "active" && e.active) {
          ul();
          resolve();
        }
      });
    });
  }

  peekChat(gameId: string): Message[] {
    return this.chats[gameId] ?? [];
  }

  async subscribeToGame(gameId: string, initialData?: GameData, alwaysRefetch?: boolean) {
    // we want to subscribe to the game if we aren't yet
    if (!this.subscribedGames.has(gameId)) {
      if (initialData) {
        this.gameData.set(gameId, initialData);
      }
      this.subscribedGames.add(gameId);

      await this.waitForConnection();
      console.log("Subscribing to the game...");
      await this.pullChatMessages(gameId);



      this.socket.send(makeMessage({
        gameId: gameId,
        action: "subscribe",
      }));
    }

    // if we don't have information on the game, we go ahead and 
    // just do a fetch
    //
    // there's also a flag for refetching anyways. This is useful
    // for reconnection, when we want to use the stale state we have,
    // but also fetch all updates we may have missed
    if (!this.gameData.has(gameId) || alwaysRefetch === true) {
      console.log("Fetching game data...");
      const { data, error } = await treaty.games({ id: gameId }).state.get();

      if (error !== null) {
        this.dispatch({
          type: "error",
          error: new Error(`Error fetching game state: ${error.status} - ${error.value}`),
        });

        return;
      }

      this.gameData.set(gameId, data);
      this.dispatch({
        type: "state",
        id: gameId,
        data: data,
      })
    }
  }

  async unsubscribeFromGame(gameId: string) {
    if (!this.subscribedGames.has(gameId)) {
      return;
    }

    await this.waitForConnection();

    this.socket.send(makeMessage({
      gameId: gameId,
      action: "unsubscribe",
    }));
    this.subscribedGames.delete(gameId);
  }

  peekState(id: string): GameData | null {
    return this.gameData.get(id) ?? null;
  }
  peekStateOrBlank(id: string): GameData {
    return this.gameData.get(id) ?? {
      state: getBlankState(id, "unknown", [], 5),
      knowledge: [],
    }
  }
  peekConnected(): boolean {
    return this.connected
  }
  subscribedTo(): string[] {
    return Array.from(this.subscribedGames);
  }
  listen(listener: Listener) {
    this.listeners.push(listener);
    return () => this.unlisten(listener);
  }
  unlisten(listener: Listener) {
    this.listeners.filter((l) => l !== listener);
  }

  async act(id: string, action: GameAction): Promise<void> {
    const { error } = await treaty.games({ id: id }).act.post({
      action,
    });

    if (error !== null) {
      const err = new Error(`Error performing action: ${error.status} - ${error.value}`);
      this.dispatch({ type: "error", error: err });
    }

  }
  private dispatch(event: ClientEvent) {
    for (const l of this.listeners) {
      l(event);
    }
  }
}
export const client = new GameClient();

