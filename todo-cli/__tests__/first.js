/* eslint-disable indent */
/* eslint-disable no-undef */
const todoList = require("../todo");
const { all, markAsComplete, add } = todoList();

describe("Todo test suite", () => {
  beforeAll(() => {
    add({
      title: "test title",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
  });

  test("first test", () => {
    const listCount = all.length;
    expect(all.length).toBe(listCount);
    add({
      title: "test title",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
    expect(all.length).toBe(listCount + 1);
  });

  test("test mark as complete", () => {
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
});
