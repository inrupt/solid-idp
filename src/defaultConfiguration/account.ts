// Modified code from https://github.com/panva/node-oidc-provider-example/blob/43436a969a7bd589fea7e8ba83caa3fd4bc61854/03-oidc-views-accounts/account.js

import assert from 'assert'
import _ from 'lodash'
import Redis from 'ioredis'
import bcrypt from 'bcrypt'
import uuid from 'uuid'

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
    return new Account(id)
  }

  static async authenticate (username, password) {
    assert(password, 'Password must be provided')
    assert(username, 'Username must be provided')
    const lowercased = String(username).toLowerCase()
    const user = JSON.parse(await client.get(this.key(username)))
    assert(user, "User does not exist")
    assert(await bcrypt.compare(password, user.password), "Incorrect Password")
    return new this(user.webID)
  }

  static async create (email: string, password: string, username: string, webID: string): Promise<void> {
    const curUser = await client.get(this.key(username))
    assert(!curUser, 'User already exists.')
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    await client.set(this.key(username), JSON.stringify({
      username,
      webID,
      email,
      password: hashedPassword
    }))
  }

  static key (name: string): string {
    return `user:${name}`
  }

  static async generateForgotPassword(username): Promise<{ email: string, uuid: string }> {
    const user = JSON.parse(await client.get(this.key(username)))
    assert(user, 'The username does not exist.')
    const forgotPasswordUUID = uuid.v4()
    await client.set(this.forgotPasswordKey(forgotPasswordUUID), username, 'EX', 60 * 60 * 24)
    return {
      email: user.email,
      uuid: forgotPasswordUUID
    }
  }

  static async getForgotPassword() {

  }

  static forgotPasswordKey(name) {
    return `forgotPassword:${name}`
  }
}
