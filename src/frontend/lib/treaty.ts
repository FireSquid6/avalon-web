import { getTreaty } from "@/backend/interface";


const url = window.location.origin;
export const treaty = getTreaty(url);

export function getSocket(): WebSocket {
  const socketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${socketProtocol}://${window.location.host}/socket`;

  return new WebSocket(url);
}
