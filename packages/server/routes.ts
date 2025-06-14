import { z } from "zod";
import { Elysia, t } from "elysia"
import { ruleEnum, type GameInfo, type GameState } from "engine";
import { randomUUID } from "crypto";
import { generateKnowledgeMap, getBlankState } from "engine/logic";
import { gameActionSchema } from "engine/actions";
import { processAction, ProcessError } from "engine/process";
import { viewStateAs } from "engine/view";
import { messageSchema, socketFailure, socketInfo, stateResponse } from "./protocol";
import { simpleLogger } from "./logger";
import { cors } from "@elysiajs/cors";
import type { Config } from "./config";
import type { Db } from "./db";
import { getSessionWithToken } from "./db/auth";

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

  getInfo(): GameInfo {
    return {
      id: this.state.id,
      requiresPassword: this.state.password !== undefined,
      status: this.state.status,
      gameMaster: this.state.gameMaster,
    }

  }
}

export const app = new Elysia()
  .use(simpleLogger())
  .use(cors())
  .state("games", new Map<string, Game>())
  .state("listeners", new Map<string, GameListener>())
  .state("config", {} as Config)
  .state("db", {} as Db)
  .derive(({ cookie: { auth }, set, store: { db, games } }) => {
    const forceAuthenticated = async () => {
      if (!auth) {
        set.status = "Unauthorized";
        throw new Error("No cookie");
      }
      const token = auth.value;

      if (!token) {
        set.status = "Unauthorized";
        throw new Error("No token in cookie");
      }

      const session = await getSessionWithToken(db, token);

      if (!session) {
        set.status = "Unauthorized";
        throw new Error("Token doesn't represent a valid session");
      }

      if (session.session.expiresAt <= new Date()) {
        set.status = "Unauthorized";
        throw new Error("Token is expired");
      }

      return session;
    }

    const forceInGame = async (gameId: string) => {
      const { user, session } = await forceAuthenticated();
      const game = games.get(gameId);

      if (!game) {
        set.status = "Not Found";
        throw new Error("Game does not exist");
      }

      if (game.peek().players.find((u) => u.id === user.username) === undefined) {
        set.status = "Unauthorized";
        throw new Error("You must be in this game to perform that action");
      }

      return {
        user,
        session,
        game,
      }

    }

    return {
      forceAuthenticated,
      forceInGame,
    }

  })
  .post("/games/:id/motion", (ctx) => {
    return ctx.status("Not Implemented");
    // perform chat and highlights
  })
  // kinda a diabolical one liner if I do say so myself
  // unreadable though. It does what you think it would
  .get("/open-games", ({ store: { games } }) => games.values().toArray()
    .map((g) => g.peek())
    .filter((g) => g.status === "waiting")
    .map((g): GameInfo => {
      return {
        id: g.id,
        requiresPassword: g.password !== undefined,
        gameMaster: g.gameMaster,
        status: "waiting",
      }
    })
  )
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
  .post("/games/:id/act", async ({ params, body, status, forceAuthenticated, store: { games } }) => {
    const { user } = await forceAuthenticated();
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

export type App = typeof app;
