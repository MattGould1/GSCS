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
var user = require('./models/user');
var chat = require('./models/chat');
var excel = require('./models/excel');
//routes
var index = require('./routes/index');
var admin = require('./routes/admin');

//init model
var ChatRoom = mongoose.model('ChatRoom');
var ChatMessage = mongoose.model('ChatMessage');
var Excel = mongoose.model('Excel');

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
//admin check for jwt, end response if no
app.use('/admin', function (req, res, next) {
    if(!req.body.token) {
        res.json(false);
    } else {
        jwt.verify(req.body.token, db.secret, function (err, decoded) {
            if (err) { 
                console.log('Invalid token: ' + err);
                res.json(false);
            } else {
                req.decoded_token = decoded;
                next();
            }
        });
    }
});
app.use('/admin', admin);


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

//socketio handlers
var chat = require('./handlers/chat');
var excel = require('./handlers/excel');
//connect to default namespace
sio.on('connection', function (socket) {

        //disconnect socket if no username, wtf?
        if(socket.decoded_token.username == undefined) {
            socket.disconnect(true);
        }
        //store the username in socket for this client
        socket.username = socket.decoded_token.username;

        //save username in global list
        users[socket.username] = socket.decoded_token;
        
        //connection data
        ChatRoom.find({}).populate('_messages').exec(function (err, chatrooms) {
            if (err) { console.log('socketio error finding chatrooms' + err); socket.emit('data', false); return false; }
            Excel.find({}).populate('user').exec(function (err, excelsheets) {
                if (err) { console.log('socketio error finding excelsheets' + err); socket.emit('data', false); return false; }
                
                //emit data
                var data = {
                    chatrooms: chatrooms,
                    excelsheets: excelsheets,
                    user: socket.decoded_token
                };
                socket.emit('data', data);

            });
        });

        //handle messages
        chat.message(sio, socket, ChatRoom, ChatMessage);

        //broadcast usernames
        chat.userList(sio, socket, users);

        //handle edit request
        excel.edit(sio, socket, Excel);
        excel.update(sio, socket, Excel);
        
        //handle disconnect event
        socket.on('disconnect', function(data) {
            //make sure socket has username
            if(!socket.username) return;
            //delete user from global list
            delete users[socket.username];
            //broadcast new usernames
            chat.userList(sio, socket, users);
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