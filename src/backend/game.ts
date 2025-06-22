import type { GameState, GameInfo } from "@/engine";
import type { Db } from "./db";
import { updateGameState, getGameById } from "./db/game";
import type { Message } from "./db/schema";
import { randomUUIDv7 } from "bun";

export type GameEvent = {
  type: "message";
  newMessage: Message;
} | {
  type: "state",
  state: GameState,
}

export type GameListener = (e: GameEvent) => void;

export interface SpecificListener {
  socketId: string;
  username: string;
  fn: GameListener;
}

export class GameObserver {
  private db: Db;
  private listeners: SpecificListener[] = [];

  constructor(db: Db) {
    this.db = db;
  }

  subscribeToUser(socketId: string, username: string, listener: GameListener) {
    this.listeners.push({
      username,
      socketId,
      fn: listener,
    });
  }

  unsubscribeId(id: string) {
    this.listeners.filter((l) => l.socketId !== id);
  }

  async update(state: GameState) {
    await updateGameState(this.db, state);

    const users = new Set(state.players.map((p) => p.id));
    console.log("Dispatching for:", users);

    for (const l of this.listeners) {
      if (users.has(l.username)) {
        console.log("Calling for", l.socketId);
        l.fn({ type: "state", state: state });
      }
    }
  }

  async chat(gameId: string, message: Message) {
    const game = await getGameById(this.db, gameId);
    const users = new Set(game?.players.map((p) => p.id));

    for (const l of this.listeners) {
      if (users.has(l.username)) {
        l.fn({ type: "message", newMessage: message });
      }
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

