var express = require("express");
var Sequelize = require("sequelize");
var handleBars = require("express-handlebars");
var bodyParser = require ("body-parser");
var sequelize = new Sequelize("myclass_db", "root"); //myclass_db still has to be created
var PORT = process.env.NODE_ENV|| 6000;
var app = express();

app.use("/static", express.static("public")); //this is for static content 

app.engine("handleBars", "express-handlebars"({
  defaultLayout:"main"
});//this sets the default layout for handlebars

app.set("view engine", "handlebars"); // this sets view engine and handlebars

app.use(bodyParser.urlencoded({
  extended:false
}); //these are options for bodyParser


