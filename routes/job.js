var express = require('express');
var route = express.Router();

var auth = require('../public/auth');
const jwt = require("jsonwebtoken");
const secretKey = auth.Key();

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

    //Verify it is users job post.
    let token = req.headers.authorization.split(" ")[1];
    const decode = jwt.decode(token, secretKey);
    let user_id = decode.id;

    console.log(id);
    req.db.from("jobs").update({title: title, desc: description, location: location}).where({id: id, active: 1, user_id: user_id}).then((result) => {
       
        if(!result){
            res.status(401).json({
                message: "Job is inactive",
            });
            return
        }
        res.status(200).json({
            title: title,
            description: description,
            location: location,
        });
        return;
    })
});

//Route to delete job with id.
//Params, Job id to be deleted.
//Returns  success.
route.put('/delete/:id', function(req,res,next){
    const id = req.params.id;

    //Verify it is users job post. 
    let token = req.headers.authorization.split(" ")[1];
    const decode = jwt.decode(token, secretKey);
    let user_id = decode.id;

    req.db.from("jobs").update({active: 0}).where({id: id, user_id: user_id}).then((result) => {
        
        if(!result){
            res.status(401).json({
                success: false,
                message: "Job is inactive",
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Job successfully deleted.",
        });
        return;
    })
});

//Route to return users current active jobs.
//Param, authenticated user
//Returns, success and json array.
route.get('/me', function(req,res,next){
    //Get user from token. 
    let token = req.headers.authorization.split(" ")[1];
    const decode = jwt.decode(token, secretKey);
    let user_id = decode.id;

    req.db.from("jobs").select("*").where({user_id: user_id, active: 1}).then((result) => {
        if(!result){
            res.status(400).json({
                success: false,
                message: "No active jobs were found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            results: result,
        });
        return;
    })
});
module.exports = route;