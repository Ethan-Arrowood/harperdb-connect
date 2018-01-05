const rp = require("request-promise-native");

module.exports.HarperDBConnect = class HarperDBConnect {
  constructor(username, password) {
    this.authorization = `Basic ${new Buffer(
      username + ":" + password
    ).toString("base64")}`;
  }
};
