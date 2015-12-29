exports.register = function (User, req, callback) {
	//check to see if user exists
	User.findOne( { username: req.body.username }, function (err, findUser) {
		//check if err
		if (err) { 
			console.log('error finding user: ' + err);
			callback(false);
		}
		//if user is null, create user
		if (findUser === null) {
			console.log('User does not exist, creating user model');
			console.log(req.body.password);
			var user = new User({
				username: req.body.username,
				password: req.body.password,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				location: req.body.location,
				department: req.body.department,
				admin: req.body.admin
			});
			//save new user
			user.save( function (err, savedUser) {
				//check if err
				if (err) { 
					console.log('error saving user: ' + err);
					callback(false);
				} else {
					console.log('user saved');
					//success
					callback(savedUser);
				}
			});
		} else {
			console.log('user already exists');
			//user already exists, let client know
			callback(false);
		}
	});

};

exports.login = function (User, req, jwt, db, callback) {
	User.findOne( { username: req.body.username }, function (err, findUser) {
		if (err) {
			console.log('Error findOne: ' + err);
			callback(false);
		}
		//if findUser
		if(findUser) {
			if ( findUser.password === req.body.password ) {
				console.log('User found, generating token');
				var data = {};
				data.token = jwt.sign( findUser, db.secret, { expires: 60*60*5 } );
				data.user = findUser;

				//send data back to client
				callback(data);
			}
		} else {
			//username or password incorrect, don't offer more information * security
			console.log('Username or password incorrect');
			callback(false);
		}
	});
};

exports.createChatroom = function(ChatRoom, req, callback) {
	ChatRoom.findOne( {name: req.body.name }, function (err, findChatroom) {
		if (err) {
			console.log('Error finding chatroom: ' + err);
			callback(false);
		}

		if (findChatroom === null) {
			console.log('chatroom does not exist, create chatroom');
			var chatroom = new ChatRoom({
				name: req.body.name,
				location: req.body.location,
				department: req.body.department
			});
			chatroom.save( function (err, savedChatroom) {
				if (err) { console.log('Error saving new chatroom: ' + err); callback(false); }
				callback(savedChatroom);
			});
		} else {
			console.log('Chatroom already exists');
			callback(false);
		}
	});
}

exports.createExcel = function(Excel, req, callback) {
	Excel.findOne( { name: req.body.name }, function (err, findExcel) {
		if (err) { console.log('Error finding excel: ' + err) ; }

		if ( findExcel === null ) {
			console.log('Excel does not exist, creating excel');

			var excel = new Excel({
				name: req.body.name,
				location: req.body.location,
				department: req.body.department,
				user: req.decoded_token._id,
			});
			excel.save( function (err, savedExcel) {
				if (err) { console.log('Error saving new excel: ' + err); callback(false); }

				callback(savedExcel);
			});
		} else {
			console.log('Excel already exists');
			callback(false);
		}
	});
}