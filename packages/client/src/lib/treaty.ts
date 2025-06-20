import { getTreaty } from "server/interface";


const url = import.meta.env.VITE_PUBLIC_SERVER_URL;

if (url === undefined) {
  throw new Error("No server url provided. Your env vars are broken.");
}

export const treaty = getTreaty(url);

export function getSocket(): WebSocket {
  const socketUrl = import.meta.env.VITE_PUBLIC_SOCKET_URL;
  if (socketUrl === undefined) {
    throw new Error("No socket url provided. Your env vars are broken.");
  }

  return new WebSocket(socketUrl);
}
