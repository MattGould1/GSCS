var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    login = require('./../modules/login'),
    //models
    User = mongoose.model('User'),
    //socketio jwt
    socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.post('/login', function (req, res, next) {
	login.login(User, req, jwt, db, function (user) {
		//@param user holds logged in user information and token
		res.json(user);
	});
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

module.exports = router;