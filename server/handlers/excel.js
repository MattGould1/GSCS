module.exports = {
	update: function (sio, socket, Excel) {
		socket.on('update-excel', function (data) {
			Excel.findOne({ _id: data.id }, function (err, excel) {
				if (err) { console.log('Error finding excel to save data: ' + err); }
				excel.user = socket.decoded_token._id;
				excel.data = data.data;
				excel.metaData.colWidths = data.colWidths;
				excel.metaData.rowHeights = data.rowHeights;
				excel.metaData.cellMeta = data.cellMeta;
				excel.active = false;
				excel.save(function (err, saveExcel) {
					if (err) { console.log('Error updating excel' + err);}
					sio.sockets.to(excel._id).emit('update-excel', saveExcel);
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
						sio.sockets.to(excel._id).emit('cancel-excel', excel);
					});
				}
			});
		});
	},
	load: function (sio, socket, Excel) {

	}
};
