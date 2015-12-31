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

	function cellsMeta(room) {
		var cellArray = [];
		room.metaData.cellMeta.forEach( function (cell) {
			var prop1 = cell[2];
			meta = {
				row: cell[0],
				col: cell[1],
			};
			meta[cell[2]] = cell[3];
			cellArray.push(meta);

		});
		return cellArray;
	}

	function setCellMeta(row, col, key, val) {
		var cellProperties = {};

	
	}

	function setExcel(room) {
		if (room.data === null || room.data.length === 0) {
			room.data = [[]];
		}
		var container = $('[data-filter="' + room.name + '-excel"]');
		var hot = container.find('.hot').addClass(room._id);

		var headerHeight = $('#header').height();
		var footerHeight = $('#footer').height();
		var contentHeight = $(window).height() - footerHeight - headerHeight;

		$('.' + room._id).handsontable({
			data: room.data,
			readOnly: true,
			minRows: 30,
			minCols: 30,
			colWidths: room.metaData.colWidths,
			rowHeights: room.metaData.rowHeights,
			contextMenu: false,
			cell: cellsMeta.call(this, room),
			comments: true,
			//49 for excel buttons
			height: contentHeight - 49,
			manualColumnResize: false,
			manualRowResize: false,
			rowHeaders: true,
			colHeaders: true,
		});

		var hotInstance = $('.' + room._id).handsontable('getInstance');

		setHooks.call(this, hotInstance, room._id);
		if ( room.active === true ) {
			if (room.user.username === user.username) {
				//show options
				container.find('.current').html(excelStrings.currentEdit);
				//make readonly false
				hotInstance.updateSettings({
					readOnly: false,
					contextMenu: true,
					comments: true,
					manualColumnResize: true,
					manualRowResize: true
				});
				//hide edit button
				container.find('.excel-edit').hide();
			} else {
				//tell people who's editting
				container.find('.current').html(excelStrings.edittedBy + room.user.username);
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

	function heightNwidth(count, dimension) {
		var array = [];

		for(i = 0; i < count(); i++) {
			array.push(dimension(i));
		}

		return array;
	}

	function updateExcel() {
		$(document).on('click', '.excel-update', function () {

			var hot = $(this).parent('.excel-options').siblings('.hot');
			var id = hot.attr('class').split(" ")[1];
			var hotInstance = hot.handsontable('getInstance');

			var cellMeta = [];

			hot.handsontable('getInstance').getCellsMeta().forEach( function (cell) {
				if (cell.hasOwnProperty('className')) {
					thisCell = [cell.row, cell.col, 'className', cell.className];
					cellMeta.push(thisCell);
				}
				if (cell.hasOwnProperty('comment')) {
					thisCell = [cell.row, cell.col, 'comment', cell.comment];
					cellMeta.push(thisCell);
				}
			});

			var data = {
				id: id,
				data: hotInstance.getData(),
				colWidths: heightNwidth(hotInstance.countCols, hotInstance.getColWidth),
				rowHeights: heightNwidth(hotInstance.countCols, hotInstance.getRowHeight),
				cellMeta: cellMeta
			};

			socket.emit('update-excel', data);

		});
	}
	function setHooks(hotInstance, id) {
		// http://docs.handsontable.com/0.20.2/Hooks.html#event:afterChange
		hotInstance.addHook('afterChange', function (data, source) {
			console.log(data);

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
			var hot = $('.' + data.excel._id);

			if (data.edit === true) {
				//handle response
				hot.handsontable('getInstance').updateSettings({
					readOnly: false,
					contextMenu: true,
					comments: true,
					cell: cellsMeta.call(this, data.excel),
					manualColumnResize: true,
					manualRowResize: true
				});

				hot.siblings('.excel-options').find('.excel-edit').hide();
				hot.siblings('.current').html(excelStrings.currentEdit);
			} else {
				//if false, excel is now true and you can edit
				console.log('you can\'t edit');
				hot.siblings('.current').html(excelStrings.edittedBy + data.excel.user)
			}
		});

		socket.on('update-excel', function (data) {
			//reset ui
			var hot = $('.' + data._id);

			hot.handsontable('getInstance').updateSettings({
				data: data.data,
				readOnly: true,
				minRows: 30,
				minCols: 30,
				colWidths: data.metaData.colWidths,
				rowHeights: data.metaData.rowHeights,
				cell: cellsMeta.call(this, data),
				contextMenu: false,
				//49 for excel buttons
				manualColumnResize: false,
				manualRowResize: false,
			});

			hot.siblings('.excel-options').find('.excel-edit').show();
			hot.siblings('.current').html('');
			hot.siblings('.excel-options').show();
		});
	}

})(jQuery);