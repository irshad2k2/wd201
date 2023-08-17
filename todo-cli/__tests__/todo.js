/* eslint-disable indent */
/* eslint-disable no-undef */
const todoList = require("../todo");
// const { all, markAsComplete, add } = todoList();
let todos;

describe("Todo test suite", () => {
  beforeAll(() => {
    // add({ title: 'Submit assignment', dueDate: yesterday, completed: false })
    // add({ title: 'Pay rent', dueDate: today, completed: true })
    // add({ title: 'Service Vehicle', dueDate: today, completed: false })
    // add({ title: 'File taxes', dueDate: tomorrow, completed: false })
    // add({ title: 'Pay electric bill', dueDate: tomorrow, completed: false })
    todos = todoList();
  });

  test("test creating a new todo", () => {
    const listCount = todos.all.length;
    expect(todos.all.length).toBe(listCount);
    todos.add({
      title: "test title",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
    expect(todos.all.length).toBe(listCount + 1);
  });

  test("test mark todo as complete", () => {
    todos.markAsComplete(0);
    expect(todos.all[0].completed).toBe(true);
  });

  test("test retrieval of overdue items.", () => {
    for (i = 0; i < all.length; i++) {
      if (all[i].dueDate === "yesterday") {
        expect(all[i].title).toBe("Submit assignment");
      }
    }
  });

  test("test retrieval of due today items.", () => {
    for (i = 0; i < all.length; i++) {
      if (all[i].dueDate === "today") {
        expect(all[i].title).toBe("Pay rent");
        expect(all[i + 1].title).toBe("Service Vehicle");
      }
    }
  });

  test("test retrieval of due later items.", () => {
    for (i = 0; i < all.length; i++) {
      if (all[i].dueDate === "tomorrow") {
        expect(all[i].title).toBe("File taxes");
        expect(all[i + 1].title).toBe("Pay electric bill");
      }
    }
  });
});
