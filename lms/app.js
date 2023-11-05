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
const { request } = require("http");

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

function requireEducator(req, res, next) {
  if (req.user && req.user.role === 'educator') {
    return next();
  } else {
    res.status(401).json({ message: 'Unauthorized user.' });
  }
}

// function requireEnrollment(req, res, next) {
//   const enrolled = enrollment.findOne({
//     where: {
//       user_id: req.user.id,
//       status: true,
//     }
//   });
//   if (enrolled){
//     return next();
//   } else {
//     res.status(401).json({ message: 'Unauthorized user.' });
//   }
// }

async function checkEnrollment(req, res, next) {
  const courseID = req.params.courseID;
  const userID = req.user.id;

  // Check if the user is enrolled in the specific chapter's course
  const enrollmentRecord = await enrollment.findOne({
    where: {
      user_id: userID,
      course_id: courseID,
      status: true,
    },
  });

  const courseOwner = await course.findOne({
    where: {
      instructor_id: userID
    }
  });

  if (enrollmentRecord || courseOwner) {
    return next();
  } else {
    res.status(403).send("You are not enrolled in this course.");
  }
}


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

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/"); // Redirect the user to the login page after logout
  });
});



app.get('/', async function (request, response) {
  if (request.user) {
    if (request.user.role == "educator") {
      return response.redirect(`/homeEducator`);
    }
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
        status: true, 
      },
      include: [{
        model: course,
        attributes: ['id', 'course_name', 'description'],
      }],
    });
    response.render("home", {courses: coursesData , enrolledCourses: enrolledCoursesArray})
  }
);

app.get(
  "/homeEducator",
  async function (request, response) {
    const coursesData = await course.findAll();
    const enrolledCoursesArray = await enrollment.findAll({
      where: {
        user_id: request.user.id,
        status: true, 
      },
      include: [{
        model: course,
        attributes: ['id', 'course_name', 'description'],
      }],
    });
    response.render("homeEducator", {courses: coursesData , enrolledCourses: enrolledCoursesArray})
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
  try {
    const user_post = await user.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      role: request.body.role,
      password: hashedPwd,
    });
    request.logIn(user_post, (err) => {
      if (err) {
        console.log(err);
      }
      return response.redirect("/");
    });
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
  "/course/create", requireEducator,
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
    response.redirect("/homeEducator");
  }
);

app.get(
  "/course/:courseID/chapter/:chapterID/page",
  async function (request, response) {
    const chapterID = request.params.chapterID;
    response.render("pageCreation", { chapterID })
  }
);

//my pages


app.get("/course/:courseID/chapter/:chapterID/pages", checkEnrollment,
 async function (request, response) {
  try {
    const chapterID = request.params.chapterID
    const pageData = await page.findAll({
      where:{
        chapter_id: chapterID
      }
    });
    response.render("pages", { pages: pageData });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

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

    response.redirect("/")
  }
);

//mark page as complete
module.exports = app;