var jwt = require("jsonwebtoken");
var util = {};

/*
API success json을 만드는 함수이다.
API가 return하는 json의 형태를 통일시키기 위해 이 함수를 통해 json Object를 만들고 이를 return한다.
*/
util.successTrue = function(data) {
  return {
    success : true,
    message : null,
    errors : null,
    data : data
  };
};

/*
API fail json을 만드는 함수이다.
error object나 message를 받아서 error json을 만들어 json의 형태를 통일시킨다.
*/
util.successFalse = function(err, message) {
  if(!err && !message) {
    message = "데이터를 찾지 못했습니다.";
  }
  return {
    success : false,
    message : message,
    errors : (err) ? util.parseError(err) : null,
    data : null
  };
};

/*
mongoose를 통해 resource를 조작하는 과정에서 발생하는 에러를 일정한 형태로 만들어 주는 함수이다.
조작 중 validation 에러 또는 DB 에러 등 형태가 다르기 때문에 통일시켜 주는 함수이다.
*/
util.parseError = function(errors) {
  var parsed = {};
  if(errors.name == "ValidationError") {
    for(var name in errors.errors) {
      var validationError = errors.errors[name];
    }
  } else if(errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
    parsed.username = {message : "중복된 사용자명입니다!"};
  } else {
    parsed.unhandled = errors;
  }
  return parsed;
};

// middlewares
/*
토큰이 있는 경우 jwt.verify 함수를 이용해서 토큰 hash를 확인하고 토큰에 들어있는 정보를 해독한다.
해독한 정보는 req.decoded에 저장하고 있으며 이후 로그인 유무는 decoded가 있는지 없는지를 통해 알 수 있다.
*/
util.isLoggedin = function(req, res, next) {
  var token = req.headers["x-access-token"];
  if(!token) {
    return res.json(util.successFalse(null, "토큰이 없습니다!"));
  } else {
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if(err) {
        return res.json(util.successFalse(err));
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = util;
