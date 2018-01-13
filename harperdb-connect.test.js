const nock = require('nock')
const { HarperDBConnect } = require('./harperdb-connect')

let db
describe('HarperDBConnect Class', () => {
  beforeAll(() => {
    const harperDB = nock('http://mockdb.url')
      .post('/', {
        operation: 'describe_all',
      })
      .reply(201, { foo: 'bar' })
      .persist()
  })

  beforeEach(async () => {
    try {
      db = await new HarperDBConnect(
        'username',
        'password',
        'http://mockdb.url/'
      )
    } catch (err) {
      throw new Error(`Error in beforeEach set up: ${err}`)
    }
  })

  afterEach(() => {
    db = undefined
  })

  test('can be instantiated with only username and password', () => {
    expect.assertions(3)
    db = new HarperDBConnect('username', 'password')
    expect(db).toBeDefined()
    expect(db).toBeInstanceOf(HarperDBConnect)
    expect(typeof db.authorization).toBe('string')
  })

  test('can be instantiated with username, password, and url', async () => {
    expect.assertions(3)
    db = await new HarperDBConnect('username', 'password', 'http://mockdb.url/')
    expect(db).toBeDefined()
    expect(db.options.url).toBeDefined()
    await expect(
      new HarperDBConnect('username', 'password', 'http://mockdb.url/')
    ).resolves.toBeInstanceOf(HarperDBConnect)
  })

  test('instantiation rejects bad connection', async () => {
    expect.assertions(1)
    try {
      db = await new HarperDBConnect('username', 'password', 'http://bad.url')
    } catch (e) {
      expect(e).toContain('Error connecting to http://bad.url')
    }
  })

  test('resolves connection with valid options.url', async () => {
    expect.assertions(1)
    db = new HarperDBConnect('username', 'password')
    db.setDefaultOptions({ url: 'http://mockdb.url' })
    await expect(db.connect()).resolves.toBe('http://mockdb.url')
  })

  test('rejects connection with bad url', async () => {
    expect.assertions(1)
    db = new HarperDBConnect('username', 'password')
    try {
      await db.connect('http://bad.url')
    } catch (e) {
      expect(e.toString()).toContain('RequestError')
    }
  })

  test('resolves request without useDefault', async () => {
    expect.assertions(1)
    await expect(
      db.request(
        {
          method: 'POST',
          url: db.options.url,
          headers: {
            'content-type': 'application/json',
            authorization: db.authorization,
          },
          json: true,
          body: { operation: 'describe_all' },
        },
        false
      )
    ).resolves.toEqual({ foo: 'bar' })
  })

  test('resolves request with useDefault', async () => {
    expect.assertions(1)
    db.setDefaultOptions({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: db.authorization,
      },
      json: true,
    })

    await expect(
      db.request(
        {
          operation: 'describe_all',
        },
        true
      )
    ).resolves.toEqual({ foo: 'bar' })
  })

  test('rejects request when not connected', async () => {
    expect.assertions(1)
    db = new HarperDBConnect('username', 'password')

    await expect(db.request({})).rejects.toEqual(
      'Instance not connected to database'
    )
  })

  test.skip('rejects request with invalid options', async () => {})

  describe('Method Parameters', () => {
    test('setOperation() throws error for invalid parameters', () => {
      expect.assertions(4)
      db = new HarperDBConnect()
      expect(_ => db.setAuthorization(0, 0)).toThrowError(TypeError)
      expect(_ => db.setAuthorization(0, 0)).toThrowError(
        'username and password must be of type string'
      )
      expect(_ => db.setAuthorization('', '')).toThrowError(TypeError)
      expect(_ => db.setAuthorization('', '')).toThrowError(
        'username and password must be nonempty strings'
      )
    })

    test('setDefaultOptions() throws error for invalid parameters', () => {
      expect.assertions(2)
      expect(_ => db.setDefaultOptions('notObject')).toThrowError(TypeError)
      expect(_ => db.setDefaultOptions('notObject')).toThrowError(
        'options must be defined and of type object'
      )
    })

    test('connect() throws error for invalid parameters', () => {
      expect.assertions(4)
      db = new HarperDBConnect()
      expect(_ => db.connect(0)).toThrowError(TypeError)
      expect(_ => db.connect(0)).toThrowError(
        'url must be defined and of type string'
      )
      expect(_ => db.connect('http://url')).toThrowError(TypeError)
      expect(_ => db.connect('http://url')).toThrowError(
        'must set authorization before establishing a connection'
      )
    })

    test('request() throws error for invalid parameters', () => {
      expect.assertions(4)
      expect(_ => db.request('notObject')).toThrowError(TypeError)
      expect(_ => db.request('notObject')).toThrowError(
        'queryOrOptions must be defined and of type object'
      )
      expect(_ => db.request({}, 'notBoolean')).toThrowError(TypeError)
      expect(_ => db.request({}, 'notBoolean')).toThrowError(
        'useDefault must be a boolean'
      )
    })
  })
})
