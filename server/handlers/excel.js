module.exports = {
	update: function (sio, socket, Excel) {
		socket.on('update-excel', function (data) {
			Excel.findOne({ _id: data.id }, function (err, excel) {
				if (err) { console.log('Error finding excel to save data: ' + err); }
				console.log(excel);

				excel.data = data.data;
				excel.user = socket.decoded_token._id;

				excel.save(function (err, saveExcel) {
					if (err) { console.log('Error saving excel data: ' + err); }

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
					excel.active = true;
					excel.save(function (err, saveExcel) {
						if (err) { console.log('Error saving excel edit request' + err); }

						console.log(saveExcel);
						socket.emit('edit-excel', true);
					});
				}
			});
		});
	},
	load: function (sio, socket, Excel) {

	}
};