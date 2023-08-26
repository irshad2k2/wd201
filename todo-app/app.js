const express = require("express");
const app = express();
const csrf = require("csurf");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("secret string"));
app.use(csrf({ cookie: true }));

// setting ejs view
app.set("view engine", "ejs");

// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async function (request, response) {
  const allTodos = await Todo.getTodos();
  const overDuesList = await Todo.overDueTodos();
  const dueTodayList = await Todo.dueTodayTodos();
  const dueLaterList = await Todo.dueLaterTodos();

  if (request.accepts("html")) {
    response.render("index", {
      allTodos,
      overDuesList,
      dueTodayList,
      dueLaterList,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      allTodos,
      overDuesList,
      dueTodayList,
      dueLaterList,
    });
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    if (request.accepts("html")) {
      return response.redirect("/");
    } else {
      return response.json(todo);
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function async(request, response) {
  try {
    await Todo.deleteTodo(request.params.id);
    response.json({ success: true });
  } catch (error) {
    console.log(error);
    response.send(false);
  }
});

app.get("/todos", async function async(_request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE
  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
  try {
    const todo = await Todo.findAll({
      order: [["id", "ASC"]],
    });
    response.send(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
