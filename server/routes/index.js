var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    loginController = require('./../controllers/loginController'),
    //models
    User = mongoose.model('User'),
    //socketio jwt
    socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.post('/login', function (req, res, next) {
	//find user by username in db
	User.findOne( { username: req.body.username }, function (err, user) {
		//check if err 
		if (err) { res.json( { success: false } ); }

		//check found user password against password provided
		if ( user.password === req.body.password ) {
			//log user in, send token back to client
			var data = {};
			data.token = jwt.sign( user, db.secret, { expiresInMinutes: 60*5 } );
			data.user = user;

			//send back
			res.json(data);
		} else {
			//not the right password, or no user found w/o err?
			res.json( { success: false } );
		}
	});
});

//register
router.post('/register', function (req, res, next) {
	loginController.register(User, req, jwt, next, function (success) {
		res.json(success);
	});
});

module.exports = router;