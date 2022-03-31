
var express = require('express');
var route = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../public/auth");
const secretKey = auth.Key();

//Register route to register new users.
//Param, username, password.
//Return, nothing. Add user to db. 
route.post('/register', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        res.status(400).json({
            error: true,
            message: "Request body incomplete. email and password required",
        });
        return;
    }else{

        //Check if username is already in db.
        req.db.from("users").count('id as CNT').where({username: username}).then(function(total) {
            var exists = total[0].CNT;

            if(exists > 0){
                res.status(409).json({ error: true, message: 'User already registerd' });
                return;
            }else {
                //if username is not found in db insert user into db
                const saltRounds = 10;
                const hash = bcrypt.hashSync(password, saltRounds);
                req.db.from("users").insert({username: username, password: hash}).then( function (result) {
                    res.status(200).json({ message: 'User successfully registerd' });   
                })
                return;
            }     
        })      
    }
});


//User route to allow registerd users to login.
//Params, username, password.
//Returns, JWT Token.
route.post('/login', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    var id = null;
    //Check if body is complete.
    if(!username || !password){
        res.status(400).json({
            error: true,
            message: "Request body incomplete. email and password required",
        });
        return;
    }

    //Search for user in db.
    req.db.from("users").select("*").where({username: username}).then((users) => {
        if(users.length == 1){
            const user = users[0];
            id = user.id;
            return bcrypt.compare(password, user.password);
        }
       
        //Handle bcrypt compare response.
    }).then((match) => {
        if(!match){
            res.status(401).json({
                error: true,
                message: "Bad username or password",
            });
            return;
        }else if(match){
            //If user found create jwt and respond.
            const expires_in = 60*60*24; //1 day
            const exp = Date.now() + expires_in * 1000;
            const token = jwt.sign({id, exp}, secretKey);
            res.status(200).json({
                token_type: "Bearer", token, expires_in
            });
            return;
        }
    })
});
    

module.exports = route;
