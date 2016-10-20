module.exports = {
	saveEvent: function (sio, socket, Calendar) {
		
		//kill all events
		//Calendar.find({}).remove().exec();
		
		socket.on('saveEvent', function (event) {
			console.log(event);

			var update = {
				title: event.title,
				description: event.description,
				start: event.start,
				end: event.end,
				username: event.username,
				user_id: event.user_id,
				allDay: true,
			};

			if (event.update) {
				update._id = event._id;
				var conditions = {
					_id: event._id
				};

				var options = {
					multi: true
				}
				Calendar.update(conditions, update, options, function (err, updated) {
					console.log(updated);
					update.update = true;
					sio.sockets.emit('renderEvent', update);
				});
			} else {

				var newEvent = new Calendar(update);

				newEvent.save(function (err, savedEvent) {
					if (err) { console.log('error saving message' + err); }
					sio.sockets.emit('renderEvent', savedEvent);
					console.log(savedEvent);
				});
			}
		});
	}

};