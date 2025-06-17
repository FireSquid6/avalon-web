import type { GameAction } from "engine/actions";
import { treaty } from "./treaty";
import { type GameState, type Knowledge, type Rule } from "engine";
import { makeMessage, responseSchema } from "server/protocol";
import { getAuthState } from "./hooks";
import { getAuthToken } from "./auth";
import { getBlankState } from "engine/logic";

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

  return data;
}

export async function joinGame(id: string, password?: string): Promise<Error | GameData> {
  const { data, error } = await treaty.games({ id: id }).join.post({ password: password });

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
    type: "motion";
  } | {
    type: "active";
    active: boolean;
  } | {
    type: "error";
    error: Error;
  }

export type Listener = (arg0: ClientEvent) => void;

export interface GameClient {
  peek(): GameData;
  act(action: GameAction): void;
  listen(listener: Listener): () => void;
  stop(): void;
  refreshData(): Promise<void>;
  active(): boolean;
}


export class GameClient {
  private gameData: Map<string, GameData> = new Map();
  private connected: boolean = false;
  private token: string;
  private username: string;
  private socket: WebSocket;
  private listeners: Listener[] = [];
  private subscribedGames: Set<string> = new Set();

  constructor() {
    this.token = getAuthToken() ?? "";
    const auth = getAuthState();
    this.username = auth.type === "authenticated" ? auth.username : "anonymous-spectator";

    this.socket = treaty.socket.subscribe().ws;
    this.socket.onmessage = (e) => {
      const response = responseSchema.parse(e);

      switch (response.type) {
        case "info":
          if (response.result === "failure") {
            this.dispatch({ type: "error", error: new Error(`Error recieved from socket: ${response.message}`)});
          } else {
            console.log(response.message);
          }
          break;
        case "state":
          const id = response.state.id;
          const data = { state: response.state, knowledge: response.knowledge };

          this.gameData.set(id, data);
          this.dispatch({ type: "state", id, data });
          break;
      }

    }
    this.socket.onopen = () => {
      this.connected = true;
      this.dispatch({ type: "active", active: true });
    }
    this.socket.onclose = (e) => {
      this.connected = false;
      this.dispatch({ type: "active", active: false });
      this.dispatch({ type: "error", error: new Error(`Socket disconnected: ${e.reason}`)});
    }

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

  async subscribeToGame(gameId: string, initialData?: GameData) {
    if (this.subscribedGames.has(gameId)) {
      return;
    }

    if (initialData) {
      this.gameData.set(gameId, initialData);
    }

    await this.waitForConnection();

    this.socket.send(makeMessage({
      playerId: this.username,
      sessionToken: this.token,
      gameId: gameId,
      action: "subscribe",
    }));
    this.subscribedGames.add(gameId);
  }

  async unsubscribeFromGame(gameId: string) {
    if (!this.subscribedGames.has(gameId)) {
      return;
    }

    await this.waitForConnection();

    this.socket.send(makeMessage({
      playerId: this.username,
      sessionToken: this.token,
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

// TODO - make this a global singleton class with a hook `useGameClient(id)` that connects to a specific id
export function getGameClient(id: string, onError?: (e: Error) => void): GameClient {
  if (!onError) {
    onError = (e: Error) => console.log(e);
  }
  let data: GameData = { state: getBlankState(id, "loading...", [], 10), knowledge: [] };
  let active = false;
  const listeners: Listener[] = []

  const socket = treaty.socket.subscribe().ws;
  const token = getAuthToken() ?? "";
  const auth = getAuthState();

  const dispatch = (e: ClientEvent) => {
    for (const l of listeners) {
      l(e);
    }
  }

  const refreshData = async () => {
    const { data: fetchedData, error } = await treaty.games({ id: id }).state.get();

    if (error !== null) {
      onError(new Error(`Error fetching game state: ${error.status} - ${error.value}`));
      return;
    }

    data = fetchedData;
    dispatch({ type: "state", data });
  }

  socket.onmessage = (e) => {
    console.log("Recieved reponse:", e.data);
    const response = responseSchema.parse(JSON.parse(e.data));

    switch (response.type) {
      case "state":
        data = {
          state: response.state,
          knowledge: response.knowledge,
        }
        dispatch({ type: "state", data });
        break;
      case "info":
        console.log(response.message);

        active = response.result === "success";
        dispatch({ type: "active", active });

        if (response.result === "failure" && onError) {
          onError(new Error(`Error recieved from socket: ${response.message}`))
        }
        break;
    }

  }

  socket.onopen = () => {
    console.log("Sending subscription message...");
    socket.send(makeMessage({
      sessionToken: token,
      playerId: (auth.type === "authenticated") ? auth.username : "anonymous-spectator",
      gameId: id,
      action: "subscribe",
    }));
    active = true;
    dispatch({ type: "active", active });
  }

  socket.onclose = (e) => {
    active = false;
    dispatch({ type: "active", active });
    if (onError) {
      onError(new Error(`Webocket disconnected: ${e.reason}`));
    }
  }

  // we want to immediately refresh
  refreshData();

  return {
    active() {
      return active;
    },
    listen(listener: Listener) {
      listeners.push(listener);

      return () => {
        listeners.filter((l) => l !== listener);
      }
    },
    peek() {
      return data;
    },
    async act(action: GameAction): Promise<Error | "OK"> {
      const { error } = await treaty.games({ id: id }).act.post({
        action,
      });

      if (error !== null) {
        return new Error(`Error performing action: ${error.status} - ${error.value}`);
      }

      return "OK";
    },
    stop() {
      socket.send(makeMessage({
        sessionToken: token,
        playerId: (auth.type === "authenticated") ? auth.username : "anonymous-spectator",
        gameId: id,
        action: "unsubscribe",
      }))
    },
    refreshData
  }
}
