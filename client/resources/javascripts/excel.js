(function ($) {

	this.eExcel = function (name, id, data) {

		var options = {
			init: null,
		};
		this.name = name;
		this.data = data;


		if ( arguments[0] && typeof arguments[0] === "object" ) {
			this.options = extendDefaults(options, arguments[0]);
		}
	}

	//public methods
	eExcel.prototype.init = function (room) {
		setExcel.call(this, room);
	}

	eExcel.prototype.update = function () {
		editExcel.call(this);
		updateExcel.call(this);
		socketExcel.call(this);
	}

	//private methods
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

	function setExcel(room) {
		if (room.data === null || room.data.length === 0) {
			room.data = [[]];
		}

		var container = $('[data-filter="' + room.name + '-excel"]');
		var hot = container.find('.hot').addClass(room._id);

		$('.' + room._id).handsontable({
			data: room.data,
			readOnly: true,
			startRows: 8,
			startCols: 6,
			minRows: 8,
			minCols: 8,
			allowInsertColumn: true,
			contextMenu: true,
			comments: true
		});

		var hotInstance = $('.' + room._id).handsontable('getInstance');
		setHooks.call(this, hotInstance, room._id);

		if ( room.active === true ) {
			if (room.user.username === user.username) {
				//show options
				container.find('.current').html(excelStrings.currentEdit);
				//make readonly false
				hotInstance.updateSettings({
					readOnly: false
				});
				//hide edit button
				container.find('.excel-edit').hide();
			} else {
				//tell people who's editting
				container.find('.current').html('hello world');
				//hide options
				container.find('.excel-options').hide();
			}
		} else {

		}
	}

	function editExcel() {
		$(document).on('click', '.excel-edit', function () {
			//get excel id
			var hot = $(this).parent('.excel-options').siblings('.hot');
			var id = hot.attr('class').split(" ")[1];

			//emit id to server
			socket.emit('edit-excel', id);
		});
	}

	function updateExcel() {
		$(document).on('click', '.excel-update', function () {

			var hot = $(this).parent('.excel-options').siblings('.hot');
			var id = hot.attr('class').split(" ")[1];

			var data = {
				id: id,
				data: hot.handsontable('getInstance').getData()
			};

			socket.emit('update-excel', data);

		});
	}
	function setHooks(hotInstance, id) {
		// http://docs.handsontable.com/0.20.2/Hooks.html#event:afterChange
		hotInstance.addHook('afterChange', function (data, source) {
			// data.forEach(function (value, i) {
			// 	hotInstance.setDataAtCell(value[0], value[1], value[3]);
			// });
			excel = {
				data: data,
				id: id
			};

		});

		hotInstance.addHook('afterChangesObserved', function () {
			console.log('hmm');
		});
		hotInstance.addHook('afterSetCellMeta', function (row, col, key, value) {
			console.log(row + col + key + value);
		});
		hotInstance.addHook('afterValidate', function (isValid, value, row, prop, source) {
			console.log(isValid + value + row + prop + source);
		});
	}

	function socketExcel() {
		//socketio methods
		socket.on('edit-excel', function (data) {
			if (data.edit === true) {
				var hot = $('.' + data.excel._id);
				//handle response
				hot.handsontable('getInstance').updateSettings({
					readOnly: false
				});

				hot.siblings('.excel-options').find('.excel-edit').hide();
				hot.siblings('.current').html(excelStrings.currentEdit);
			} else {
				//if false, excel is now true and you can edit
				console.log('you can\'t edit');
			}
		});

		socket.on('update-excel', function (data) {
			//reset ui
			var hot = $('.' + data._id);

			hot.handsontable('getInstance').updateSettings({
				data: data.data,
				readOnly: true
			});

			hot.siblings('.excel-options').find('.excel-edit').show();
			hot.siblings('.current').html('');

		});
	}

})(jQuery);