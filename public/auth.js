const jwt = require("jsonwebtoken");
const secretKey = "secret key";

function check(req, res, next){
    const authHeader = req.headers.authorization;
    let token = null;

    //Check for "Bearer" and Token.
    if(authHeader.split(" ")[0] == "Bearer" && authHeader.split(" ").length == 2){
        token = authHeader.split(" ")[1];
        try {
            const decode = jwt.decode(token, secretKey);
            if(decode.exp < Date.now()){
                res.status(401).json({
                    error: true,
                    message: "JWT has expired",
                  })
                  return;
            }
            //Permit user to advance to route.
            next()
        } catch (error) {
            res.status(401).json({
                error: true,
                message: "Authorization header is malformed",
              })
              return;
        }
    }else{
        res.status(401).json({
            error: true,
            message: "Authorization header ('Bearer token') not found",
          })
          return;
    }
    //
    return;
}

module.exports = { check };