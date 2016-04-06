module.exports = {
	update: function (sio, socket, Word) {
		socket.on('updateword', function (data) {
			console.log(data);
			Word.findOne({ _id: data._id }, function (err, word) {
				if (err) { console.log('Error updating word' + err); }
				//object to save
				word.user = socket.decoded_token._id;
				word.data = data.contents;
				word.active = false;
				word.save(function (err, saved) {
					if (err) { console.log('This word document was NOT SAVED' + err); }
					sio.sockets.to(saved._id).emit('updateword', saved);
				});
			});
		});
	},
	edit: function (sio, socket, Word) {
		socket.on('editword', function (id) {
			Word.findOne({ _id: id }, function (err, word) {
				if (err) { console.log('error finding word document to edit' + err) }

				if ( word.active === true ) {
					socket.emit('editword', false);
				} else {
					//if not active, this can be editted return true
					word.active = true;
					word.user = socket.decoded_token._id;
					word.save(function (err, saveWord) {
						if (err) { console.log('Error saving word edit request' + err); }

						var data = {
							word: saveWord,
							edit: true
						};
						//send to all but current
						var all = {
							edit: false,
							user: saveWord.user,
							id: saveWord._id
						};
						//send true to current socket
						socket.emit('editword', data);
						//send false back to every1 else
						socket.broadcast.to(word._id).emit('editword', all);
					});
				}
			});
		});
	},
	cancel: function (sio, socket, Word) {
		socket.on('cancelword', function (id) {
			console.log(id);
			Word.findOne({ _id: id }, function (err, word) {
				if (err) { console.log('Error canceling word document' + err); }
				word.active = false;
				word.save(function (err, savedWord) {
					sio.sockets.to(word._id).emit('cancelword', word);
				});
			});
		});
	},
};
