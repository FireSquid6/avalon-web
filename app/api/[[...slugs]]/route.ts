import { Elysia, t } from 'elysia'

const app = new Elysia({ prefix: '/api' })
  .get('/', () => 'hello Next')
  .post('/', ({ body }) => body, {
    body: t.Object({
      name: t.String()
    })
  })
  .get("/data", () => {
    return "here's some more data!";
  })
  .post("/game/:id/interact", () => {
    // perform chat and highlights
  })
  .post("/game/:id/act", () => {
    // perform in game actions
  })
  .get("/game/:id/knowledge", () => {
    // get the stuff I should know
  })
  .get("/game/:id/state", () => {
    // get the state of the current game
  })
  .ws("game/:id/stream", () => {
    // streams state and chat updates
  })


export const GET = app.handle
export const POST = app.handle 
