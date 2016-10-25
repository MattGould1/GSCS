module.exports = {
	saveEvent: function (sio, socket, Calendar, User, transporter) {
		
		//kill all events
		//Calendar.find({}).remove().exec();
		
		socket.on('saveEvent', function (event) {

			var update = {
				title: event.title,
				description: event.description,
				start: event.start,
				end: event.end,
				allDay: true,
				edit_username: event.edit_username,
			};

			if (event.update) {
				var subject = event.title + ' has been updated on your GSCS calendar';

				var text = 'Title: ' + event.title + 
						   ' Event Description: ' + event.description + 
						   ' Event start date: ' + event.start + 
						   ' Event end date: ' + event.end + 
						   ' Event created by: ' + event.edit_username;

				var html = '<table>' +
								'<thead>' +
									'<tr>' +
										'<th>Title</th>' +
										'<th>Description</th>' +
										'<th>Start Date</th>' +
										'<th>End Date</th>' +
										'<th>Created By</th>' +
									'</tr>' +
								'</thead>' +
								'<tbody>' +
								'<tr>' +
									'<td>' + event.title + '</td>' +
									'<td>' + event.description + '</td>' +
									'<td>' + event.start + '</td>' +
									'<td>' + event.end + '</td>' +
									'<td>' + event.edit_username + '</td>' +
								'</tr>' +
							'</table>';
			} else {
				var subject = event.title + ' has been created on your GSCS calendar';
				var text = 'Title: ' + event.title + 
						   ' Event Description: ' + event.description + 
						   ' Event start date: ' + event.start + 
						   ' Event end date: ' + event.end + 
						   ' Event created by: ' + event.username;

				var html = '<table>' +
								'<thead>' +
									'<tr>' +
										'<th>Title</th>' +
										'<th>Description</th>' +
										'<th>Start Date</th>' +
										'<th>End Date</th>' +
										'<th>Created By</th>' +
									'</tr>' +
								'</thead>' +
								'<tbody>' +
								'<tr>' +
									'<td>' + event.title + '</td>' +
									'<td>' + event.description + '</td>' +
									'<td>' + event.start + '</td>' +
									'<td>' + event.end + '</td>' +
									'<td>' + event.username + '</td>' +
								'</tr>' +
							'</table>';
			}

			if (event.update) {
				update._id = event._id;
				var conditions = {
					_id: event._id
				};

				var options = {
					multi: true
				}
				Calendar.update(conditions, update, options, function (err, updated) {
					update.update = true;
					sio.sockets.emit('renderEvent', update);
				});
			} else {
				update.username = event.username;
				update.user_id = event.user_id;

				var newEvent = new Calendar(update);

				newEvent.save(function (err, savedEvent) {
					if (err) { console.log('error saving message' + err); }
					sio.sockets.emit('renderEvent', savedEvent);
				});
			}



			if (event.send_email) {
				console.log('lets send an email to everyone!');


				User.find({})
					.select('email')
					.exec( function (err, emails) {

						var mail_list = '';
						for(var i = 0, len = emails.length; i < len; i++) {
							mail_list += emails[i].email + ',';
						}

						mail_list = mail_list.substring(0, mail_list.length - 1);



						var mailOptions = {
								from: '"Calendar" <calendar@gscsapp.com>',
								to: 'gouldmatt99@hotmail.com', //mail_list,
								subject: subject,
								text: text,
								html: html,
						};

						// transporter.sendMail(mailOptions, function(error, info){
						// 	if(error){
						// 		return console.log(error);
						// 	}
						// 	console.log('Message sent: ' + info.response);
						// });
					});

			}
		});
	},
	deleteEvent: function (sio, socket, Calendar) {
		socket.on('deleteEvent', function (id) {

			Calendar.find({_id: id}).remove().exec();

		});
	}

};