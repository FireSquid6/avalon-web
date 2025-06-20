import { z } from "zod";
import { Elysia, t } from "elysia"
import { ruleEnum, type GameInfo } from "engine";
import { generateKnowledgeMap, getBlankState } from "engine/logic";
import { gameActionSchema } from "engine/actions";
import { processAction, ProcessError } from "engine/process";
import { viewStateAs } from "engine/view";
import { chatResponse, messageSchema, socketFailure, socketInfo, stateResponse, type SocketMessage } from "./protocol";
import { loggerPlugin } from "./logger";
import type { Config } from "./config";
import type { Db } from "./db";
import { createSession, createUser, deleteSesssion, getSessionWithToken, userExists, validateEmail, validatePassword, validateUsername } from "./db/auth";
import { cors } from "@elysiajs/cors";
import { getProfile } from "./db/profile";
import { GameObserver } from "./game";
import { createGame, getJoinedGamesByUser, getWaitingGames } from "./db/game";
import type { GameListener } from "./game";
import { createMessage, lastNMessages } from "./db/chat";
import type { Message, Session, User } from "./db/schema";
import { cookiePlugin } from "./plugins/cookie";

// TODO - rate limit
export const app = new Elysia()
  .use(loggerPlugin)
  .use(cors())
  .use(cookiePlugin())
  .state("observer", {} as GameObserver)
  .state("listeners", new Map<string, GameListener>())
  .state("config", {} as Config)
  .state("db", {} as Db)
  .state("socketAuth", new Map<string, { session: Session, user: User }>())
  .derive(({ getSession, set, store: { db, observer } }) => {
    const forceAuthenticated = async () => {
      const token = getSession();

      if (!token) {
        set.status = 401;
        throw new Error("Not signed in. (No token in cookie)");
      }

      const session = await getSessionWithToken(db, token);

      if (!session) {
        set.status = 401;
        throw new Error("Not signed in. (Token doesn't represent a valid session)");
      }

      if (session.session.expiresAt <= new Date()) {
        set.status = 401;
        throw new Error("Not signed in. (Token is expired)");
      }

      return session;
    }
    const getAuthStatus = async () => {
      const token = getSession();

      if (!token) {
        return null;
      }

      return await getSessionWithToken(db, token);
    }
    const forceInGame = async (gameId: string) => {
      const { user, session } = await forceAuthenticated();
      const state = await observer.peek(gameId);

      if (!state) {
        set.status = 404;
        throw new Error("Game does not exist");
      }

      if (state.players.find((u) => u.id === user.username) === undefined) {
        set.status = 401;
        throw new Error("You must be in this game to perform that action");
      }

      return {
        user,
        session,
        state,
      }
    }

    return {
      getAuthStatus,
      forceAuthenticated,
      forceInGame,
    }

  })
  .post("/games/:id/chat", async ({ forceInGame, store: { db, observer }, status, params, body: { message } }) => {
    const { user } = await forceInGame(params.id);

    if (message.length > 1000) {
      return status(400, "Messages must be less than 1000 characters long");
    }

    const msg = await createMessage(db, params.id, user.username, message);
    await observer.chat(params.id, msg);

    return msg;
  }, {
    body: t.Object({
      message: t.String(),
    })
  })
  .get("/games/:id/chat", ({ store: { db }, params }): Promise<Message[]> => {
    return lastNMessages(db, params.id);
  })
  .get("/opengames", async ({ getAuthStatus, store: { db } }) => {
    const auth = await getAuthStatus();
    const username = auth?.user.username;
    const openGames = await getWaitingGames(db, username, 50);


    const gameInfo = openGames.map((g): GameInfo => {
      return {
        id: g.id,
        requiresPassword: g.password !== undefined,
        gameMaster: g.gameMaster,
        status: "waiting",
        ruleset: g.ruleset,
        maxPlayers: g.expectedPlayers,
        currentPlayers: g.players.length,
      }
    })

    return gameInfo
  })
  .get("/joinedgames", async ({ getAuthStatus, store: { db } }) => {
    const username = (await getAuthStatus())?.user.username ?? "anonymous-spectator";

    const joinedGames = await getJoinedGamesByUser(db, username);

    const gameInfo = joinedGames.map((g): GameInfo => {
      return {
        id: g.id,
        requiresPassword: g.password !== undefined,
        gameMaster: g.gameMaster,
        status: "waiting",
        ruleset: g.ruleset,
        maxPlayers: g.expectedPlayers,
        currentPlayers: g.players.length,
      }
    })

    return gameInfo
  })
  .post("/games", async ({ body, set, store, forceAuthenticated }) => {
    const { user } = await forceAuthenticated();

    const ruleset = z.array(ruleEnum).parse(body.ruleset);
    // TODO - generate nicer looking ids.
    const gameId = randomGameId();
    const state = getBlankState(gameId, user.username, ruleset, body.maxPlayers, body.password);
    state.players.push({
      displayName: user.username,
      id: user.username,
    });
    state.tableOrder.push(user.username);

    await createGame(store.db, state);

    set.status = 200;
    return gameId;

  }, {
    body: t.Object({
      ruleset: t.Array(t.String()),
      maxPlayers: t.Number(),
      password: t.Optional(t.String()),
    }),
  })
  .post("/games/:id/join", async ({ params, store: { observer }, body, status, forceAuthenticated }) => {
    const { user } = await forceAuthenticated();
    const state = await observer.peek(params.id);
    const password = body?.password ?? "";
    // TODO: block join if game is full

    if (state === null) {
      return status("Not Found")
    }

    if (state.status !== "waiting") {
      return status("Bad Request", "Game has already started");
    }

    if (state.password !== undefined && password !== state.password) {
      return status("Unauthorized", "Incorrect password");
    }

    if (state.players.length >= state.expectedPlayers) {
      return status("Unauthorized", "Game is full");
    }

    if (state.players.find((p) => p.id === user.username) !== undefined) {
      return status("Bad Request", "You are already in this game!");
    }

    state.players.push({
      displayName: user.username,
      id: user.username,
    });
    state.tableOrder.push(user.username);
    observer.update(state);

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
  .post("/games/:id/act", async ({ params, store: { observer }, body, status, forceInGame }) => {
    const { user, state } = await forceInGame(params.id);

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

    observer.update(result);
  }, {
    body: t.Object({
      action: t.Any(),
    }),
  })
  .get("/games/:id/state", async ({ getAuthStatus, store: { observer }, status, params }) => {
    const auth = await getAuthStatus();
    const username = auth?.user.username ?? "anonymous-spectator";
    const state = await observer.peek(params.id);

    if (!state) {
      return status(404, "Game not found");
    }

    const knowledgeMap = generateKnowledgeMap(state);

    // we return an "incomplete" version of the state
    // that hides roles and incomplete votes
    const view = viewStateAs(state, username);

    return {
      state: view,
      knowledge: knowledgeMap[username] ?? [],
    }
  })
  .ws("/socket", {
    // TODO - new rule: each client can only be connected to ONE game
    async open(ws) {
      const auth = await ws.data.getAuthStatus();
      console.log("New connecition:", ws.id);
      if (!auth) {
        console.log("Disconnecting, connection doesn't work");
        ws.send(socketFailure("No token found"));
        ws.close();
        return;
      }
      ws.data.store.socketAuth.set(ws.id, auth);
    },
    async message(ws, rawMessage) {
      const auth = ws.data.store.socketAuth.get(ws.id);

      if (!auth) {
        ws.send(socketFailure("No session found"));
        ws.close();
        return;
      }
      const { user } = auth;

      try {
        const listeners = ws.data.store.listeners;
        const observer = ws.data.store.observer;

        const message = messageSchema.parse(rawMessage);
        console.log("Recieved", message);

        const isSubscribed = listeners.has(ws.id);
        const state = await observer.peek(message.gameId);

        if (state === undefined) {
          ws.send(socketFailure(`Game ${message.gameId} not found`));
          return;
        }


        if (message.action === "subscribe" && !isSubscribed) {
          const listener: GameListener = (e) => {

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

          observer.subscribe(message.gameId, listener);
          listeners.set(ws.id, listener);
          ws.send(socketInfo(`Subscribed to ${message.gameId}`))
        } else if (message.action === "unsubscribe" && isSubscribed) {
          const listener = listeners.get(ws.id)!;

          observer.unsubscribe(message.gameId, listener);
          listeners.delete(ws.id);

          ws.send(socketInfo(`Unsubscribed from ${message.gameId}`))
        } else {
          ws.send(socketFailure(`Tried to subscribe to an already subscribed game or unsubscribe from unsubscribed game`));
        }
      } catch (e) {
        console.log("Unexpected error:", e);
      }
    },
    close(ws) {
      console.log("Closed connecition:", ws.id);
      const listeners = ws.data.store.listeners;
      const observer = ws.data.store.observer;

      if (listeners.has(ws.id)) {
        const listener = listeners.get(ws.id)!;
        observer.unsubscribeFromAll(listener);
      }
    },
  })
  .get("/users/:username", async ({ params, status, store: { db } }) => {
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
  .post("/sessions", async ({ body, status, store: { db }, setSession }) => {
    const session = await createSession(db, body.email, body.password);

    if (session === null) {
      await new Promise((r) => setTimeout(r, 2000));
      return status("Bad Request", "Invalid email or password");
    }

    setSession(session.session.token, session.session.expiresAt);

    return session.session;
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .post("/signout", async ({ forceAuthenticated, store: { db }, removeSessionCookie }) => {
    const { session } = await forceAuthenticated();

    await deleteSesssion(db, session.token);
    removeSessionCookie();

  })
  .get("/whoami", async ({ forceAuthenticated }) => {
    const { user } = await forceAuthenticated();
    return {
      username: user.username,
      verified: user.verified,
      email: user.email,
    }
  })
// TODO - reset password with email

function randomGameId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


export type App = typeof app;
