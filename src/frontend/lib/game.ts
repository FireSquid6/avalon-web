import type { GameAction } from "@/engine/actions";
import { getSocket, treaty } from "./treaty";
import { type GameState, type Knowledge, type Rule } from "@/engine";
import { responseSchema } from "@/backend/protocol";
import { getBlankState } from "@/engine/logic";
import type { Message } from "@/backend/db/schema";

export interface GameData {
  state: GameState,
  knowledge: Knowledge[],
}

export async function createGame(ruleset: Rule[], maxPlayers: number, password?: string): Promise<Error | GameData> {
  const { data: id, error } = await treaty.api.games.post({ ruleset, maxPlayers, password })

  if (error) {
    return new Error(`Error creating game: ${error.status} - ${error.value}`);
  }

  const { data, error: stateError } = await treaty.api.games({ id: id }).state.get();

  if (stateError) {
    return new Error(`Error fetching game: ${stateError.status} - ${stateError.value} `);
  }

  return data;
}

export async function joinGame(id: string, password?: string): Promise<Error | GameData> {
  const { data, error } = await treaty.api.games({ id: id }).join.post({ password: password });

  if (error) {
    return new Error(`Error joining game: ${error.status} - ${error.value}`);
  }

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
  private reconnecting: boolean = false;

  async reconnect() {
    // we don't want to reconnect if we are already trying to
    if (this.reconnecting || this.connected) {
      return;
    }

    this.reconnecting = true;
    this.connected = false;
    console.log("Reconnecting...");

    // we want to automatically resubscribe to all stuff we had previously
    const previousData = new Map<string, GameData>();
    for (const k of this.gameData.keys()) {
      previousData.set(k, this.gameData.get(k)!);
    }

    // reset all state
    this.listeners = [];
    this.chats = {}
    this.gameData = new Map();

    this.socket = getSocket();
    this.socket.onmessage = async (e) => {
      const response = responseSchema.parse(JSON.parse(e.data));

      switch (response.type) {
        case "state":
          const id = response.state.id;
          const data = { state: response.state, knowledge: response.knowledge };
          this.gameData.set(id, data);

          console.log("Dispatching new state...");
          this.dispatch({ type: "state", id, data });
          break;
        case "chat":
          const { gameId, sent, userId, content, id: messageId } = response.message;
          if (!this.chats[gameId]) {
            this.chats[gameId] = [];
          }
          this.chats[gameId].push({
            id: messageId,
            sent: new Date(sent),
            gameId,
            userId,
            content,
          });
          this.chats[gameId].sort((a, b) => a.sent.valueOf() - b.sent.valueOf());

          this.dispatch({ type: "chat", chats: this.chats[gameId] })
      }

    }
    this.socket.onopen = () => {
      console.log("Connected to server");
      this.connected = true;
      this.dispatch({ type: "active", active: true });
    }
    this.socket.onclose = (e) => {
      console.log("Disconnected from server");
      this.connected = false;
      this.dispatch({ type: "active", active: false });
      this.dispatch({ type: "error", error: new Error(`Socket disconnected: ${e.reason}`) });
    }
    this.socket.onerror = (e) => {
      console.log("Got an error from the socket");
      console.log(e);
    }

    await this.waitForConnection();
    this.reconnecting = false;
  }

  constructor() {
    this.reconnect();
  }

  async pullChatMessages(gameId: string) {
    const { data, error } = await treaty.api.games({ id: gameId }).chat.get();

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

  // when we join a game, we are given the current state by the server
  // we can immediate put it in the client's store with this function
  // so that there is no loading stage when we first go into the game
  hintKnownData(gameId: string, data: GameData) {
    if (this.gameData.has(gameId)) {
      return;
    }
    this.gameData.set(gameId, data);
    this.dispatch({ type: "state", id: gameId, data: data });
  }

  // if we don't have any info on the game, we will fetch the data
  // for the game
  //
  // this is useful if the page for a game is reloaded
  async fetchIfUnknown(gameId: string) {
    if (this.gameData.has(gameId)) {
      return;
    }

    const { data, error } = await treaty.api.games({ id: gameId }).state.get();
    if (error !== null) {
      this.dispatch({
        type: "error",
        error: new Error(`Error fetching game: ${error.status} - ${error.value}`),
      })
      return;
    }

    this.gameData.set(gameId, data);
    this.dispatch({ type: "state", id: gameId, data: data });

    const { data: chats, error: chatError } = await treaty.api.games({ id: gameId }).chat.get();

    if (chatError !== null) {
      this.dispatch({
        type: "error",
        error: new Error(`Error fetching chats: ${chatError.status} - ${chatError.value}`),
      });
      return;
    }

    this.chats[gameId] = chats;
    this.dispatch({ type: "chat", chats: chats });
  }

  peekChat(gameId: string): Message[] {
    return this.chats[gameId] ?? [];
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
  listen(listener: Listener) {
    this.listeners.push(listener);
    return () => this.unlisten(listener);
  }
  unlisten(listener: Listener) {
    this.listeners.filter((l) => l !== listener);
  }

  async act(id: string, action: GameAction): Promise<void> {
    const { error } = await treaty.api.games({ id: id }).act.post({
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

