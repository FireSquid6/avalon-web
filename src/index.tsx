import { randomUUIDv7, serve } from "bun";
import index from "./frontend/index.html";
import type { Config } from "./backend/config";
import { app } from "./backend/routes"
import { getPartialFromEnv, getConfigFromPartial } from "./backend/config";
import { getDb } from "./backend/db";
import { GameObserver } from "./backend/game";
import { getSessionWithToken } from "./backend/db/auth";
import { chatResponse, stateResponse } from "./backend/protocol";
import { generateKnowledgeMap } from "./engine/logic";
import type { User, Session } from "./backend/db/schema";


export interface WsData {
  user: User;
  session: Session;
  id: string;
}


function startApp(config: Config) {
  const db = getDb(config);
  const observer = new GameObserver(db)

  app.store.config = config;
  app.store.observer = observer;
  app.store.db = db;
  app.store.timeouts = new Map<string, number>();

  serve({
    routes: {
      "/api/*": {
        GET: r => app.handle(r),
        POST: r => app.handle(r),
        PATCH: r => app.handle(r),
        PUT: r => app.handle(r),
        DELETE: r => app.handle(r),
        OPTIONS: r => app.handle(r),
      },
      "/api": {
        GET: r => app.handle(r),
        POST: r => app.handle(r),
        PATCH: r => app.handle(r),
        PUT: r => app.handle(r),
        DELETE: r => app.handle(r),
        OPTIONS: r => app.handle(r),
      },
      "/*": index,
      "/socket": {
        async GET(req, server) {
          const token = req.cookies.get("session");
          if (!token) {
            return new Response("Must be authenticated for socket", { status: 401 });
          }

          const auth = await getSessionWithToken(db, token)
          if (!auth) {
            return new Response("Must be authenticated for socket", { status: 401 });
          }
          const data: WsData = { ...auth, id: randomUUIDv7() };

          if (server.upgrade(req, { data })) {
            return;
          }
          return new Response("Upgrade failed", { status: 500 });
        },
      }
    },

    websocket: {
      async close(ws) {
        const data = ws.data as WsData
        console.log("Disconnected:", data.id);
        observer.unsubscribeId(data.id);
      },
      async message(ws) {
        ws.send("Sending messages to this web socket does nothing. It's purely for server events");
      },
      async open(ws) {
        const data = ws.data as WsData
        observer.subscribeToUser(data.id, data.user.username, (e) => {
          switch (e.type) {
            case "state":
              const knowledge = generateKnowledgeMap(e.state);
              ws.send(stateResponse(e.state, knowledge[data.user.username] ?? []));
              break;
            case "message":
              ws.send(chatResponse(e.newMessage));
              break;
          }
        });
      },
      // idk what to do with this one
      drain() { },
    },

    development: process.env.NODE_ENV !== "production" && {
      // Enable browser hot reloading in development
      hmr: true,
    },
    port: config.port,
  });
}

const partial = getPartialFromEnv();
const config = getConfigFromPartial(partial);
console.log("Connecting to database:", config.databasePath);
startApp(config);
console.log(`Started server on port ${config.port}`)
