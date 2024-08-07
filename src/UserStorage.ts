// import { authenticator } from "otplib"
import { Context } from "hono"
import {generateOTP} from "./global/fn/otp"
import { env } from "hono/adapter"
export interface IUser{
  username:string
  otpSecret:string
}
class UserStorage {
  storage :KVNamespace|null= null
  data:any[] = []
  key:string = "users"
  secret:string="secret"

  constructor(ctx:Context) {
    const { kvStorage } = env(ctx)
    this.storage = kvStorage
  }

  async getData() {
    if(this.storage){
    try {
      const buffer :string |null= await this.storage.get(this.key)
      if(buffer)
      this.data = JSON.parse(buffer)
    } catch (e) {
      console.error(e)
    }}
    return this.data
  }

  async commit() {
    try {
      const buffer = JSON.stringify(this.data)
      if(this.storage && buffer)
      await this.storage.put(this.key,buffer)
    } catch (e) {
      console.error(e)
    }
  }

  async create(username:string) {
    const otpSecret = await generateOTP(this.secret)
    // console.log(otpSecret)

    const user:IUser = {
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

  async get(username:string) {
    await this.getData()
    let results = this.data.filter((user) => user.username === username)
    if (results.length > 0) return results[0]
    return null
  }

  async activate(username:string) {
    const row = await this.get(username)
    if (row) {
      row.isActivated = true
      await this.commit()
    }
  }
}
export default UserStorage