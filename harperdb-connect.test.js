const nock = require('nock')
const { HarperDBConnect } = require("./harperdb-connect");

describe('HarperDBConnect Class', () => {
  beforeAll(() => {
    const harperDB = nock('http://mockdb.url')
                      .post('/', {
                        operation: 'describe_all'
                      })
                      .reply(201, {})
                      .persist()
  })
  test("can be instantiated with only username and password", () => {
    const db = new HarperDBConnect("username", "password");
    expect(db).toBeDefined();
    expect(db).toBeInstanceOf(HarperDBConnect);
    expect(typeof db.authorization).toBe('string')
  });
  test("can be instantiated with username, password, and url", async () => {
    const db = await new HarperDBConnect("username", "password", "http://mockdb.url/")
    expect(db).toBeDefined()
    expect(db).toBeInstanceOf(HarperDBConnect)
    expect(db.options.url).toBeDefined()
  })
  test("resolves request without useDefault", async () => {
    const db = await new HarperDBConnect("username", "password", "http://mockdb.url/")
    await expect(db.request({
      method: 'POST',
        url: db.options.url,
        headers: {
          'content-type': 'application/json',
          authorization: db.authorization,
        },
        json: true,
        body: { operation: 'describe_all' }
    }, false)).resolves.toEqual({})
  })
  test.skip("resolves request with useDefault")
  test.skip("rejects request when not connected")
  test.skip("rejects request with invalid options")
  test.skip("method request throws error for invalid parameters")
  test.skip("method connect throws error for invalid parameters")

})
