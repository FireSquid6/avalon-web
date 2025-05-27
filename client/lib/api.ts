import { treaty } from "@elysiajs/eden";
import type { App } from "@/server/api";


export function getTreaty() {
  const eden = treaty<App>("/api");

  return eden.api;
}

export type Api = ReturnType<typeof getTreaty>;
