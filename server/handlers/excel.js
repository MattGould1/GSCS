module.exports = {
	update: function (sio, socket, Excel) {
		socket.on('update-excel', function (data) {
			Excel.findOne({ _id: data.id }, function (err, excel) {
				if (err) { console.log('Error finding excel to save data: ' + err); }
				excel.user = socket.decoded_token._id;
				excel.data = data.data;
				excel.active = false;
				excel.save(function (err, saveExcel) {
					if (err) { console.log('Error updating excel' + err);}
					sio.sockets.emit('update-excel', saveExcel);
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
						//send to current socket
						socket.emit('edit-excel', data);
						//send to all but current
						data.edit = false;
						socket.broadcast.emit('edit-excel', data);
					});
				}
			});
		});
	},
	load: function (sio, socket, Excel) {

	}
};
