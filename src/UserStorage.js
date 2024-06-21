// import { authenticator } from "otplib"
import {generateOTP} from "./global/fn/otp"
import { env } from "hono/adapter"

class UserStorage {
  storage = null
  data = []
  key = "users"
  secret="secret"

  constructor(ctx) {
    const { kvStorage } = env(ctx)
    this.storage = kvStorage
  }

  async getData() {
    try {
      const buffer = await this.storage.get(this.key)
      this.data = JSON.parse(buffer)
    } catch (e) {
      console.error(e)
    }
    return this.data
  }

  async commit() {
    try {
      const buffer = JSON.stringify(this.data)
      await this.storage.put(this.key,buffer)
    } catch (e) {
      console.error(e)
    }
  }

  async create(username) {
    const otpSecret = await generateOTP(this.secret)
    // console.log(otpSecret)

    const user = {
      username,
      otpSecret,
    }
    let existingRow =  null
    let results =  this.data.filter((user) => user.username === username)
    if(results)
      existingRow = results[0]
    if (existingRow) {
      existingRow = user
    } else this.data.push(user)
    console.log({user,data:this.data})
    await this.commit()
  }

  async get(username) {
    await this.getData()
    let results = this.data.filter((user) => user.username === username)
    if (results.length > 0) return results[0]
    return null
  }

  async activate(username) {
    const row = await this.get(username)
    if (row) {
      row.isActivated = true
      await this.commit()
    }
  }
}
export default UserStorage