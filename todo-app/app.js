const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const flash = require("connect-flash");
// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.use(flash());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("secret string"));
app.use(csrf("secret_key_of_32_bits_long_12345", "[POST],[PUT],[DELETE]"));

app.use(
  session({
    secret: "my_secret_unique_key_123456",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordFiels: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "Invalid username" });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(error);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session ", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

// setting ejs view
app.set("view engine", "ejs");

// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async function (request, response) {
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/signup", async function (request, response) {
  response.render("signup", {
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async function (request, response) {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  const { firstName, email } = request.body;
  if (!firstName || !email) {
    request.flash("error", "First Name and Email are required");
    return response.redirect("/signup");
  }
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.logIn(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  },
);

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const user = request.user.id;
    const allTodos = await Todo.getTodos(user);
    const overDuesList = await Todo.overDueTodos(user);
    const dueTodayList = await Todo.dueTodayTodos(user);
    const dueLaterList = await Todo.dueLaterTodos(user);
    const completedTodosList = await Todo.completedTodos(user);

    if (request.accepts("html")) {
      response.render("todos", {
        allTodos,
        overDuesList,
        dueTodayList,
        dueLaterList,
        completedTodosList,
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
  },
);

app.post(
  "/todo",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const { title, dueDate } = request.body;
    if (!title || !dueDate) {
      request.flash("error", "Title and due date are required");
      return response.redirect("/todos");
    }
    try {
      const todo = await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      if (request.accepts("html")) {
        return response.redirect("/todos");
      } else {
        return response.json(todo);
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.put(
  "/todo/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(todo.completed);
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todo/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function async(request, response) {
    try {
      await Todo.deleteTodo(request.params.id, request.user.id);
      response.json({ success: true });
    } catch (error) {
      console.log(error);
      response.send(false);
    }
  },
);

app.get(
  "/todo",
  connectEnsureLogin.ensureLoggedIn(),
  async function async(_request, response) {
    console.log("Processing list of all Todos ...");
    try {
      const todo = await Todo.findAll({
        order: [["id", "ASC"]],
      });
      response.send(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.get(
  "/todo/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.get("/logout", (request, response, next) => {
  request.logOut((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

module.exports = app;
