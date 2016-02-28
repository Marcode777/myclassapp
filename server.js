var express = require("express");
var Sequelize = require("sequelize");
var expresshandleBars = require("express-handlebars");
var bodyParser = require ("body-parser");
var sequelize = new Sequelize("myclass_db", "root"); //myclass_db still has to be created
var PORT = process.env.NODE_ENV|| 6000;
var app = express();

app.use("/static", express.static("public")); //this is for static content 

app.engine("handleBars", expresshandleBars({
  defaultLayout:"main"
}));//this sets the default layout for handlebars

app.set("view engine", "handlebars"); // this sets view engine and handlebars

app.use(bodyParser.urlencoded({
  extended:false
})); //these are options for bodyParser

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
    include: [{
      model: Student
    }]
  }).then(function(teacher){
    res.render("home", { //need to review what render's purpose is
      teacher: teacher
    })
  });
});

app.get("/student_register", function(req, res){
  res.render("student_register");
});

app.get("/instructor_register", function(req,res){
  res.render("instructor_register");
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
  if (req.body.group1 === "teacher"){
    Teacher.create(req.body).then(function(teacher){
      req.session.authenticated = teacher;
      req.redirect("/");
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

//this is for syncing sequelize and to instruct server to listen
sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log("Listening On" + PORT);
  });
});
