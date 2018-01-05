const { HarperDBConnect } = require("./harperdb-connect");

test("can create instance of HarperDBConnect", () => {
  const db = new HarperDBConnect("username", "password");
  expect(db).toBeDefined();
  expect(db instanceof HarperDBConnect).toBeTruthy();
});
