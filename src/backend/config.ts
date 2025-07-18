import { z } from "zod";
import YAML from "yaml";
import fs from "fs";

export const configSchema = z.object({
  port: z.optional(z.number()),
  dbType: z.optional(z.enum(["local", "remote"])),
  databasePath: z.optional(z.string()),
  databaseToken: z.optional(z.string()),
  emailToken: z.optional(z.union([z.string(), z.null()])),
});

export type PartialConfig = z.infer<typeof configSchema>;
export type Config = Required<PartialConfig>;



export function getConfigFromFile(filepath?: string): Config {
  let partialConfig: PartialConfig = {};

  if (filepath !== undefined && fs.existsSync(filepath)) {
    const text = fs.readFileSync(filepath).toString();
    const object = YAML.parse(text);
    partialConfig = configSchema.parse(object);
  }

  return getConfigFromPartial(partialConfig);
}

export function getPartialFromEnv(): PartialConfig {
  const port = process.env.AVALON_PORT ? parseInt(process.env.AVALON_PORT) : undefined;

  return {
    port,
    dbType: process.env.AVALON_DB_TYPE === "remote" ? "remote" : "local" ,
    databasePath: process.env.AVALON_DB_PATH,
    databaseToken: process.env.AVALON_DB_TOKEN,
    emailToken: process.env.AVALON_EMAIL_API_KEY,
  }

}

export function getConfigFromPartial(p: PartialConfig): Config {
  return {
    port: p.port ?? 7890,
    databasePath: p.databasePath ?? ":memory:",
    databaseToken: p.databaseToken ?? "",
    dbType: p.dbType ?? "local",
    emailToken: p.emailToken ?? null,
  }
}
