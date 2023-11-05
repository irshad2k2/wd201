const express = require("express");
const { user, course, chapter, page, enrollment } = require('./models')
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(session({
  secret: "secret string123456",
  resave: false,
  saveUninitialized: false
}));


app.use(flash());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("secret string"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async function(email, password, done) {
    try {
      const User = await user.findOne({ where: { email: email } });

      console.log(User);

      if (!User || !(await bcrypt.compare(password, User.password))) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      return done(null, User);
    } catch (error) {
      return done(error);
    }
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const User = await user.findOne({ where: { id: id } });
    done(null, User);
  } catch (error) {
    done(error);
  }
});


app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login", 
    failureFlash: true,
  })
);


app.get('/', async function (request, response) {
  if (request.user) {
    return response.redirect(`/home/${request.user.id}`);
  } else {
    response.render("index")
  }
});


app.get(
  "/home/:userID",
  async function (request, response) {
    const coursesData = await course.findAll();
    const enrolledCoursesArray = await enrollment.findAll({
      where: {
        user_id: request.user.id,
        status: true, // You can add additional conditions if needed
      },
      include: [{
        model: course,
        attributes: ['id', 'course_name', 'description'],
      }],
    });
    response.render("home", {courses: coursesData , enrolledCourses: enrolledCoursesArray})

  }
);

//creating user

app.get(
  "/signup",
  async function (request, response) {
    response.render("signup")
  }
);


app.post("/user", async function (request, response) {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  const { firstName, email } = request.body;
  if (!firstName || !email) {
    request.flash("error", "First Name and Email are required");
    return response.redirect("/signup");
  }
  try {
    const user_post = await user.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      role: request.body.role,
      password: hashedPwd,
    });
    response.redirect("/login")
    // request.logIn(user, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   response.redirect("/home");
    // });
  } catch (error) {
    console.log(error);
  }
});

app.get(
  "/login",
  async function (request, response) {
    response.render("login")
  }
)


///////////////////////////////////////// course //////////////////////////////////////////

app.post(
  "/course",
  async function (request, response) {
    try {
      const course_post = await course.create({
        course_name: request.body.name,
        description: request.body.description,
        instructor_id: request.user.id,
      });
      const courseID = await course_post.id;
      response.redirect(`/course/${courseID}/chapter`);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);


app.get(
  "/course/create",
  async function (request, response) {
    response.render("courseCreation")
  }
);

//my courses

app.get("/courses", async function (request, response) {
  try {
    const coursesData = await course.findAll({
      where:{
        instructor_id: request.user.id,
      }
    });
    response.render("courses", { courses: coursesData });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});


////////////////////////////////////////// chapter//////////////////////////////////////////////////

app.post(
  "/course/:courseID/chapter",
  async function (request, response) {
    const { name, description } = request.body;
    try {
      const chapter_post = await chapter.create({
        chapter_name: request.body.name,
        description: request.body.description,
        course_id: request.params.courseID
      });
      const chapterID = await chapter_post.id;
      if (request.accepts("html")) {
        return response.redirect(`chapter/${chapterID}/page`);
      } else {
        return response.json(chapter_post);
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.get(
  "/course/:courseID/chapter",
  async function (request, response) {
    const courseID = request.params.courseID
    response.render("chapterCreation", { courseID })
  }
);

//my chapters

app.get("/courses/:courseID/chapters", async function (request, response) {
  try {
    const courseID = request.params.courseID
    const chaptersData = await chapter.findAll({
      where:{
        course_id: courseID
      }
    });
    response.render("chapters", { chapters: chaptersData });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});



//////////////////////////////////////////// page ////////////////////////////////////////////
app.post(
  "/chapter/:chapterID/page",
  async function (request, response) {
    const page_post = await page.create({
      page_name: request.body.name,
      content: request.body.content,
      chapter_id: request.params.chapterID,
    });
    response.json(page_post);
  }
);

app.get(
  "/course/:courseID/chapter/:chapterID/page",
  async function (request, response) {
    const chapterID = request.params.chapterID;
    response.render("pageCreation", { chapterID })
  }
)

//////////////////////////////////////// enrollment //////////////////////////////////////

app.post(
  "/:courseID/enrollment",
  async function (request, response) {
    const courseID = request.params.courseID;    
    const Enrollment = await enrollment.create({
      status: true,
      progress: 0,
      user_id: request.user.id,
      course_id: courseID,
    });

    response.json(Enrollment)
  }
);


module.exports = app;