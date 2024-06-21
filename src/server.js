import { Hono } from "hono"
const app = new Hono()
import UserStorage from "./UserStorage"

app.get("/", async (ctx) => {
  const userStorage = new UserStorage(ctx)
  await userStorage.create("bbd33")
  const user = await userStorage.get("bbd33")
  return ctx.json({user})
})
app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req.raw)
})
export default app