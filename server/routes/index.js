var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    login = require('./../modules/login'),
    //models
    User = mongoose.model('User'),
    ChatRoom = mongoose.model('ChatRoom');
    // //socketio jwt
    // socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.post('/login', function (req, res, next) {
	var user, chatrooms;
	login.login(User, req, jwt, db, function (user) {
		//@param user holds logged in user information and token
		user = user;
	});
	jwt.verify(req.body.token, db.secret, function (err, decoded) {
		ChatRoom.find({}, function (err, rooms) {
			chatrooms = rooms;
		});
	});

	res.json( { user: user, chat: rooms } );
});

//register
router.post('/register', function (req, res, next) {
	/*
	* @param User mongoose model
	* @param req express request holds POST data
	* @function success Boolean
	*/
	login.register(User, req, next, function (success) {
		res.json(success);
	});
});

//chatrooms
router.post('/chatrooms', function (req, res, next) {

});
module.exports = router;