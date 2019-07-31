// Modified code from https://github.com/panva/node-oidc-provider-example/blob/43436a969a7bd589fea7e8ba83caa3fd4bc61854/03-oidc-views-accounts/account.js

import assert from 'assert'
import _ from 'lodash'
import Redis from 'ioredis'
import bcrypt from 'bcrypt'

const REDIS_URL = process.env.REDIS_URL || ''
const SALT_ROUNDS = 10

const client: Redis = new Redis(REDIS_URL, { keyPrfix: 'user' })

export default class Account {
  accountId: string

  constructor (id) {
    this.accountId = id
  }

  async claims () {
    return {
      sub: this.accountId
    }
  }

  static async findById (ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    // return new Account(id)
    return new Account(id)
  }

  static async authenticate (email, password) {
    assert(password, 'password must be provided')
    assert(email, 'email must be provided')
    const lowercased = String(email).toLowerCase()
    const user = JSON.parse(await client.get(this.key(email)))
    console.log(user)
    assert(user, "User does not exist")
    assert(await bcrypt.compare(password, user.password), "Incorrect Password")
    return new this(user.webID)
  }

  static async create (email: string, password: string, webID: string): Promise<void> {
    const webIDTaken = await client.get(`taken:${webID}`)
    assert(!webIDTaken, 'User already exists.')
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    await client.set(`taken:${webID}`, 'true')
    await client.set(this.key(email), JSON.stringify({
      webID,
      email,
      password: hashedPassword
    }))
  }

  static key (name: string): string {
    return `user:${name}`
  }
}
