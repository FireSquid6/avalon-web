import { serve } from "bun";
import index from "./frontend/index.html";
import type { Config } from "./backend/config";
import { app } from "./backend/routes"
import { getPartialFromEnv, getConfigFromPartial } from "./backend/config";
import { getDb } from "./backend/db";
import { GameObserver } from "./backend/game";


function startApp(config: Config) {
  const db = getDb(config);

  app.store.config = config;
  app.store.observer = new GameObserver(db);
  app.store.listeners = new Map();
  app.store.db = db;
  app.store.socketAuth = new Map();

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
    },

    development: process.env.NODE_ENV !== "production" && {
      // Enable browser hot reloading in development
      hmr: false,
    },
    port: config.port,
  });
}

const partial = getPartialFromEnv();
const config = getConfigFromPartial(partial);
console.log("Connecting to database:", config.databasePath);
startApp(config);
console.log(`Started server on port ${config.port}`)
