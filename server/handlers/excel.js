module.exports = {
	update: function (sio, socket, Excel, Revision, transporter, User, users) {
		socket.on('update-excel', function (data) {
			Excel.findOne({ _id: data.id }, function (err, excel) {
				if (err) {
					console.log('Error finding excel to save data: ' + err);
				}

				if (excel === undefined) {
					console.log('socketio update excel undefined');
				}

				if (excel) {

				}

				User.find({})
					.select('email')
					.where('location')
					.in(excel.location)
					.where('department')
					.in(excel.department)
					.exec( function (err, emails) {

						var mail_list = '';
						for(var i = 0, len = emails.length; i < len; i++) {
							mail_list += emails[i].email + ',';
						}

						mail_list = mail_list.substring(0, mail_list.length - 1);

						var text = 'The latest changes to ' + excel.name + ' ';

						var html = '<h1>The latest changes to ' + excel.name + '</h1><table class="table table-striped" style="max-height: 400px; overflow: scroll;">' +
										'<thead>' +
											'<tr>' +
												'<th>Row</th>' +
												'<th>Column</th>' +
												'<th>Before</th>' +
												'<th>After</th>' +
											'</tr>' +
										'</thead>' +
										'<tbody>';

						if (data.changes.length != 0) {

							var excelchanges = data.changes.reverse();

							for (var i = 0, len = excelchanges.length; i < len;) {

								change = excelchanges[i][0];

								text += 'row: ' + change[0] + ' column: ' + change[1] + ' before: ' + change[2] + ' after: ' + change[3];

								html += '<tr>' +
											'<td>' + change[0] + '</td>' +
											'<td>' + change[1] + '</td>' +
											'<td>' + change[2] + '</td>' +
											'<td>' + change[3] + '</td>' +
										'</tr>';

								i++;
							}

						}

						text += 'These changes were made by: ' + users[socket.decoded_token._id].username;
						
						html += 	'</tbody>' +
								'</table>' +
								'<h2>These changes were made by: ' +  users[socket.decoded_token._id].username + '</h2>';

						var mailOptions = {
								from: '"Market Sheets" <marketsheets@gscsapp.com>',
								to: 'gouldmatt99@hotmail.com', //mail_list,
								subject: excel.name + ' has been updated log in to take a look!',
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

				excel.user = socket.decoded_token._id;
				excel.data = data.data;
				excel.metaData.colWidths = data.colWidths;
				excel.metaData.rowHeights = data.rowHeights;
				excel.metaData.cellMeta = data.cellMeta;
				excel.changes = data.changes;
				excel.active = false;

				excel.save(function (err, saveExcel) {
					if (err) {
						console.log('Error updating excel' + err);
					}

					if (saveExcel === undefined) {
						console.log('socketio save update excel undefined');
					}

					revision = new Revision({
						revision: saveExcel,
						user: socket.decoded_token._id
					});
					
					revision.save(function (err, success) {
						if (err) {
							console.log('Error saving excel revision' + err);
						}

						sio.sockets.to(excel._id).emit('update-excel', saveExcel);
					});
				});
			});
		});
	},
	edit: function (sio, socket, Excel) {
		socket.on('edit-excel', function (id) {
			Excel.findOne({ _id: id }, function (err, excel) {
				if (err) { console.log('Error finding excel edit request' + err); }

				if ( excel.active === true ) {
					socket.emit('edit-excel', false);
				} else {
					//if not active, this can be editted return true
					excel.active = true;
					excel.user = socket.decoded_token._id;
					excel.save(function (err, saveExcel) {
						if (err) { console.log('Error saving excel edit request' + err); }

						var data = {
							excel: saveExcel,
							edit: true
						};
						//send to all but current
						var all = {
							edit: false,
							user: saveExcel.user,
							id: saveExcel._id
						};
						//send true to current socket
						socket.emit('edit-excel', data);
						//send false back to every1 else
						socket.broadcast.to(excel._id).emit('edit-excel', all);
					});
				}
			});
		});
	},
	cancel: function (sio, socket, Excel) {
		socket.on('cancel-excel', function (id) {
			Excel.findOne({ _id: id }, function (err, excel) {
				if (err) { console.log('Error finding excel cancel' +err); }
				if (excel.active === true) {
					excel.active = false;
					excel.save(function (err, saveExcel) {
						console.log('save excel');
						sio.sockets.to(excel._id).emit('cancel-excel', excel);
					});
				}
			});
		});
	},
	load: function (sio, socket, Excel) {

	}
};
