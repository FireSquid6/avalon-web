import { app } from "./routes"
import type { Config } from "./config";
import { getConfigFromFile } from "./config";
import { getDb } from "./db";
import { GameObserver } from "./game";


export function startServer(config: Config) {
  const db = getDb(config);

  app.store.config = config;
  app.store.observer = new GameObserver(db);
  app.store.listeners = new Map();
  app.store.db = db;
  app.store.socketAuth = new Map();

  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
  });
}

export function startServerWithConfigFile(configFilepath?: string) {
  const config = getConfigFromFile(configFilepath);
  startServer(config);
}
