var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'),
    http = require('http'),
    users = {},
    cUser,
    fs = require('fs'),
    socketioJwt = require('socketio-jwt');

//models
var db = require('./models/db');
var user = require('./models/user');
var chat = require('./models/chat');
var excel = require('./models/excel');
var locdep = require('./models/locdep');
var word = require('./models/word');

//routes
var index = require('./routes/index');
var admin = require('./routes/admin');

//init model
var ChatRoom = mongoose.model('ChatRoom');
var ChatMessage = mongoose.model('ChatMessage');
var Excel = mongoose.model('Excel');
var Revision = mongoose.model('Revision');
var Locations = mongoose.model('Locations');
var Departments = mongoose.model('Departments');
var User = mongoose.model('User');
var Word = mongoose.model('Word');

//express
var app = express();

//helpers
var imageupload = require('./modules/imageupload');
//enable cors
app.all('*', function(req, res, next) {
// header('Content-Type: application/json;charset=UTF-8');
// header('Access-Control-Allow-Origin': '*');
// header('Access-Control-Allow-Methods: DELETE, HEAD, GET, OPTIONS, POST, PUT');
// header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
// header('Access-Control-Max-Age: 1728000');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//read cookies
app.use(cookieParser());
app.use("/public", express.static(__dirname + '/public'));
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
var startup = require('./handlers/startup');
var chat = require('./handlers/chat');
var excel = require('./handlers/excel');
var user = require('./handlers/user');
var word = require('./handlers/word');
//connect to default namespace
sio.on('connection', function (socket) {
    //disconnect socket if no username, wtf?
    if(socket.decoded_token.username == undefined || socket.decoded_token._id == undefined) {
        socket.disconnect(true);
    }

    //find the current user, do this so the location/department is always up to date it's only one extra query so its not a huge overhead
    User.findOne({_id: socket.decoded_token._id}, function (err, cUser) {
        if (err) { console.log(err); socket.disconnect(true); }
        //check to see if current user is undefined == not found
        if (cUser) {
            //store the username in socket for this client
            socket.username = cUser.username;

            //save user in global list
            users[socket.decoded_token._id] = cUser;

            //join my own room
            socket.join(cUser._id);
            startup.init(cUser, ChatRoom, Excel, ChatMessage, User, Word, socket);
            //broadcast usernames
            chat.userList(sio, socket, users);
        } else {
            //error handling
            socket.disconnect(true);
        }
    });

    //handle messages
    chat.message(sio, socket, ChatRoom, ChatMessage, users, imageupload.saveImage, fs, path);
    chat.privatechat(sio, socket, ChatMessage, users);
    chat.getPrivateMessages(sio, socket, ChatMessage);
    chat.readPrivateMessages(sio, socket, ChatMessage);
    chat.loadmoremessages(sio, socket, ChatRoom, ChatMessage);
    
    //user handler
    user.update(sio, socket, User);
    user.lastactive(sio, socket);
    user.nowactive(sio, socket);
    user.onlinestatus(sio, socket, User);

    //handle edit request
    excel.edit(sio, socket, Excel);
    excel.update(sio, socket, Excel, Revision);
    excel.cancel(sio, socket, Excel);

    //handle word
    word.edit(sio, socket, Word);
    word.update(sio, socket, Word);
    word.cancel(sio, socket, Word);

    //handle disconnect event
    socket.on('disconnect', function (data) {
        //make sure socket has username
        if(!socket.username) return;

        cUser = users[socket.decoded_token._id];

        console.log('dc');
        if (!cUser) {
            return;
        }

        //cleanup excels
        Excel.find({}).select('active user').where('active', true).where('user', cUser._id).exec(function (err, excelsheets) {
            if (err) { console.log('socketio error finding excelsheets' + err); socket.emit('data', false); return false; }
            excelsheets.forEach( function (excelsheet, i) {
                excelsheet.active = false;
                excelsheet.save(function (err, success){
                    if (err) { console.log('error reseting excelsheet' + err); }
                    sio.sockets.to(success._id).emit('cancel-excel', success);
                });
            });
        });
        Word.find({}).select('active user').where('active', true).where('user', cUser._id).exec(function (err, words) {
            if (err) { console.log('socketio error setting active to false on word documents' + err); return false}
            words.forEach( function (word, i) {
                word.active = false;
                word.save(function (err, success) {
                    if (err) { console.log('socketio error saving active on disconnect' + err); }
                    sio.sockets.to(success._id).emit('cancelword', success);
                });
            });
        });
        //broadcast the person who left
        sio.sockets.emit('leave', users[socket.decoded_token._id]);
        //delete user from global
        users[socket.decoded_token._id] = null;
        delete users[socket.decoded_token._id];
        //broadcast new usernames
        chat.userList(sio, socket, users);


    });
});

//function for testing
setInterval(function () {
  console.log('MEMORY:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
}, 5000);

//start listening
server.listen(8080, function(){
    console.log('server up');
});

module.exports = app, sio;