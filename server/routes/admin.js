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

router.post('/user/update', function (req, res, next) {
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

router.post('/user/delete', function (req, res, next) {
	User.findOne({ username: req.body.username }).remove(function (err, deleted) {
		if(err) { console.log('Error deleting user: ' + err); }
		console.log('Deleted user');
		res.json(true);
	});
});

router.post('/user/create', function (req, res, next) {
	login.register(User, req, next, function (success) {
		res.json(success);
	});
});

module.exports = router;