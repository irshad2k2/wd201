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

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with the given ID as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application,json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueTodayList.length;
    const latestTodo = parsedGroupedResponse.dueTodayList[dueTodayCount - 1];
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const setCompletionTrueResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedTrueResponse = JSON.parse(setCompletionTrueResponse.text);
    expect(parsedTrueResponse.completed).toBe(true);

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const setCompletionFalseResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });
    const parsedFalseResponse = JSON.parse(setCompletionFalseResponse.text);
    expect(parsedFalseResponse.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // FILL IN YOUR CODE HERE
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const testTodo = await agent
      .post("/todos")
      .send({
        title: "sample",
        dueDate: "2023-05-15",
        _csrf: csrfToken,
      })
      .set("Accept", "application,json");
    const parsedResponse = JSON.parse(testTodo.text);
    expect(parsedResponse.id).toBeDefined();
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const response = await agent.delete(`/todos/${parsedResponse.id}`).send({
      _csrf: csrfToken,
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // res = await agent.get("/");
    // csrfToken = extractCsrfToken(res);
    // const reresponse = await agent.delete(`/todos/${parsedResponse.id}`).send({
    //   _csrf: csrfToken
    // });
    // expect(response.status).toBe(200);
    // expect(reresponse.body.success).toBe(false);
  });

  // test("Fetches all todos in the database using /todos endpoint", async () => {
  //   await agent.post("/todos").send({
  //     title: "Buy xbox",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Buy ps3",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });
});
