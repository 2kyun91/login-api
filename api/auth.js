var express = require("express");
var router = express.Router();
var User = require("../models/user");
var util = require("../util");
var jwt = require("jsonwebtoken");

// [!!!] 토큰을 발급하기 위해서는 밑에 코드처럼 노드 변수를 반드시 설정해줘야 한다.
process.env["JWT_SECRET"] = 'e177920e88165bd0090b1c6b544cf7';

// Login
router.post("/login", function(req, res, next) {
  var isValid = true;
  var validationError = {
    name : "ValidationError",
    errors : {}
  };

  if(!req.body.username) {
    isValid = false;
    validationError.errors.username = {message : "사용자명은 필수항목!"};
  }

  if(!req.body.password) {
    isValid = false;
    validationError.errors.password = {message : "비밀번호는 필수항목!"};
  }

  if(!isValid) {
    return res.json(util.successFalse(validationError));
  } else {
    next();
  }
}, function(req, res, next) {
  User.findOne({username : req.body.username}).select({password : 1, username : 1, name : 1, email : 1}).exec(function(err, user) {
    if (err) {
      return res.json(util.successFalse(err));
    } else if (!user || !user.authenticate(req.body.password)) {
      return res.json(util.successFalse(null, "사용자명 또는 비밀번호가 맞지 않습니다."));
    } else {
      var payload = {
        _id : user._id,
        username : user.username
      };
      var secretOrPrivateKey = process.env.JWT_SECRET;
      var options = {expiresIn : 60 * 60 * 24};
      /*
      아이디와 비밀번호가 일치함을 확인하 후에 jwt.sign 함수를 통해 token을 생성하여 return한다.
      jwt.sign 함수는 4개의 파라미터를 전달받는다.

      - payload : token에 저장될 정보이다. 로그인용으로 사용되는 경우 DB에서 유저를 특정할 수 있는 간결한 정보를 담고 개인정보는 저장해선 안된다.

      - secretOrPrivateKey : hash 생성에 사용되는 key 문자열이다. 해독시 같은 문자열을 사용해야 해독할 수 있다.

      - options : hash 생성 알고리즘, token 유효기간등을 설정할 수 있는 options이다. 위의 설정은 24시간이 지나면 토큰이 무효가 되도록 했다.

      - 콜백함수 : token 생성 후 실행되는 함수이다.
      */
      jwt.sign(payload, secretOrPrivateKey, options, function(err, token) {
        if(err) {
          return res.json(util.successFalse(err));
        }
        res.json(util.successTrue(token));
      });
    }
  });
});

// MyAccount
/*
token을 해독해서 DB에서 user 정보를 return하는 API이다.
*/
router.get("/me", util.isLoggedin, function(req, res, next) {
  User.findById(req.decoded._id).exec(function(err, user) {
    if(err || !user) {
      return res.json(util.successFalse(err));
    }
    res.json(util.successTrue(user));
  });
});

// Refresh
/*
token의 유효기간이 끝나기전에 새로운 토큰을 발행하는 API이다.
*/
router.get("/refresh", util.isLoggedin, function(req, res, next) {
  User.findById(req.decoded._id).exec(function(err, user) {
    if(err || !user) {
      return res.json(util.successFalse(err));
    } else {
      var payload = {
        _id : user._id,
        username : user.username
      };

      var secretOrPrivateKey = process.env.JWT_SECRET;
      var options = {expiresIn : 60 * 60 * 24};

      jwt.sign(payload, secretOrPrivateKey, options, function(err, token) {
        if(err) {
          return res.json(util.successFalse(err));
        }
        res.json(util.successTrue(token));
      });
    }
  });
});

module.exports = router;
