var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    User = mongoose.model('User'),
    ChatRoom = mongoose.model('ChatRoom'),
	login = require('./../modules/login'),
    //socketio jwt
    socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.post('/', function (req, res) {
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

router.post('/user/update', function (req, res) {
	User.findOne({username: req.body.username} , function (err, user) {
		if (err) { console.log('Error finding user: ' + err); }
		console.log('updating user model...');
		user.password = req.body.password;
		user.firstName = req.body.firstName;
		user.lastName = req.body.lastName;
		user.email = req.body.username;
		user.location = req.body.location;
		user.department = req.body.department;
		user.status = req.body.status;

		user.save( function (err, saved) {
			if (err) { console.log('Error saving user: ' + err); }
			console.log('saved user model');
			res.json(true);
		});
	});
});

router.post('/user/delete', function (req, res) {
	User.findOne({ username: req.body.username }).remove(function (err, deleted) {
		if(err) { console.log('Error deleting user: ' + err); }
		console.log('Deleted user');
		res.json(true);
	});
});

router.post('/user/create', function (req, res) {
	login.register(User, req, function (success) {
		res.json(success);
	});
});

router.post('/chat/update', function (req, res) {
	ChatRoom.findOne({ name: req.body.name }, function (err, chatroom) {
		if (err) { console.log('Error finding chatroom: ' + err); }
		console.log(req.body);
		console.log('updating chatroom');
		chatroom.name = req.body.name;
		chatroom.location = req.body.location;
		chatroom.department = req.body.department;

		chatroom.save( function (err, saved) {
			if (err) { console.log('Error saving chatroom: ' + err); }
			console.log('chatroom saved');
			res.json(true);
		});
	});
});

router.post('/chat/delete', function (req, res) {
	ChatRoom.findOne({ name: req.body.name}).remove(function (err, deleted) {
		if (err) { console.log('Error deleting chatroom: ' + err) }
		console.log('Chatroom deleted');
		res.json(true);
	});
});

router.post('/chat/create', function (req, res) {
	login.createChatroom(ChatRoom, req, function (success) {
		res.json(success);
	});
});
module.exports = router;