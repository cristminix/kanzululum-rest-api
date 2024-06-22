import { Hono } from "hono"
import { cors } from "hono/cors"
import { env } from "hono/adapter"
import { getConnInfo } from "hono/cloudflare-workers"

const app = new Hono()
import UserStorage from "./UserStorage"
// import { crc32id } from "./global/fn/crc32id"
import { validateEmail } from "./global/fn/validateEmail"
import { validateCaptchaToken } from "./global/fn/validateCaptchaToken"

const validAppIds = ["kanzululum-web"]
// enable cors
const validateContactData = async (postData) => {
  const fieldNames = ["name", "email", "subject", "comments", "captchaToken"]
  const fieldCaps = ["Nama", "Email", "Subyect", "Pesan", "Captcha"]

  let idx = 0
  let valid = true
  let errorMessage = ""

  for (const field of fieldNames) {
    const value = postData[field]

    if (!value || value == "" || value == null) {
      errorMessage = field === "captchaToken" ? "Silahkan ceklist keamanan" : `* Silahkan masukkan ${fieldCaps[idx]} *`
      valid = false
    } else if (field === "email" && !validateEmail(value)) {
      errorMessage = `*Silahkan masukkan email valid misal : anda@gmail.com *`
      valid = false
    } else if (field === "captchaToken") {
      try {
        const result = await validateCaptchaToken(value, "6LdLtP4pAAAAAFWqsN9qyHd6y5cQ_Ikx0cRhRqvH")
        let { success } = result
        if (!success) {
          valid = false
          errorMessage = result.message
        }
      } catch (e) {
        valid = false
        errorMessage = e.toString()
      }
    }
    if (!valid) {
      break
    }
    idx += 1
  }

  return { valid, errorMessage }
}

app.use("*", (c, next) => {
  const origins = c.env.ALLOWED_ORIGINS == "*" ? "*" : c.env.ALLOWED_ORIGINS.split(",")
  // console.log(origins)
  const corsMiddleware = cors(origins)
  return corsMiddleware(c, next)
})

app.post("/contact/identity", async (c) => {
  const { kvStorage } = env(c)
  const postData = await c.req.parseBody()
  const { appId, clientId } = postData
  let ticket = null
  const info = getConnInfo(c)
  const ipAddr = info.remote.addr ?? "127.0.0.1"
  if (validAppIds.includes(appId)) {
    ticket = `${appId}-${clientId}-${ipAddr}`
    await kvStorage.put(ticket, "true")
  }

  return c.json({ ticket })
})

app.post("/contact/send", async (c) => {
  const { kvStorage } = env(c)

  const postData = await c.req.parseBody()
  const { ticket, appId, clientId, subject, name, email, comments, captchaToken } = postData
  const hasValidTicket = "true" === (await kvStorage.get(ticket))

  if (!validAppIds.includes(appId)) return c.json({ success: false, message: `appId is not registered` })

  if (!hasValidTicket) return c.json({ success: false, message: `invalid ticket` })

  const { valid, errorMessage } = await validateContactData(postData)

  if (!valid) return c.json({ success: false, message: errorMessage })

  await kvStorage.delete(ticket)
  // send email
  const from = "kontact@ponpeskanzululumcirebon.com"
  const to = "kanzululumdotcom@gmail.com"
  // const subject
  const message = `<div>
          <h4>${name} menghubungi lewat kontak </h4>
          <h5>Subyek : ${subject}</h5>
          <div>${comments}</div>
          <div>
            <span>Tanggal:${new Date()}</span>
            <a href="mailto:${email}">{email}</a>
          </div>
        </div>`

  return c.json({ success: true, from, to, message })
})

// app.get("/public/*", async (ctx) => {
//   return await ctx.env.ASSETS.fetch(ctx.req.raw)
// })
export default app