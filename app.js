
var express = require('express');
var path = require('path');
__dirname = path.resolve(path.dirname(''));
//Middleware
var logger = require('morgan');

//Http 
var https = require('https');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
const fs = require('fs');

//Https
const privateKey = fs.readFileSync(__dirname + '/cert/localhost.key');
const certificate = fs.readFileSync(__dirname + '/cert/localhost.crt');

const credentials = {
 key: privateKey,
 cert: certificate
};


const normalizePort = val => {  
  var port = parseInt(val, 10);  
  if (isNaN(port)) {  
    // named pipe  
    return val;  
  }   
  if (port >= 0) {  
    // port number  
    return port;  
  }  
  return false;  
};  

var app = express();
var port = normalizePort(process.env || "433")

var httpsServer = https.createServer(credentials,  app);

app.set('port', port)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const options = require('./knexfile.js');
const knex = require('knex')(options);
app.use((req, res, next) => {
 req.db = knex
 next()
})

//Routes
var userRouter = require('./routes/user');
var jobRouter = require('./routes/job');
app.use('/user', userRouter);
app.use('/job', jobRouter);
app.get('/', function (req, res) {
    res.json("Home");
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3002)
httpsServer.listen(3005)

module.exports = app;