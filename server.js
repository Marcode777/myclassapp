var express = require("express");
var bodyParser = require ("body-parser");
var expresshandleBars = require("express-handlebars");
var expressSession = require("express-session");
var Sequelize = require("sequelize");
var passport = require ("passport");
var LocalStrategy = require("passport-local") // we need a strategy for passport
// var bcryptjs = require ("bcryptjs");
var sequelize = new Sequelize("myclass_db", "root"); //myclass_db still has to be created
var PORT = process.env.NODE_ENV|| 7000; // other ports work, with the exception, port 6000
// var app = express();

var app = express();
// app.use(require('serve-static')(__dirname + '/../../public'));
// app.use(require('cookie-parser')());
// app.use(require('body-parser').urlencoded({ extended: true }));
// app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/static", express.static("public")); //this is for static content 

app.engine("handlebars", expresshandleBars({ //handlebars has to be lowercase somehow
  defaultLayout:"main"
}));//this sets the default layout for handlebars

app.set("view engine", "handlebars"); // this sets view engine and handlebars


app.use(bodyParser.urlencoded({
  extended:false
})); //these are options for bodyParser

var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(expressSession({
  secret: "secrets",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

var Class = sequelize.define("class", {
  studentId: {
    type: Sequelize.INTEGER
  },
  teachingAssistantId: {
    type: Sequelize.INTEGER
  }
})

var TeachingAssistant = sequelize.define("teaching_assistant", {//what does define do again?
  firstname: {
    type: Sequelize.STRING, 
    allowNull: false,
    validate: {
      is: ["^[a-z]+$","i"]
    }
  },

  lastname:{
    type: Sequelize.STRING,
    allowNull: false,
    vaildate:{
      is:["^[a-z]+$","i"]
    }
  },
  email:{
    type: Sequelize.STRING,
    allowNUll:false
  },
  password:{
    type: Sequelize.STRING,
    allowNull:false
  }
});

var Teacher = sequelize.define("teacher", {
  firstname : {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: ["^[a-z]+$", "i"]
    }
  },
  lastname : {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is :["^[a-z]+$", "i"]
    }
  },
  email:{
    type: Sequelize.STRING,
    allowNull: false
  },
  password:{
    type: Sequelize.STRING,
    allowNull: false
  }
});

var Student = sequelize.define("student", {
  firstname:{
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: ["^[a-z]+$", "i"]
    }
  },
  lastname:{
    type: Sequelize.STRING,
    allowNull: false,
    validate:{
      is:["^[a-z]+$", "i"]
    }
  },
  email:{
    type: Sequelize.STRING,
    allowNull: false
  },
  password:{
    type: Sequelize.STRING,
    allowNull:false
  }
});

// nate says hi! let's do passport stuff
// app.use(passport.initialize());
// app.use(passport.session());



// passport.use('login', new LocalStrategy.Strategy({
//     usernameField: 'email', // allows username to be called email
//     passwordField: 'password'
//   },
//   function(username, password, done) {
//     console.log("hihihhi");
//     console.log(username);
//     console.log(password);
//     Teacher.findOne({ username: username }, function (user) {
//       console.log("WHAT AM I?" + user);
//       if (!user) {
//         console.log("stuck here? p2")
//         return done(null, false, { message: 'Incorrect username.' });
//       }

//       if (!user.validPassword(password)) {
//         console.log("stuck here? p3")
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

passport.use('login', new LocalStrategy(
  function(username, password, done) {
    console.log("do the find");
    console.log(username);
    console.log(password);
    Teacher.find({email: username})
    .then(function (user){
      console.log("after teh findOne");
      console.log("returns: " + user.dataValues.email);
      console.log("returns: " +user.dataValues.password);
        if (!user) {
        console.log("No user");
        return done(null, false); }
      if (!user.dataValues.password === password) {
          console.log("Password does not match");
        return done(null, false);
      }
      console.log("we got a match!!!!");
      return done(null, user);
    })
}))

// passport.use('local', new LocalStrategy(
//   function(username, password, done) {
//     console.log("Passport ran");
//     Teacher.findOne({ email: username }, function (err, user) {
//       if (err) {
//         console.log("There was an error");
//         console.log(err);
//         return done(err);
//       }
//       if (!user) {
//         console.log("No user");
//         return done(null, false); }
//       if (!user.verifyPassword(password)) {
//           console.log("Password does not match");
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   }
// ));

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       if (!user.verifyPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   Teacher.findById(id, function(err, user) {
//     done(err, user);
//   });
// });
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Teacher.findById(id, function (err, user) {
    done(err, user);
  });
});

// end of nate's message

//this is for defining relations between tables
TeachingAssistant.belongsToMany(Student,{
  through: "class"
});
Student.belongsToMany(TeachingAssistant,{
  through: "class"
});
Teacher.hasMany(Student);

//routing
app.get("/", function (req, res){
  Teacher.findAll({
    // include: [{
    //   del: Student
    // }]
  }).then(function(teacher){
    res.render("home", { //need to review what render's purpose is
      teacher: teacher
    })
  });
});

app.get("/student_register", function(req, res){
  res.render("student_registration");
});

app.get("/instructor_register", function(req,res){
  res.render("instructor_registration");
});

app.get("/login", function(req, res){
  res.render("login");
});

//for posting
app.post("/registerstudent", function(req, res){
  Student.create(req.body).then(function(student){
    req.session.authenticated = student;
    res.redirect("/");
  }).catch(function(err){
    res.redirect("/msg=" + err.message);
  });
});

app.post("/registerInstructor", function(req, res){
  console.log(req.body);
  console.log("do we have sessions?" + req.session)
  if (req.body.group1 === "teacher"){
    Teacher.create(req.body).then(function(teacher){
      // req.session.authenticated = teacher;
      res.redirect("/");
    }).catch(function(err){
      res.redirect("/msg=" + err.message);
    });
  } else{
    TeachingAssistant.create(req.body).then(function(teaching_assistant){
      req.session.authenticated = teaching_assistant;
      req.redirect("/");
    }).catch(function(err){
      res.redirect("/msg=" + err.message);
    });
  }
});

// nate says hi! let's build a post route to log-in
app.post("/login", passport.authenticate('login', {  
  successRedirect: '/success',
  failureRedirect: '/loginfailure' 
}));

// app.post('/login', passport.authenticate('local'),
//   function(req, res) {
//     console.log("this ran");
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/');
//   });

// app.get('/login', passport.authenticate('login', { failureRedirect: '/failure' }),
//   function(req, res) {
//     console.log("this ran");
//     res.redirect('/');
//   });

//this is for syncing sequelize and to instruct server to listen
sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log("Listening On" + PORT);
  });
});
