// everything in this file is safe to import in a web environment
// otherwise, the server must be run in a bun environment. This is best
// done through docker

import type { App } from "./api";
import { treaty, type Treaty } from "@elysiajs/eden";

export type AvalonTreaty = ReturnType<typeof getTreaty>

export function getTreaty(address: string) {
  return treaty<App>(address);
}



export type CustomTreatyResponse<Res extends Record<number, unknown>> =
  | {
      data: Res[200]
      error: null
      response: Response
      status: number
      headers: BunFetchRequestInit["headers"]
    }
  | {
      data: null
      error: Exclude<keyof Res, 200> extends never
        ? {
            status: any
            value: any
          }
        : {
            [Status in keyof Res]: {
              status: Status
              value: Res[Status]
            }
          }[Exclude<keyof Res, 200>]
      response: Response
      status: number
      headers: BunFetchRequestInit["headers"]
    }

export function unwrap<T>(res: CustomTreatyResponse<Record<number, T | null>>): T {
  if (res.error !== null) {
    throw new Error(`Error fetching ${res.response.url} with status ${res.status}: ${res.error}`);
  }
  if (res.data === null) {
    throw new Error(`Error fetching ${res.response.url} with status ${res.status}: data was null`)
  }
  if (res.status !== 200) {
    throw new Error(`Error fetching ${res.response.url} with status ${res.status}: Unknown. Bad response but no error.`);
  }

  return res.data
}
