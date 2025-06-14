import { Elysia } from "elysia";

export function simpleLogger() {

  return new Elysia()
    .onRequest((ctx) => {
      const method = ctx.request.method;
      const url = new URL(ctx.request.url);


      console.log(`--> ${method} ${url.pathname}`);
    })
}
