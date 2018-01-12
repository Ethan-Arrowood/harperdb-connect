# HarperDB Connect 

[![Build Status](https://travis-ci.org/Ethan-Arrowood/harperdb-connect.svg?branch=master)](https://travis-ci.org/Ethan-Arrowood/harperdb-connect)


[![https://nodei.co/npm/harperdb-connect.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/harperdb-connect.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/harperdb-connect)

Developed by Ethan Arrowood

```js
const db = new HarperDBConnect(
  'username', 
  'password', 
  'http://localhost:5000'
)

db
  .connect('http://localhost:5000')
  .then(host => console.log(`db connection to ${host} successful.`))
  .catch((err, host) => console.log(`db connection to ${host} unsuccesful.`))

db.setDefaultOptions({
  'method': 'POST',
  'headers': {
    'content-type': 'application/json'
  },
  'json': true
})

db
  .request({
    'operation': 'describe_all'
  }) 
  .then(res => console.log(`Database responded with: ${res}`))
  .catch(err => console.log(`Database request error: ${err}`))
```
