const request = require('request')
const rp = require('request-promise-native')
const merge = require('lodash.merge')

module.exports.HarperDBConnect = class HarperDBConnect {
  // Basic constructor. If url is passed trys to connect
  // and returns a promise so user can properly handle
  // the request errors from connect() method
  constructor(username, password, url) {
    this.authorization = undefined
    this.isConnected = false
    this.options = {}

    if (username !== undefined && password !== undefined)
      this.setAuthorization(username, password)

    if (url !== undefined) {
      return new Promise(async (resolve, reject) => {
        try {
          const host = await this.connect(url)
          this.options.url = host
          resolve(this)
        } catch (err) {
          reject(`Error connecting to ${url}. \n${err}`)
        }
      })
    }
  }

  // Synchronous method. Returns auth
  setAuthorization(username, password) {
    if (typeof username !== 'string' && typeof password !== 'string')
      throw new TypeError('username and password must be of type string')
    else if (username.length === 0 && password.length === 0)
      throw new TypeError('username and password must be nonempty strings')

    const auth = `Basic ${Buffer.from(username + ':' + password).toString(
      'base64'
    )}`

    this.authorization = auth

    merge(this.options, {
      headers: {
        authorization: auth,
      },
    })

    return auth
  }

  // Synchronous method. Returns merged options
  setDefaultOptions(options) {
    if (typeof options !== 'object')
      throw new TypeError('options must be defined and of type object')

    merge(this.options, options)

    return this.options
  }

  // asynch method attempts to connect to db
  // returns a promise that resolves with connected url
  connect(url = this.options.url) {
    this.isConnected = false
    if (typeof url !== 'string')
      throw new TypeError('url must be defined and of type string')
    if (typeof this.authorization !== 'string')
      throw new TypeError(
        'must set authorization before establishing a connection'
      )

    let db = this

    return new Promise(async (resolve, reject) => {
      try {
        await rp(
          {
            method: 'POST',
            url,
            headers: {
              'content-type': 'application/json',
              authorization: db.authorization,
            },
            json: true,
            body: { operation: 'describe_all' },
          },
          false
        )
        db.isConnected = true
        merge(db.options, { url })
        resolve(url)
      } catch (err) {
        reject(err)
      }
    })
  }

  // returns promise
  request(queryOrOptions, useDefault = true) {
    if (typeof queryOrOptions !== 'object')
      throw new TypeError('queryOrOptions must be defined and of type object')
    if (typeof useDefault !== 'boolean')
      throw new TypeError('useDefault must be a boolean')

    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject('Instance not connected to database')
      }

      const request_options = useDefault
        ? {
            ...this.options,
            body: queryOrOptions,
          }
        : { ...queryOrOptions }
      rp(request_options)
        .then(res => resolve(res))
        .catch(error => reject(error))
    })
  }
}
