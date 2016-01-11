module.exports = {
	/*
	* @param Model User
	*/
	update: function(sio, socket, User) {
		/*
		* @param Object profile: profile.username, firstname and lastname
		*/
		socket.on('update-profile', function (profile) {
			User.findOne({ _id: socket.decoded_token._id}, function (err, user) {
				if (err) { console.log('Error finding user while trying to update' + err); }
				if (user.username != profile.username) {
					//usernames are not allowed to be changed
					console.log(user);
					console.log(profile);
					socket.emit('update-profile', false);
				}

				user.firstName = profile.firstName;
				user.lastName = profile.lastName;
				user.save(function (err, saved) {
					if (err) { console.log(err); }
					console.log(saved);
					socket.emit('update-profile', saved);
				});
			});
		});
	},
	online: function (sio, socket, User, user) {
		/*
		*
		*/
		socket.on('update-online', function (status) {

		});
	}
};