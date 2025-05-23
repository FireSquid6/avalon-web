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


export const GET = app.handle
export const POST = app.handle 
