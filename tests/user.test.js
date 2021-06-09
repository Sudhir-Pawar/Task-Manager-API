const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Sudhir",
      email: "pawarsudhir84@gmail.com",
      password: "test@123",
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: "Sudhir",
      email: "pawarsudhir84@gmail.com",
    },
    token: user.tokens[0].token,
  });
});

test("Should login existent user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user).not.toBeNull();

  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "nonexixtentuser@test.com",
      password: "test@123",
    })
    .expect(400);
});

test("Should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);
});

test("Should not get user profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete user account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(await User.findById(userOneId)).toBeNull();
});

test("Should not delete user account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload user avatar on user profile", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  expect((await User.findById(userOneId)).avatar).toEqual(expect.any(Buffer));
});

test("Should update user name field", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({
      name: "User One Changed Name",
    })
    .expect(200);
  expect(response.body.name).toBe((await User.findById(userOneId)).name);
});

test("Should not update invalids user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({
      location: "Pune",
    })
    .expect(400);
});

test("Should not signup user with invalid name/email/password", async () => {
  //name not provided
  await request(app)
    .post("/users")
    .send({
      name: "",
      email: "testemail@test.com",
      password: "test@123",
    })
    .expect(400);

  //invalid email
  await request(app)
    .post("/users")
    .send({
      name: "Test user",
      email: "invalidemail",
      password: "test@123",
    })
    .expect(400);

  //invalid password: length too short
  await request(app)
    .post("/users")
    .send({
      name: "Test user",
      email: "testuser@test.com",
      password: "test",
    })
    .expect(400);
});

test("Should not update user if unauthenticated", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "Update testname",
    })
    .expect(401);
});

test("Should not update user with invalid name/email/password", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({
      name: "",
      email: "invalidemail",
      password: "test",
    })
    .expect(400);

  expect(await User.findById(userOneId)).toMatchObject({
    name: "Test User One",
    email: "userone@test.com",
  });
});

test("Should not delete user if unauthenticated", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
