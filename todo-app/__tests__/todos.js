const request = require("supertest");
const db = require("../models");
const app = require("../app");
const cheerio = require("cheerio");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application test suite", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  const login = async (agent, username, password) => {
    let res = await agent.get("/login");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/session").send({
      email: username,
      password: password,
      _csrf: csrfToken,
    });
  };
  test("test for Signing up", async () => {
    let res = await agent.get("/signup");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/users").send({
      firstName: "first",
      lastName: "last",
      email: "first@last",
      password: "first@last",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("test for logout", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/logout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent = request.agent(server);
    await login(agent, "first@last", "first@last");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todo").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with the given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "first@last", "first@last");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todo").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application,json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueTodayList.length;
    const latestTodo = parsedGroupedResponse.dueTodayList[dueTodayCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const setCompletionTrueResponse = await agent
      .put(`/todo/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedTrueResponse = JSON.parse(setCompletionTrueResponse.text);
    expect(parsedTrueResponse.completed).toBe(true);

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const setCompletionFalseResponse = await agent
      .put(`/todo/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });
    const parsedFalseResponse = JSON.parse(setCompletionFalseResponse.text);
    expect(parsedFalseResponse.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const agent = request.agent(server);
    await login(agent, "first@last", "first@last");
    // FILL IN YOUR CODE HERE
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const testTodo = await agent
      .post("/todo")
      .send({
        title: "sample",
        dueDate: "2023-05-15",
        _csrf: csrfToken,
      })
      .set("Accept", "application,json");
    const parsedResponse = JSON.parse(testTodo.text);
    expect(parsedResponse.id).toBeDefined();
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const response = await agent.delete(`/todo/${parsedResponse.id}`).send({
      _csrf: csrfToken,
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
