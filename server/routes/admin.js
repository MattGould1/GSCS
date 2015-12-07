var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    User = mongoose.model('User'),
    ChatRoom = mongoose.model('ChatRoom'),
    ChatMessage = mongoose.model('ChatMessage'),
    //socketio jwt
    socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.get('/chatroom', function (req, res, next) {
	//if (req.body.create === true) {

		 ChatRoom.findOne ( { name: 'room' }, function (err, room) {
			User.findOne( { username: 'matt' }, function (err, user) {
			


		 		var message = new ChatMessage( { _room: room._id, _user: user._id, message: 'hello people' });
		 		message.save(function(err) {});
		 		room._messages.push(message);
console.log(room);
				room.save();
		// 		console.log(user);

		 	});
		});

		 // ChatMessage.findOne( { message: 'hello people' }, function ( err, message ) {
		 // 	console.log(message);
		 // });
	// } else {
		res.json('0');
	// }
});


module.exports = router;