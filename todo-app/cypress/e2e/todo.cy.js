// eslint-disable-file no-use-before-define

describe("Todo Application", () => {
  const baseUrl = "http://localhost:3000";

  // before(() => {
  //   cy.exec("npx sequelize-cli db:migrate:undo:all");
  //   cy.exec("npx sequelize-cli db:migrate");
  //   cy.exec("npx sequelize-cli db:seed:all");
  // });

  it("should load the home page", () => {
    cy.visit(baseUrl);
    cy.contains("Welcome");
  });

  it("should sign up a new user", () => {
    cy.visit(`${baseUrl}/signup`);
    cy.get('input[name="firstName"]').type("John");
    cy.get('input[name="lastName"]').type("Doe");
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('form button[type="submit"]').click();
    cy.url().should("include", "/todos");
  });

  it("should be able to logout", () => {
    cy.visit(`${baseUrl}/login`);
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('form button[type="submit"]').click();
    cy.get('button[name="signout"]').click();
    cy.url().should("include", `${baseUrl}`);
  });

  it("should be able to log in and add a todo", () => {
    cy.visit(`${baseUrl}/login`);
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('form button[type="submit"]').click();
    cy.url().should("include", "/todos");
    cy.get('input[name="title"]').type("New Todo");
    cy.get('input[name="dueDate"]').type("2024-07-10");
    cy.get('form button[type="submit"]').click();
    cy.contains("New Todo");
  });

  it("should be able to mark a todo as completed", () => {
    cy.visit(`${baseUrl}/login`);
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('form button[type="submit"]').click();
    cy.url().should("include", "/todos");
    cy.contains("New Todo").parent().find('input[type="checkbox"]').check();
  });
});
