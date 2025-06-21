import type { GameState, GameInfo } from "@/engine";
import type { Db } from "./db";
import { updateGameState, getGameById } from "./db/game";
import type { Message, User } from "./db/schema";
import { viewStateAs } from "@/engine/view";
import { generateKnowledgeMap } from "@/engine/logic";
import { stateResponse, chatResponse } from "./protocol";
import type { ServerWebSocket } from "bun";

export type GameEvent = {
  type: "message";
  newMessage: Message;
} | {
  type: "state",
  state: GameState,
}

export type GameListener = (e: GameEvent) => void;

export interface SpecificListener {
  id: string;
  fn: GameListener;
}

export class GameObserver {
  private db: Db;
  private listeners: Record<string, SpecificListener[]> = {};

  constructor(db: Db) {
    this.db = db;
  }

  subscribe(gameId: string, listenerId: string, listener: GameListener) {
    if (this.isSubscribed(gameId, listenerId)) {
      return;
    }

    if (this.listeners[gameId]) {
      this.listeners[gameId].push({
        id: listenerId,
        fn: listener,
      });
    }
    this.listeners[gameId] = [{
      id: listenerId,
      fn: listener,
    }];

    return () => {
      this.listeners[gameId]?.filter((l) => l.id !== listenerId);
    }
  }

  isSubscribed(gameId: string, listenerId: string): boolean {
    const l = this.listeners[gameId];
    if (!l) {
      return false;
    }
    return l.find((l) => l.id === listenerId) !== undefined;
  }

  unsubscribeListener(listenerId: string) {
    for (const gameId of Object.keys(this.listeners)) {
      this.listeners[gameId]?.filter((l) => l.id !== listenerId);
    }
  }

  unsubscribe(listenerId: string, gameId: string) {
    this.listeners[gameId]?.filter((l) => l.id !== listenerId);
  }


  async update(state: GameState) {
    await updateGameState(this.db, state);

    for (const l of this.listeners[state.id] ?? []) {
      l.fn({ type: "state", state });
    }
  }

  async chat(gameId: string, message: Message) {
    for (const l of this.listeners[gameId] ?? []) {
      l.fn({ type: "message", newMessage: message });
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

export function makeListener(user: User, ws: ServerWebSocket<any>): GameListener {
  return (e) => {
    switch (e.type) {
      case "state":
        const state = e.state;
        const view = viewStateAs(state, user.username);
        const knowledgeMap = generateKnowledgeMap(state);

        const knowledge = knowledgeMap[user.username] ?? [];

        console.log("Sending new state...");
        ws.send(stateResponse(view, knowledge));
        break;
      case "message":
        ws.send(chatResponse(e.newMessage));
    }
  }

}
