var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    User = mongoose.model('User'),
    ChatRoom = mongoose.model('ChatRoom'),
    //socketio jwt
    socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.post('/', function (req, res, next) {
	//build chatroom query, get chat room + messages 
	ChatRoom.find({})
			.populate('_messages')
			.exec(function (err, rooms) {

		if(err) { console.log('error finding rooms: ' + err); }
		//rooms holds chat rooms + chat messages for each chatroom

		//get users now
		User.find({})
			.populate('_messages')
			.exec(function (err, users) {

			if(err) { console.log('error finding users: ' + err); }

			//users hold users + chat messages for each user

			res.json({ chat: rooms, users: users });
		});
	});
});

router.post('/user', function (req, res, next) {

});

router.post('/user/{name}', function (req, res, next) {

});

router.post('/user/{name}/delete', function (req, res, next) {
	
});
module.exports = router;