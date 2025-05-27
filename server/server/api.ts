import { z } from "zod";
import { Elysia, t } from 'elysia'
import { ruleEnum, type GameState } from "@/backend/engine";
import { randomUUID } from 'crypto';
import { generateKnowledgeMap, getBlankState } from '@/backend/engine/logic';
import { gameActionSchema } from "@/backend/engine/actions";
import { processAction, ProcessError } from "@/backend/engine/process";
import { viewStateAs } from "@/backend/engine/view";
import { messageSchema, socketFailure, socketInfo, stateResponse } from "./messages";

type GameListener = (updatedState: GameState) => void;

class Game {
  private state: GameState;
  private listeners: GameListener[] = [];

  constructor(state: GameState) {
    this.state = state;
  }

  update(state: GameState) {
    this.state = state;

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  subscribe(listener: GameListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  }

  unsubscribe(listener: GameListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  peek(): GameState {
    return this.state;
  }
}


export const api = new Elysia({ prefix: '/api' })
  .state("games", new Map<string, Game>())
  .state("listeners", new Map<string, GameListener>())
  .post("/games/:id/interact", (ctx) => {
    return ctx.status("Not Implemented");
    // perform chat and highlights
  })
  .post("/games", ({ body, store }) => {
    const ruleset = z.array(ruleEnum).parse(body.ruleset);
    const gameId = randomUUID();
    const state = getBlankState(gameId, body.playerId, ruleset);

    store.games.set(gameId, new Game(state));

    return gameId;

  }, {
    body: t.Object({
      ruleset: t.Array(t.String()),
      playerId: t.String(),
    }),
  })
  .post("/games/:id/act", ({ params, body, status, store: { games } }) => {
    const game = games.get(params.id);

    if (!game) {
      return status("Not Found");
    }

    const state = game.peek();

    const { data: action, error, success } = gameActionSchema.safeParse(body.action);

    if (!success) {
      return status("Bad Request", error);
    }

    const result = processAction({
      state,
      action,
      actorId: body.playerId,
    });

    if (result instanceof ProcessError) {
      if (result.type === "client") {
        return status("Bad Request", result.reason);
      } else {
        return status("Internal Server Error", result.reason);
      }
    }

    game.update(result);
  }, {
    body: t.Object({
      playerId: t.String(),
      action: t.Any(),
    }),
  })
  .get("/games/:id/state", ({ store, params, status, body }) => {
    const game = store.games.get(params.id);

    if (game === undefined) {
      return status("Not Found");
    }

    const state = game.peek();
    const knowledgeMap = generateKnowledgeMap(state);

    // we return an "incomplete" version of the state
    // that hides roles and incomplete votes
    const view = viewStateAs(state, body.playerId);


    return {
      state: view,
      knowledge: knowledgeMap ?? [],
    }
  }, {
    body: t.Object({
      playerId: t.String(),
    })
  })
  .ws("/stream", {
    // TODO - new rule: each client can only be connected to ONE game
    message(ws, rawMessage) {
      const games = ws.data.store.games;
      const listeners = ws.data.store.listeners;

      const json = JSON.parse(rawMessage as string);
      const message = messageSchema.parse(json);

      const isSubscribed = listeners.has(ws.id);
      const game = games.get(message.gameId);

      if (game === undefined) {
        ws.send(socketFailure(`Game ${message.gameId} not found`));
        
        return;
      }


      if (message.action === "subscribe" && !isSubscribed) {
        const listener: GameListener = (state) => {
          const view = viewStateAs(state, message.playerId);
          const knowledgeMap = generateKnowledgeMap(state);

          const knowledge = knowledgeMap[message.playerId] ?? [];

          ws.send(stateResponse(view, knowledge));
        }

        game.subscribe(listener);
        listeners.set(ws.id, listener);
        ws.send(socketInfo(`Subscribed to ${message.gameId}`))
      } else if (message.action === "unsubscribe" && isSubscribed) {
        const listener = listeners.get(ws.id)!;

        game.unsubscribe(listener);
        listeners.delete(ws.id);

        ws.send(socketInfo(`Unsubscribed from ${message.gameId}`))
      } else {
        ws.send(socketFailure(`Tried to subscribe to an already subscribed game or unsubscribe from unsubscribed game`));
      }
    },
    close(ws) {
      const games = ws.data.store.games;
      const listeners = ws.data.store.listeners;

      if (listeners.has(ws.id)) {
        const listener = listeners.get(ws.id)!;

        games.forEach((game) => {
          game.unsubscribe(listener);
        });
      }
    },
  })

export type App = typeof api;
