import Elysia from "elysia";


export const cookiePlugin = () => new Elysia()
  .derive({ as: "global" },(ctx) => {
    const makeCookie = (name: string, data: string, expires: Date) => {
      const url = new URL(ctx.request.url);
      let cookie = `${name}=${data}; Date=${expires.toUTCString()}; SameSite=None`

      if (url.protocol === "https") {
        cookie += '; Secure';
      }
      return cookie;
    }

    const setSession = (token: string, expires: Date) => {
      const cookie = makeCookie("session", token, expires);
      ctx.set.headers["set-cookie"] = cookie;
    }

    const removeSessionCookie = () => {
      // set it as a new expired date
      const date = new Date();
      date.setFullYear(2000);
      const cookie = makeCookie("session", "", date);
      ctx.set.headers["set-cookie"] = cookie;

    }

    const getSession = () => {
      const cookie = ctx.cookie["session"]?.value;
      return cookie ?? null;
    }

    return {
      makeCookie,
      setSession,
      getSession,
      removeSessionCookie
    }
  })
