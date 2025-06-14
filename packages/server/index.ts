import { app } from "./routes"
import type { Config } from "./config";
import { getConfigFromFile } from "./config";


export function startServer(config: Config) {
  app.store.config = config;
  app.listen(4320, () => {
    console.log("Server started on port 4320");
  });
}

export function startServerWithConfigFile(configFilepath?: string) {
  const config = getConfigFromFile(configFilepath);
  startServer(config);
}
