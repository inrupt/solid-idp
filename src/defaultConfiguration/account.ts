// Modified code from https://github.com/panva/node-oidc-provider-example/blob/43436a969a7bd589fea7e8ba83caa3fd4bc61854/03-oidc-views-accounts/account.js

import assert from 'assert'
import _ from 'lodash'

const USERS = {
  'https://littlejackson.example.com/profile/card#me': {
    email: 'foo@example.com',
    email_verified: true
  },
  'https://otherjackson.example.com/profile/card#me': {
    email: 'bar@example.com',
    email_verified: false
  }
}

export default class Account {
  accountId: string

  constructor (id) {
    this.accountId = id // the property named accountId is important to oidc-provider
  }

  // claims() should return or resolve with an object with claims that are mapped 1:1 to
  // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
  async claims () {
    return Object.assign({}, USERS[this.accountId], {
      sub: this.accountId
    })
  }

  static async findById (ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    return new Account(id)
  }

  static async authenticate (email, password) {
    assert(password, 'password must be provided')
    assert(email, 'email must be provided')
    const lowercased = String(email).toLowerCase()
    const id = _.findKey(USERS, { email: lowercased })
    assert(id, 'invalid credentials provided')

    // this is usually a db lookup, so let's just wrap the thing in a promise
    return new this(id)
  }
}
