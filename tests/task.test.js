const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Task = require("../src/models/Task");
const {
  userOneId,
  userOne,
  setupDatabase,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should Add task for a user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({ description: "Test task" })
    .expect(201);

  expect(await Task.findById(response.body._id)).toMatchObject({
    description: "Test task",
    completed: false,
  });
});

test("Should get all tasks for a user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test("Should not delete task not belonged to that user", async () => {
  await request(app)
    .delete("/tasks/" + taskOne._id)
    .set("Authorization", "Bearer " + userTwo.tokens[0].token)
    .send()
    .expect(404);
  expect(await Task.findById(taskOne._id)).not.toBeNull();
});

test("Should not create task with invalid description/completed", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({ description: "", completed: "" })
    .expect(400);
});

test("Should not update task with invalid description/completed", async () => {
  await request(app)
    .patch("/tasks/" + taskOne._id)
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({ description: "", completed: "" })
    .expect(400);
  expect(await Task.findById(taskOne._id)).toMatchObject(taskOne);
});

test("Should delete user task", async () => {
  await request(app)
    .delete("/tasks/" + taskOne._id)
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(await Task.findById(taskOne._id)).toBeNull();
});

test("Should not delete task if unauthenticated", async () => {
  await request(app)
    .delete("/tasks/" + taskOne._id)
    .send()
    .expect(401);

  expect(await Task.findById(taskOne._id)).not.toBeNull();
});

test("Should not update other users task", async () => {
  await request(app)
    .patch("/tasks/" + taskOne._id)
    .set("Authorization", "Bearer " + userTwo.tokens[0].token)
    .send({ description: "Update other user task", completed: false })
    .expect(404);
  expect(await Task.findById(taskOne._id)).toMatchObject(taskOne);
});

test("Should fetch user task by id", async () => {
  const response = await request(app)
    .get("/tasks/" + taskOne._id)
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body).toMatchObject({
    description: taskOne.description,
    completed: taskOne.completed,
  });
});

test("Should not fetch user task by id if unauthenticated", async () => {
  await request(app)
    .get("/tasks/" + taskOne._id)
    .send()
    .expect(401);
});

test("Should not fetch other users task by id", async () => {
  await request(app)
    .get("/tasks/" + taskOne._id)
    .set("Authorization", "Bearer " + userTwo.tokens[0].token)
    .send()
    .expect(404);
});

test("Should fetch only completed tasks", async () => {
  const response = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body[0]).toEqual(
    expect.objectContaining({
      description: taskTwo.description,
      completed: taskTwo.completed,
    })
  );
});

test("Should fetch only incomplete tasks", async () => {
  const response = await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body[0]).toEqual(
    expect.objectContaining({
      description: taskOne.description,
      completed: taskOne.completed,
    })
  );
});

test("Should sort tasks by description/completed/createdAt/updatedAt", async () => {
  //sort by description
  let response = null;
  response = await request(app)
    .get("/tasks?sortBy=description:desc")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: taskTwo.description,
        completed: taskTwo.completed,
      }),
      expect.objectContaining({
        description: taskOne.description,
        completed: taskOne.completed,
      }),
    ])
  );

  //sort by completed
  response = await request(app)
    .get("/tasks?sortBy=completed:desc")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: taskTwo.description,
        completed: taskTwo.completed,
      }),
      expect.objectContaining({
        description: taskOne.description,
        completed: taskOne.completed,
      }),
    ])
  );

  //sort by createdAt
  response = await request(app)
    .get("/tasks?sortBy=createdAt:desc")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: taskTwo.description,
        completed: taskTwo.completed,
      }),
      expect.objectContaining({
        description: taskOne.description,
        completed: taskOne.completed,
      }),
    ])
  );

  //sort by updatedAt
  response = await request(app)
    .get("/tasks?sortBy=description:desc")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: taskTwo.description,
        completed: taskTwo.completed,
      }),
      expect.objectContaining({
        description: taskOne.description,
        completed: taskOne.completed,
      }),
    ])
  );
});

test("Should fetch page of tasks", async () => {
  const response = await request(app)
    .get("/tasks?limit=2&skip=0")
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(200);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        description: taskOne.description,
        completed: taskOne.completed,
      }),
      expect.objectContaining({
        description: taskTwo.description,
        completed: taskTwo.completed,
      }),
    ])
  );
});
