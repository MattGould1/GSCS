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
	eExcel.prototype.init = function (name, id, data) {
		setExcel.call(this, name, id, data);
	}

	eExcel.prototype.update = function () {
		editExcel.call(this, this);

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

	function setExcel(name, id, data) {
		if (data === null || data.length === 0) {
			data = [[]];
		}
		var hot = $('[data-filter="' + name + '-excel"]').find('.hot').addClass(id);
		$('.' + id).handsontable({
			data: data,
			readOnly: true,
			startRows: 8,
			startCols: 6,
			minRows: 8,
			minCols: 8,
			allowInsertColumn: true,
			contextMenu: true,
			comments: true
		});

		var hotInstance = $('.' + id).handsontable('getInstance');
		setHooks.call(this, hotInstance, id);
	}

	function editExcel(id) {
		$(document).on('click', '.excel-edit', function (e) {
			//get excel id
			var id = $(this).siblings('.hot').attr('class').split(" ")[1];
			//emit id to server
			socket.emit('edit-excel', id);
			console.log(id);
			//handle response
			$(this).siblings('.hot').handsontable('getInstance').updateSettings({
				readOnly: false
			});
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
			if (data) {
				//if true, excel is active and you can't edit
				console.log('you cannot edit');
			} else {
				//if false, excel is now true and you can edit
				console.log('you can edit');
			}
		});
	}

})(jQuery);