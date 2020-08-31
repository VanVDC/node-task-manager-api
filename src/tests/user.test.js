const request = require("supertest");

const app = require("../../src/app");
const User = require("../../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

//run once before test
beforeEach(setupDatabase);

//1.test create user account
test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Lin",
      email: "lin@example.com",
      password: "12345678",
    })
    .expect(201);

  //assert that the database was changed corretly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // assert about the respone
  expect(response.body).toMatchObject({
    user: { name: "Lin", email: "lin@example.com" },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe("12345678");
});

//2.test login
test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  //assert
  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

//3.test login bad name and pass
test("Shouldn't able to login nonexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "12352132",
    })
    .expect(400);
});

//4.test profile with authentication
test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

//5.test delete
test("Should delete account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  //assert
  const user = await User.findById(userOneId);

  expect(user).toBeNull();
});

//6.test should not delete
test("Should not delete account", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

//7.testing image upload
test("Should upload avatar images", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "src/tests/fixtures/profile-pic.jpg")
    .expect(200);
  //assert
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

//8.update valid user fields
test("Should update user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "Jess" })
    .expect(200);

  //assert
  const user = await User.findById(userOneId);
  expect(user.name).toEqual("Jess");
});

//9. Should not update invalid user fields
test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ location: "Atlanta" })
    .expect(400);
});
