var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    //models
    User = mongoose.model('User'),
    login = require('./../modules/login'),
    ChatRoom = mongoose.model('ChatRoom');

//db
var db = require('./../models/db');

//login
router.post('/login', function (req, res, next) {
	login.login(User, req, jwt, db, function (user) {
		//if user true, send back token
		if (user) {
			res.json( user );
		} else {
		//else report failure to client
			res.json ( false );
		}
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

//chatrooms
router.post('/chatrooms', function (req, res, next) {

});
module.exports = router;