var express = require('express');
var route = express.Router();

var auth = require('../public/auth');
const jwt = require("jsonwebtoken");
const secretKey = auth.Key();

//Route to get messages sent or recieved by user
//Params, no params
//Returns all messages sent or recieved by logged in user as json or fail if token not valid
route.get('/', auth.check, function(req,res,next){
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.decode(token, secretKey);
    const user_id = decode.id;

    req.db.from("messages").select('*').where({sender_id: user_id}).orWhere({reciever_id: user_id}).then((results) => {
        res.status(400).json({
            success: false,
            results: results,
        });
        return;
    })
});

//Route to post message to particular user. 
//Param user_id of target user to send message to.
//Returns success if message was sent
route.post('/:recieverid',  auth.check, function(req,res,next){
    const message = req.body.message;
    const reciever_id = req.params.recieverid;

    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.decode(token, secretKey);
    const user_id = decode.id;

    req.db.from("users").select("id").where({id: reciever_id}).then((result) => {
        if(!result.length){
            res.status(400).json({
                success: true,
                message: "User id not found",
            });
            return;
        }else{
            req.db.from("messages").insert({message: message, sender_id: user_id, reciever_id: reciever_id}).then((message_id) => {
                res.status(200).json({
                    success: true,
                    message: "Message succesfully sent",
                });
                return;
            })
        }
    })
   
})

module.exports = route;