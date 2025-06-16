import { z } from "zod";
import { Elysia, t } from "elysia"
import { ruleEnum, type GameInfo, type GameState } from "engine";
import { randomUUID } from "crypto";
import { generateKnowledgeMap, getBlankState } from "engine/logic";
import { gameActionSchema } from "engine/actions";
import { processAction, ProcessError } from "engine/process";
import { viewStateAs } from "engine/view";
import { messageSchema, socketFailure, socketInfo, stateResponse, type SocketMessage } from "./protocol";
import { simpleLogger } from "./logger";
import { cors } from "@elysiajs/cors";
import type { Config } from "./config";
import type { Db } from "./db";
import { createSession, createUser, getProfile, getSessionWithToken, userExists, validateEmail, validatePassword, validateUsername } from "./db/auth";
import { Stream } from "@elysiajs/stream";


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

// TODO - rate limit
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
    const validateMessage = async (message: SocketMessage): Promise<string | true> => {
      const session = await getSessionWithToken(db, message.sessionToken);

      if (session === null) {
        return "No session exists";
      }

      if (session.user.username !== message.playerId) {
        return "Session does not match user";
      }

      if (session.session.expiresAt <= new Date()) {
        return "Session is expired";
      }

      return true;
    }

    return {
      forceAuthenticated,
      forceInGame,
      validateMessage,
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
  .post("/games", async ({ body, store, forceAuthenticated }) => {
    const { user } = await forceAuthenticated();

    const ruleset = z.array(ruleEnum).parse(body.ruleset);
    const gameId = randomUUID();
    const state = getBlankState(gameId, user.username, ruleset);

    store.games.set(gameId, new Game(state));

    return gameId;

  }, {
    body: t.Object({
      ruleset: t.Array(t.String()),
    }),
  })
  .post("/games/:id/join", async ({ params, store: { games }, body, status, forceAuthenticated }) => {
    const { user } = await forceAuthenticated();
    const game = games.get(params.id);
    const password = body?.password ?? "";

    if (game === undefined) {
      return status("Not Found")
    }

    const state = game.peek();

    if (state.status !== "waiting") {
      return status("Bad Request", "Game has already started");
    }

    if (!(state.password !== undefined && state.password === password)) {
      return status("Unauthorized", "Incorrect password");
    }

    if (state.players.length >= 10) {
      return status("Unauthorized", "Game is full");
    }

    state.players.push({
      displayName: user.username,
      id: user.username,
    });
    state.tableOrder.push(user.username);
    game.update(state);

    const view = viewStateAs(state, user.username);
    const knowledgeMap = generateKnowledgeMap(state);

    return {
      state: view,
      knowledge: knowledgeMap[user.username] ?? [],
    }
  }, {
    body: t.Optional(t.Object({
      password: t.String(),
    }))
  }) 
  .post("/games/:id/act", async ({ params, body, status, forceInGame }) => {
    const { user, game } = await forceInGame(params.id);

    const state = game.peek();

    const { data: action, error, success } = gameActionSchema.safeParse(body.action);

    if (!success) {
      return status("Bad Request", error);
    }

    const result = processAction({
      state,
      action,
      actorId: user.username,
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
      action: t.Any(),
    }),
  })
  .get("/games/:id/state", async ({ forceInGame, params }) => {
    const { user, game } = await forceInGame(params.id);

    const state = game.peek();
    const knowledgeMap = generateKnowledgeMap(state);

    // we return an "incomplete" version of the state
    // that hides roles and incomplete votes
    const view = viewStateAs(state, user.username);

    return {
      state: view,
      knowledge: knowledgeMap[user.username] ?? [],
    }
  })
  .ws("/socket", {
    // TODO - new rule: each client can only be connected to ONE game
    message(ws, rawMessage) {
      const games = ws.data.store.games;
      const listeners = ws.data.store.listeners;

      const json = JSON.parse(rawMessage as string);
      const message = messageSchema.parse(json);

      const validationError = ws.data.validateMessage(message);
      if (typeof validationError === "string") {
        ws.send(socketFailure(validationError));
        return;
      }

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
  .get("/users/:username", async ({ params, status, store: { db }}) => {
    const profile = await getProfile(db, params.username);

    if (profile === null) {
      return status("Not Found");
    }

    return profile;
  })
  .post("/users", async ({ body, status, store: { db } }) => {
    if (await userExists(db, body.username, body.email)) {
      return status("Bad Request", "Username or email already taken. Try a different one.");
    }

    const errors = [validateEmail(body.email), validatePassword(body.password), validateUsername(body.username)].filter((e) => e !== null);

    if (errors.length !== 0) {
      return status("Bad Request", `Validation error: ${errors.join(", ")}`);
    }


    const hashedPassword = Bun.password.hashSync(body.password)
    // TODO - configure whether to automatically verify or not
    const user = await createUser(db, body.username, body.email, hashedPassword, true);
    return user;

  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .post("/sessions", async ({ body, status, store: { db }, cookie: { auth, username } }) => {
    const session = await createSession(db, body.email, body.password);

    if (session === null) {
      await new Promise((r) => setTimeout(r, 2000));
      return status("Bad Request", "Invalid email or password");
    }

    auth?.set({
      expires: session.session.expiresAt,
      value: session.session.token,
    });
    username?.set({
      expires: session.session.expiresAt,
      value: session.user.username,
    });

    return session.session;
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .get("/whoami", async () => {

  })
  // TODO - reset password with email

export type App = typeof app;
