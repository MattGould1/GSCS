var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'),
    http = require('http'),
    users = {},
    socketioJwt = require('socketio-jwt');

//models
var db = require('./models/db');
var User = require('./models/user');
var Chat = require('./models/chat');
//routes
var index = require('./routes/index');
var admin = require('./routes/admin');

//init model
var ChatRoom = mongoose.model('ChatRoom');

//express
var app = express();

//enable cors
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//read cookies
app.use(cookieParser());

//use routes
app.use('/', index);
app.use('/', admin);


//connect to db
mongoose.connect(db.database);

//setup io
var server = http.createServer(app);
var sio = require('socket.io')(server);

//authorize /chat and /game sio routes
sio.use(socketioJwt.authorize({
    secret: db.secret,
    handshake: true
}));

//connect to default namespace
sio.on('connection', function (socket) {




        console.log('connected');
        //disconnect socket if no username, wtf?
        if(socket.decoded_token.username == undefined) {
            socket.disconnect(true);
        }
        //store the username in socket for this client
        socket.username = socket.decoded_token.username;
        //save username in global list
        users[socket.username] = socket;


        ChatRoom.find({}, function (err, rooms) {
            rooms.forEach(function (room) {
                socket.join(room.name);
                socket.emit('rooms', room.name);
            });
        });



        // //broadcast usernames
        // chat.usernames(sio, socket, users);

        // //chat
        // chat.message(sio, socket, messages);
      //  sio.emit(socket);
        //disconnect
        socket.on('disconnect', function(data) {
            //make sure socket has username
            if(!socket.username) return;
            //delete user from global list
            delete users[socket.username];
            //broadcast new usernames
           // chat.usernames(sio, socket, users);
        });
    });

//function for testing
setInterval(function () {
  sio.emit('time', Date());
}, 5000);

//start listening
server.listen(8080, function(){
    console.log('server up');
});

module.exports = app, sio;