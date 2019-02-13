var express = require("express");
var app = express();
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// DB setting
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_DB_LOGIN_API, {userMongoClient : true});

var db = mongoose.connection;
db.once("open", function() {
  console.log("DB connected");
});
db.on("error", function(err) {
  console.log("DB Error : ", err);
});

// Middlewares
/*
CORS에 x-access-token이 추가되었다.
jwt로 생성된 토큰은 header의 x-access-token 항목을 통해 전달된다.
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
  next();
});

// API
// Route으로 users와 auth를 등록한다.
app.use("/api/users", require("./api/users"));
app.use("/api/auth", require("./api/auth"));

// Server
var port = 3000;
app.listen(port, function() {
  console.log("listening on port : " + port);
});
