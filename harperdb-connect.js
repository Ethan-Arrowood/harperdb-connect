const rp = require("request-promise-native")

module.exports.HarperDBConnect = class HarperDBConnect {
  constructor(username, password, url) {
    this.authorization = undefined
    this.isConnected = false
    this.options = {}

    this.setAuthorization(username, password)

    if ( url !== undefined ) {
      return new Promise(async (resolve, reject) => {
        try {
          const host = await this.connect(url)
          this.options.url = host 
          resolve(this)
        } catch(err) {
          reject(`Error connecting to ${url}. \n${err}`)
        }
      })
    }
    
  }

  setAuthorization(username, password) {
    if (typeof username !== 'string' && typeof password !== 'string')
      throw new Error('Username and password must be of type string.')
    else if (username.length === 0 && password.length === 0) 
      throw new Error('Username and password must be nonempty strings.')
  
    this.authorization = `Basic ${new Buffer(
      username + ":" + password
    ).toString("base64")}`
  }

  setDefaultOptions(options) {
    if (typeof options !== 'object') 
      throw new Error('options must be defined and of type object')
    
    this.options = {
      ...this.options,
      ...options,
    }
  }

  connect(url = this.options.url) {
    if ( typeof url !== 'string' ) 
      throw new Error('url must be defined and of type string')
    if ( typeof this.authorization !== 'string' )
      throw new Error('must set authorization before establishing a connection')
    
    return new Promise((resolve, reject) => {
      rp({
        method: 'POST',
        url,
        headers: {
          'content-type': 'application/json',
          authorization: this.authorization,
        },
        json: true,
        body: { operation: 'describe_all' }
      })
        .then(res => {
          this.isConnected = true 
          resolve(url)
        })
        .catch(err => reject(err, url))
    })
  }

  request(queryOrOptions, useDefault = true) {
    if (typeof queryOrOptions !== 'object') 
      throw new Error('queryOrOptions must be defined and of type object')

    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject('Instance not connected to database.')
      }

      const request_options = useDefault ? {
        ...this.options,
        body: queryOrOptions
      } : { ...queryOrOptions }
      rp(request_options)
        .then(res => resolve(res))
        .catch(error => reject(error))
    })
  }
}
