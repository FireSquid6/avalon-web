import type { GameState, GameInfo } from "engine";
import type { Db } from "./db";
import { updateGameState, getGameById } from "./db/game";
import type { Message } from "./db/schema";

export type GameEvent = {
  type: "message";
  newMessage: Message;
} | {
  type: "state",
  state: GameState,
}

export type GameListener = (e: GameEvent) => void;

export class GameObserver {
  private db: Db;
  private listeners: Record<string, GameListener[]> = {};

  constructor(db: Db) {
    this.db = db;
  }

  subscribe(gameId: string, listener: GameListener) {
    if (this.listeners[gameId]) {
      this.listeners[gameId].push(listener);
    }
    this.listeners[gameId] = [listener];

    return () => {
      this.listeners[gameId]?.filter((l) => l !== listener);
    }
  }

  unsubscribe(gameId: string, listener: GameListener) {
    this.listeners[gameId]?.filter(l => l !== listener);
  }

  unsubscribeFromAll(listener: GameListener) {
    for (const id of Object.keys(this.listeners)) {
      this.listeners[id]?.filter(l => l !== listener);
    }

  }

  async update(state: GameState) {
    await updateGameState(this.db, state);

    for (const l of this.listeners[state.id] ?? []) {
      l({ type: "state", state });
    }
  }

  async chat(gameId: string, message: Message) {
    for (const l of this.listeners[gameId] ?? []) {
      l({ type: "message", newMessage: message });
    }
  }

  async peek(id: string): Promise<GameState | null> {
    return await getGameById(this.db, id);
  }

  async getInfo(id: string): Promise<GameInfo | null> {
    const state = await this.peek(id);

    if (!state) {
      return null;
    }

    return {
      id: state.id,
      requiresPassword: state.password !== undefined,
      status: state.status,
      gameMaster: state.gameMaster,
      currentPlayers: state.players.length,
      maxPlayers: state.expectedPlayers,
      ruleset: state.ruleset,
    }
  }
}
