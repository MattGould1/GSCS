module.exports = {
	/*
	* @param Model User
	*/
	update: function(sio, socket, User, saveImage, fs, path) {
		/*
		* @param Object profile
		* profile.firstname
		* profile.lastname
		* profile.status
		* profile.sounds bool
		*/
		socket.on('update-profile', function (profile) {
			User.findOne({ _id: socket.decoded_token._id}, function (err, user) {
				if (err) { console.log('Error finding user while trying to update' + err); }
				if (user.username != profile.username) {
					//usernames are not allowed to be changed
					console.log(user);
					console.log(profile);
					socket.emit('update-profile', false);
					return;
				}
				user.firstName = profile.firstName;
				user.lastName = profile.lastName;
				user.status = profile.status;
				user.options.sounds = profile.sounds;
				if (profile.avatar.type === 'image/png' || profile.avatar.type === 'image/jpeg') {
					var buffer = saveImage(profile.avatar.data);
					var filename = path.join(__dirname, '../public/' + Math.floor(new Date() / 1000) + profile.avatar.name);
					var filepath = '/public/' + Math.floor(new Date() / 1000) + profile.avatar.name;

					//for concurrency, save the thumbnail regardless of image size
					if (profile.avatar.thumbnail) {
						var tbuffer = saveImage(profile.avatar.thumbnail);
					} else {
						var tbuffer = saveImage(profile.avatar.data);
					}

					var thumbnail = path.join(__dirname, '../public/' + Math.floor(new Date() / 1000) + profile.avatar.name + '-thumbnail');
					var thumbpath = '/public/' + Math.floor(new Date() / 1000) + profile.avatar.name + '-thumbnail';

					fs.writeFile(filename, buffer.data, function (err) {
						console.log(err);
						console.log('success');
					});

					fs.writeFile(thumbnail, tbuffer.data, function (err) {
						console.log(err);
						console.log('success');
					});

					user.picture = thumbpath;
					
				} else {
					return false;
				}
				user.save(function (err, saved) {
					if (err) { console.log(err); }
					sio.sockets.emit('update-profile', saved);
				});
			});
		});
	},
	onlinestatus: function (sio, socket, User) {
		socket.on('onlinestatus', function (status) {

			console.log(status);
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
	lastactive: function (sio, socket) {
		socket.on('inactive', function (time) {
			console.log(time);

			sio.sockets.emit('inactive', {user: time._id, idle: time.idle});
		});
	},
	nowactive: function (sio, socket) {
		socket.on('active', function (id) {
			sio.sockets.emit('active', id);
		});
	}
};