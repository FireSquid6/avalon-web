import { treaty } from "@elysiajs/eden";
import type { App } from "@/server/api";


export function getTreaty() {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl === undefined) {
    throw new Error("apiUrl was undefined. Your environment variables are configured incorrectly");
  }

  const eden = treaty<App>(apiUrl);
  return eden;
}

export type Api = ReturnType<typeof getTreaty>;
