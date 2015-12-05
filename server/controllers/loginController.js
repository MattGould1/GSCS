exports.register = function (User, req, jwt, next, callback) {

	//check to see if user exists
	User.findOne( { username: req.body.username }, function (err, findUser) {
		//check if err
		if (err) { 
			console.log('error finding user: ' + err);
			callback(false); 
			next();
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
			user.save( function (err) {
				//check if err
				if (err) { 
					console.log('error saving user: ' + err);
					callback(false); next(); 
				} else {
					console.log('user saved');
					//success
					callback(true);
					next();
				}
			});
		} else {
			console.log('user already exists');
			//user already exists, let client know
			callback(false);
			next();
		}
	});

};