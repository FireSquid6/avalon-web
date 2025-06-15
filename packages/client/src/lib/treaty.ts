import { getTreaty } from "server/interface";


const url = import.meta.env.VITE_PUBLIC_SERVER_URL;

if (url === undefined) {
  throw new Error("No server url provided. Your env vars are broken.");
}

export const treaty = getTreaty(url);
