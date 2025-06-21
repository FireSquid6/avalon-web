import { serve, type ServerWebSocket } from "bun";
import index from "./frontend/index.html";
import type { Config } from "./backend/config";
import { app } from "./backend/routes"
import { getPartialFromEnv, getConfigFromPartial } from "./backend/config";
import { getDb } from "./backend/db";
import { GameObserver } from "./backend/game";
import { getSessionWithToken } from "./backend/db/auth";
import { handleClose, handleMessage, type SocketContext, type WsData } from "./backend/socket";


function startApp(config: Config) {
  const db = getDb(config);
  const observer = new GameObserver(db)

  const socketContext: SocketContext = {
    config,
    observer,
  }

  app.store.config = config;
  app.store.observer = observer;
  app.store.db = db;

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
          const data: WsData = auth;

          if (server.upgrade(req, { data })) {
            return;
          }
          return new Response("Upgrade failed", { status: 500 });
        },
      }
    },

    websocket: {
      async close(ws) {
        await handleClose(socketContext, ws as ServerWebSocket<WsData>);
      },
      async message(ws, buffer) {
        const message = buffer.toString();
        // we can typecast trust me
        await handleMessage(socketContext, ws as ServerWebSocket<WsData>, message);
      },
      // idk what to do with this one
      drain() {},
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
