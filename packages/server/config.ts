import { z } from "zod";
import YAML from "yaml";
import fs from "fs";

export const configSchema = z.object({
  port: z.optional(z.number()),
  databasePath: z.optional(z.string()),
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

export function getConfigFromPartial(p: PartialConfig): Config {
  return {
    port: p.port ?? 7890,
    databasePath: p.databasePath ?? ":memory:",
  }
}
