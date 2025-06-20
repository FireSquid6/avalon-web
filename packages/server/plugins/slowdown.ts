import Elysia from "elysia"

// adds an artifical delay to each request so that we can test
// slow connections locally
export const slowdown = (minTime: number, maxTime: number) => {
  return new Elysia()
    .onBeforeHandle(async () => {
      const time = minTime + ((maxTime - minTime) * Math.random());
      await new Promise((resolve) => setTimeout(resolve, time));
    })

}
