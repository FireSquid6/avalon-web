import { app } from "./routes"
import type { Config } from "./config";
import { getConfigFromFile } from "./config";
import { getDb } from "./db";


export function startServer(config: Config) {
  const db = getDb(config);

  app.store.config = config;
  app.store.games = new Map();
  app.store.db = db;

  app.listen(4320, () => {
    console.log("Server started on port 4320");
  });
}

export function startServerWithConfigFile(configFilepath?: string) {
  const config = getConfigFromFile(configFilepath);
  startServer(config);
}
