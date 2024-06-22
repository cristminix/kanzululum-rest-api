import { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const recaptcha = (
  recaptchaSecret: string,
  options = { score: 0.5 },
): MiddlewareHandler => {
  return async (ctx, next) => {
    const body = await ctx.req.json()
    const recaptchaToken = body.recaptchaToken

    if (!recaptchaSecret || !recaptchaToken) {
      throw new Error('reCAPTCHA token + secret are required for middleware.')
    }

    await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      {
        method: 'POST',
      },
    )
      .then((res) => res.json())
      .then((res) => {
        if (!res.success || res.score <= options.score) {
          throw new HTTPException(400, {
            message: 'reCAPTCHA validation failed',
          })
        }
      })

    await next()
  }
}