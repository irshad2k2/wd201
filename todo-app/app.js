const express = require("express");
// eslint-disable-next-line no-unused-vars
const todo = require("./models/todo");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// eslint-disable-next-line no-unused-vars
app.get("/todos", (request, response) => {
  console.log("Todo List");
});

app.post("/todos", async (request, responce) => {
  try {
    console.log("Creating a new todo ", request.body);
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return responce.json(todo);
  } catch (error) {
    console.log(error);
    return responce.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  try {
    console.log("We have to update a todo with ID:", request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    const updatedTodo = await todo.markAsCompleted();
    response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", (request, response) => {
  console.log("Delete a todo by ID: ", request.params.id);
});

module.exports = app;
