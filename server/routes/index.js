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
			User.update({_id: user.user._id}, { lastlogin: Date.now() }, false, function (err, hmm){
				console.log(err); console.log(hmm);
			});
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

router.get('/make-admin', function (req, res) {
	var user = new User({
		username: 'admin',
		password: 'admin',
		firstName: 'admin',
		lastName: 'admin',
		email: 'admin',
		picture: 'admin',
		status: 'admin',
		admin: true,
	});
	user.save(function (err, saved) {
		console.log(err);
		res.send('helloworld');
	});
});

module.exports = router;