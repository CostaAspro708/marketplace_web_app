var express = require('express');
var route = express.Router();

var auth = require('../public/auth');
const jwt = require("jsonwebtoken");
const secretKey = auth.Key();

//Returns all messages sent to user. 
route.get('/', function(req,res,next){
    req.db.from("messages").select('*').then((results) => {
        res.send(results)
        return;
    })
});

route.post('/',  function(req,res,next){
    const message = req.body.message;

    req.db.from("messages").insert({message: message}).then((result) => {
        res.status(200).json({
            success: true,
            message: "Message succesfully sent",
        });
    })
})

module.exports = route;