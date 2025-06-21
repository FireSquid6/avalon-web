import { getTreaty } from "@/backend/interface";


export const treaty = getTreaty("/").api;

export function getSocket(): WebSocket {
  return new WebSocket("/socket");
}
