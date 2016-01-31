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
				user.status = profile.status;
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
	},
	onlinestatus: function (sio, socket, User) {
		socket.on('onlinestatus', function (status) {
			User.findOne({ _id: status._id }, function (err, user) {
				if (err) { console.log(err); return false; }
				oldstatus = user.online;
				user.online = status.status;
				user.save();
				user.oldstatus = oldstatus;

				sio.sockets.emit('updatestatus', { user: user, old: oldstatus});
			});
		});
	},
	lastActive: function (sio, socket, User) {

	}
};