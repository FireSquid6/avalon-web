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
    data: GameData;
  } | {
    type: "motion";
  } | {
    type: "active";
    active: boolean;
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


// not making this a class is more convienient since we can do an async contructor
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
