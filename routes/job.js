var express = require('express');
var route = express.Router();

var auth = require('../public/auth');
const jwt = require("jsonwebtoken");
const secretKey = "secret key";

//Route to post a new job.
//Param, title, description, location.
//Returns, Success if successful or error. and job added to db.
route.post('/', auth.check, function(req, res, next){
    //required fields.
    const title = req.body.title;
    const description = req.body.desc;
    const location = req.body.location;
    
    const active = 1;
    //Parse token.
    token = req.headers.authorization.split(" ")[1];
    const decode = jwt.decode(token, secretKey);

    //Check required fields in body.
    if(!title || !description || !location){
        res.status(400).json({
            error: true,
            message: "Request body incomplete. title, desc and location required",
        });
        return;
    }
    //Add to db.
    req.db.from("jobs").insert({title: title, desc: description, location: location, user_id: decode.id, active: active}).then((result) => {
        res.status(200).json({
            message: "Job succesfully posted",
        });
        return;
    }) 
})

//Route to return list of active jobs. 
//Param, no params.
//Returns, list of jobs. 
route.get('/', function(req,res,next){
        req.db.from("jobs").select("*").where({active: 1}).then((result) => {
            res.status(200).json({
                result: result,
            });
        });
});

//Route to update existing job.
//Param, id of job. Body, title, desc, location.
//Returns updated job in json. 
route.put('/update/:id', function(req,res,next){
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.desc;
    const location = req.body.location; 
    //TODO ADD VERIFY USR ID.
    console.log(id);
    req.db.from("jobs").update({title: title, desc: description, location: location}).where({id: id, active: 1}).then((result) => {
        res.status(200).json({
            title: title,
            description: description,
            location: location,
        });
    })
});

//Route to delete job with id. 

route.put('/delete/:id', function(req,res,next){
    const id = req.params.id;
    //TODO VERIFY USR ID.
    req.db.from("jobs").update({active: 0}).then((result) => {
        res.status(200).json({
            message: "Job successfully deleted.",
        });
    })

});

module.exports = route;