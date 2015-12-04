var path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    socketioJwt = require('socketio-jwt');

var db = require('./models/db');

//connect to db
mongoose.connect(db.database);

//create socketio server
var sio = require('socket.io')();

sio.attach(http);

//authorize /chat and /game sio routes
sio.use(socketioJwt.authorize({
    secret: db.secret,
    handshake: true
}));