// everything in this file is safe to import in a web environment
// otherwise, the server must be run in a bun environment. This is best
// done through docker

import type { App } from "./routes";
import { treaty, type Treaty } from "@elysiajs/eden";

export type AvalonTreaty = ReturnType<typeof getTreaty>

export function getTreaty(address: string) {
  return treaty<App>(address, {
    fetch: {
      credentials: "include",
    }
  });
}


type StatusResponse<T, E> = {
  200: T
} & Record<Exclude<number, 200>, E>;

export function unwrap<T, E>(res: Treaty.TreatyResponse<StatusResponse<T, E>>): T {
  if (res.error !== null) {
    throw new Error(`Error fetching from ${res.response.url}: ${res.error}`);
  }
  if (res.status !== 200) {
    throw new Error(`Error fetching from ${res.response.url}: Got status ${res.status}`)
  }

  // trust me bro
  return res.data as T;
}
