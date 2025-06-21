import { getTreaty } from "@/backend/interface";


const url = window.location.origin;
export const treaty = getTreaty(url);

export function getSocket(): WebSocket {
  const socketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  console.log(socketProtocol);
  console.log(window.location.host);

  const url = `${socketProtocol}://${window.location.host}/socket`;
  console.log(url);

  return new WebSocket(url);
}
