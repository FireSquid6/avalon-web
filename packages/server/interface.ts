// everything in this file is safe to import in a web environment
// otherwise, the server must be run in a bun environment. This is best
// done through docker

import type { App } from "./api";
import { treaty } from "@elysiajs/eden";


export function getTreaty(address: string) {
  return treaty<App>(address);
}
