(function ($) {

	//launch excel module
	this.eExcel = function (name, id, data) {
		
		var options = {
			init: null,
		};

		if ( arguments[0] && typeof arguments[0] === "object" ) {
			this.options = extendDefaults(options, arguments[0]);
		}
	}

	//public methods
	/*
	* @param Object excelsheet: _id, name, user, revisions, department etc see @server Model Excel
	*/
	eExcel.prototype.init = function (excelsheet) {
		initExcel.call(this, excelsheet);
		saveToExcel.call(this);
	}

	eExcel.prototype.update = function () {
		tryEditExcel.call(this);
		updateExcel.call(this);
		socketExcel.call(this);
		viewEdits.call(this);
		cancelEdit.call(this);
	}

	//private methods
	function cellsMeta (excelsheet) {
		//@var holds cellmeta row, col, prop
		var cellArray = [];
		/*
		* @param Array cell: get handsontable cellmeta and add to cellArray, contains row, col, prop, prop value
		*/
		excelsheet.metaData.cellMeta.forEach( function (cell) {
			//creata object row, col, prop
			meta = {
				row: cell[0],
				col: cell[1],
			};
			meta[cell[2]] = cell[3];

			cellArray.push(meta);

		});
		return cellArray;
	}

	function saveToExcel() {
		$('.save-to-excel').unbind().click(function(e) {
			e.preventDefault();
			var hot = $(this).parent().parent('.excel-options').siblings('.hot').handsontable('getInstance');

			var downloadPlugin = hot.getPlugin('exportFile');

			downloadPlugin.downloadFile('csv', {filename: 'marketsheet'});

		});
	}

	//@TODO
	function statusRenderer(instance, td, row, col, prop, value, cellProperties) {
	    Handsontable.renderers.TextRenderer.apply(this, arguments);

	    //var cell = instance.getCellMeta(row, col);
	  	if (cellProperties['status'] === 'pnc') {
	  		$(td).css({
	  			'background-color': 'red',
	  			'color': 'white'
	  		});
	  	} else if (cellProperties['status'] === 'fxd') {
	  		$(td).css({
	  			'background-color': 'green',
	  			'color': 'white'
	  		});
	  	} else if (cellProperties['status'] === 'subs') {
	  		$(td).css({
	  			'background-color': 'blue',
	  			'color': 'white'
	  		});
	  	} else if (cellProperties['status'] === 'remove') {
	  		$(td).css('background-color', 'none');
	  	}
	  	headingsRenderer.call(this, td, cellProperties, value);
	  	inlineRenderer.call(this, td, cellProperties, value);

	}

	function headingsRenderer(td, cellProperties, value) {

		if (cellProperties['headings']) {
			var closingBracket = cellProperties['headings'].split('<');
			var opened = '<' + cellProperties['headings'] + '>';
			var closed = '</' + closingBracket[1] + '>';

			$(td).html(opened + value + closed);
		}

	}

	function inlineRenderer(td, cellProperties, value) {
		if (cellProperties['inline']) {
			if (cellProperties['inline'] == 'i') {
				$(td).css('font-style', 'italic');
			} else if (cellProperties['inline'] == 'b') {
				$(td).css('font-weight', 'bold');
			}
		}
	}

	function excelHeight() {
		var header = $('#header').outerHeight();
		var footer = $('#footer').outerHeight();

		var _window = $(window).outerHeight();

		//61 is the height of the bar above the excel
		return _window - footer - header - 40;
	}

	function excelWidth() {
		return $('#content').outerWidth();
	}
	function initExcel (excelsheet) {
		//handsontable requires an Array of Arrays as its data, by default room.data could be null or 0 in length, if this is the case make it [[]]
		if (excelsheet.data === null || excelsheet.data.length === 0) {
			excelsheet.data = [[]];
		}
		//store container, container also holds .excel-optins (edit, save, cancel etc) and .message, used to display current status
		var container = $('[data-filter="' + excelsheet.name + '-excel"]');

		logger('creating marketsheet');
		logger(excelsheet);

		//add excelsheet _id to make each handsontable identifiable
		var hot = container.find('.hot').addClass(excelsheet._id);

		setTimeout(function() {
			console.log($('#content').outerWidth());
			//see @server Model excel for details on data
			$('.' + excelsheet._id).handsontable({
				//set handsontable data
				data: excelsheet.data,
				//readonly true, so it cannot be editted
				readOnly: true,
				minRows: 30,
				minCols: 30,
				// @param Array of Numers colWidths + rowHeights, handsontable uses to render table
				colWidths: excelsheet.metaData.colWidths,
				rowHeights: excelsheet.metaData.rowHeights,
				//handsontable contextmenu hidden by default so cannot edit
				contextMenu: false,
				//create cellmeta per cell
				cell: cellsMeta.call(this, excelsheet),
				//comments always true
				comments: true,
				//81 for button/message height
				height: excelHeight(),
				width: excelWidth(),
				//manual resize false until edit is allowed
				manualColumnResize: false,
				manualRowResize: false,
				//add more details for headers later @TODO
				rowHeaders: true,
				colHeaders: true,
				cells: function (row, col, prop) {
					var cellProperties = {};
					cellProperties.renderer = statusRenderer;

					return cellProperties;
				}
			});

			//get current instance, this will be used to set handsontable hooks @todo
			var hotInstance = $('.' + excelsheet._id).handsontable('getInstance');
			setHooks.call(this, hotInstance, excelsheet._id);
			// change ui State if the sheet is active, if the excelsheet is active it is being editted
		}, 1000);
		if ( excelsheet.active === true ) {
			//@TODO this shouldn't occur but abstract other scenario into function and reuse code #savetheplanet
				var options = hot.siblings('.excel-options');
				options.find('.excel-edit').hide();
				uiObj.notMyEdit(options, excelsheet.user.username + ' is currently editing.');
		}
	}

	//check to see if we can edit, the button won't be visible if it is active, but who knows right?
	function tryEditExcel() {
		$(document).on('click', '.excel-edit', function () {
			logger('Can I edit this excel?');
			//get the id from clicked excelsheet, id is sent to server see @server handlers/excel
			var hot = $(this).parent().parent('.excel-options').siblings('.hot');
			var id = hot.attr('class').split(" ")[1];

			socket.emit('edit-excel', id);

			uiObj.alertsOpen('Loading please wait...');
		});
		/*
		* @param Object data contains
		*		excel: Object
		*		edit: boolean
		*	@TODO improve performanc by not sending excelsheet back if edit false
		*/
		socket.on('edit-excel', function (data) {
			console.log(data);
			//get jQuery object for excelsheet
			if (data.edit === true) {
				//get hot instance
				var hot = $('.' + data.excel._id);
				var hotInstance = hot.handsontable('getInstance');
				hotInstance.updateSettings({
					//allow edits
					readOnly: false,
					//allow insert rows etc
					contextMenu:  {
						callback: function (key, options) {
							var selected = getSelectedCells.call(this, hotInstance);



							if (key.indexOf('status') == 0) {
								var status = key.split(':');
								setSelectedCellsMeta.call(this, hotInstance, selected, 'status', status[1]);
							}
					
							if (key.indexOf('headings') == 0) {
								var headings = key.split(':');
								setSelectedCellsMeta.call(this, hotInstance, selected, 'headings', headings[1]);
							}

							if (key.indexOf('inline') == 0) {
								var inline = key.split(':');
								setSelectedCellsMeta.call(this, hotInstance, selected, 'inline', inline[1]);
							}

							hotInstance.render();
						},
						items: {
							"row_above": {},
							"row_below": {},
							"hsep1": "---------",
							"col_left": {},
							"col_right": {},
							"hsep2": "---------",
							"remove_row": {},
							"remove_col": {},
							"hsep3": "---------",
							"headings": {
								name: 'Headings',
								submenu: {
									items: 
									[{
										key: 'headings:h1',
										name: function() {
											var label = 'H1';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'headings', 'h1');

											if (has) {
												label = markLabelAsSelected(label);
											}

											return label;
										}
									}, {
										key: 'headings:h2',
										name: function() {
											var label = 'H2';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'headings', 'h2');

											if (has) {
												label = markLabelAsSelected(label);
											}

											return label;
										}
									}, {
										key: 'headings:h3',
										name: function() {
											var label = 'H3';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'headings', 'h3');

											if (has) {
												label = markLabelAsSelected(label);
											}

											return label;
										}
									}, {
										key: 'headings:h4',
										name: function() {
											var label = 'H4';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'headings', 'h4');

											if (has) {
												label = markLabelAsSelected(label);
											}

											return label;
										}
									}, {
										key: 'headings:h5',
										name: function() {
											var label = 'H5';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'headings', 'h5');

											if (has) {
												label = markLabelAsSelected(label);
											}

											return label;
										}
									}, {
										key: 'headings:h6',
										name: function() {
											var label = 'H6';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'headings', 'h6');

											if (has) {
												label = markLabelAsSelected(label);
											}

											return label;
										}
									}, {
										key: 'headings:remove',
										name: 'Remove Headings'
									}]
								}
							},
							"inline": {
								name: 'Inline',
								submenu: {
									items: [
										{
											key: 'inline:b',
											name: function () {
												var label = 'Bold';
												var selected = getSelectedCells.call(this, hotInstance);
												var has = checkSelectedCellsMeta.call(this, selected, 'inline', 'b');
												if (has) {
													label = markLabelAsSelected(label);
												}
												return label;												
											}
										}, {
											key: 'inline:i',
											name: function () {
												var label = 'Italic';
												var selected = getSelectedCells.call(this, hotInstance);
												var has = checkSelectedCellsMeta.call(this, selected, 'inline', 'i');
												if (has) {
													label = markLabelAsSelected(label);
												}
												return label;	
											}
										}, {
											key: 'inline:remove',
											name: 'Remove Inline Styles'
										}
									]
								}
							},
							"status": {
								name: 'Status',
								submenu: {
									items: [{
										key: 'status:pnc',
										name: function() {
											var label = 'Private and Confidential';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'status', 'pnc');
											if (has) {
												label = markLabelAsSelected(label);
											}
											return label;
										}
									},
									{
										key: 'status:fxd',
										name: function() {
											var label = 'Fixed';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'status', 'fxd');
											if (has) {
												label = markLabelAsSelected(label);
											}
											return label;
										}
									},
									{
										key: 'status:subs',
										name: function() {
											var label = 'Subs';
											var selected = getSelectedCells.call(this, hotInstance);
											var has = checkSelectedCellsMeta.call(this, selected, 'status', 'subs');
											if (has) {
												label = markLabelAsSelected(label);
											}
											return label;
										}
									},
									{
										key: 'status:remove',
										name: 'Remove Status'
									}]
								}
							},
							"alignment": {},
							"hsep4": "---------",
							"undo": {},
							"redo": {},
							"commentsAddEdit": {},
							"commentsRemove": {}
						}
					},
					comments: true,
					//reset cellsMeta, silly handsontable requires it
					cell: cellsMeta.call(this, data.excel),
					//allow column/row resizing
					manualColumnResize: true,
					manualRowResize: true,
		            cells: function (row, col, prop) {
		                var cellProperties = {};
		                cellProperties.renderer = statusRenderer;

		                return cellProperties;
		            }
				});
				//@TODO improve this mess
				var options = hot.siblings('.excel-options');
				options.find('.excel-edit').hide();
				options.find('.edit-options').show();

				uiObj.myEdit(options);
				uiObj.alertsClose();
			} else {
				var hot = $('.' + data.id);
				//@TODO get user object from data.excel.user, no point using .populate as global users holds information we require
				for (var key in users) {
					if(users.hasOwnProperty(key)) {
						var user = users[key];
						if (user._id === data.user) {
							name = user.username;
						}
					}
				}
				var options = hot.siblings('.excel-options');
				options.find('.excel-edit').hide();
				console.log('user id from excel' + data.user);
				uiObj.notMyEdit(options, uiObj.findUser(data.user).username + ' is currently editing.');
			}
		});
	}
	/*
	*	@param Objet excel @model
	*/
	function cancelEdit() {

		$(document).on('click', '.excel-cancel', function () {
			//get the id from clicked excelsheet
			var hot = $(this).parent().parent().parent('.excel-options').siblings('.hot');
			var id = hot.attr('class').split(" ")[1];
			excelsheets.forEach( function (sheet, index) {
				if (sheet._id == id) {
					excel = sheet;
				}
			});
			var hotInstance = hot.handsontable('getInstance');
			//clearup the changes
			delete changes[id];

			hotInstance.updateSettings({
				//update data
				data: excel.data,
				//make handsontable uneditable
				readOnly: true,
				minRows: 30,
				minCols: 30,
				//update table size
				colWidths: excel.metaData.colWidths,
				rowHeights: excel.metaData.rowHeights,
				//update cellMeta
				cell: cellsMeta.call(this, excel),
				//disable menu
				contextMenu: false,
				//disable table resizing
				manualColumnResize: false,
				manualRowResize: false,
			});

			socket.emit('cancel-excel', id);

			uiObj.alertsOpen();
		});

		//reset ui back to edit
		socket.on('cancel-excel', function (excel) {
			logger('cancelling excelsheet');
			var hot = $('.' + excel._id);
			var options = hot.siblings('.excel-options');
			options.find('.edit-options').hide();
			options.find('.excel-edit').show();
			uiObj.alertsClose();
			uiObj.removeEdits(options);
		});
	}
	/*
	*	@param Numeric count: handsontable.count, returns total number of cols/rows
	* 	@param Function dimension: get the height/width of the respective count
	*/
	function heightNwidth(count, dimension) {
		//array to save
		var array = [];

		for(i = 0; i < count; i++) {
			var size = dimension(i);
			if (size != null) {
				array.push(size);
			}
		}

		return array;
	}

	/*
	*	Sends an Object with excel's data, meta and changes
	*/
	function updateExcel() {
		$(document).on('click', '.excel-update', function () {
			//get current id to send to server
			var hot = $(this).parent().parent().parent('.excel-options').siblings('.hot');
			var id = hot.attr('class').split(" ")[1];

			//get hotinstance
			var hotInstance = hot.handsontable('getInstance');

			//
			var cellMeta = [];

			//create array of cellMeta for handsontable cell:
			hotInstance.getCellsMeta().forEach( function (cell) {
				if (cell != undefined) {
					if (cell.hasOwnProperty('className')) {
						thisCell = [cell.row, cell.col, 'className', cell.className];
						cellMeta.push(thisCell);
					}
					if (cell.hasOwnProperty('comment')) {
						thisCell = [cell.row, cell.col, 'comment', cell.comment];
						cellMeta.push(thisCell);
					}
					if (cell.hasOwnProperty('status')) {
						thisCell = [cell.row, cell.col, 'status', cell.status];
						cellMeta.push(thisCell);
					}
					if (cell.hasOwnProperty('headings')) {
						thisCell = [cell.row, cell.col, 'headings', cell.headings];
						cellMeta.push(thisCell);
					}
					if (cell.hasOwnProperty('inline')) {
						thisCell = [cell.row, cell.col, 'inline', cell.inline];
						cellMeta.push(thisCell);
					}
				}
			});

			/*
			* @var data Object
			* 			id: excelsheet._id
			*			colWidths: Array of Numerics
			*			rowHeights: Array of numerics
			*			cellMeta: Array of Arrays holds row, col, prop, value (in that order)
			*			changes: recent changes from the afterChange event
			*/
			var data = {
				id: id,
				data: hotInstance.getData(),
				//@TODO FIX BUG SOMETHING WRONG WITH WIDTH/HEIGHT CAUSING TABLE TO JUMP TO TOP AFTER SAVING
				colWidths: heightNwidth(hotInstance.countCols(), hotInstance.getColWidth),
				rowHeights: heightNwidth(hotInstance.countRows(), hotInstance.getRowHeight),
				cellMeta: cellMeta,
				changes: changes[id]
			};

			//emit all data
			socket.emit('update-excel', data);
			uiObj.alertsOpen();
		});

		/*
		* @param Object data: @server Model excel
		*/
		socket.on('update-excel', function (data) {
			//reset ui for all users, edits complete
			var hot = $('.' + data._id);

			//get handsontable instance and update settings
			hot.handsontable('getInstance').updateSettings({
				//update data
				data: data.data,
				//make handsontable uneditable
				readOnly: true,
				minRows: 30,
				minCols: 30,
				//update table size
				colWidths: data.metaData.colWidths,
				rowHeights: data.metaData.rowHeights,
				//update cellMeta
				cell: cellsMeta.call(this, data),
				//disable menu
				contextMenu: false,
				//disable table resizing
				manualColumnResize: false,
				manualRowResize: false,
			});

			//update changes array
			changes[data._id] = data.changes;
			var options = hot.siblings('.excel-options');

			linkC = $('[data-filter="' + data.name + '-excel"');
			if (!hot.is(':visible')) {
				var badge = linkC.find('.messageCount');
				var count = +badge.html();
				badge.html(count + 1);				
			}

			//reset ui options @TODO improve mess
			options.find('.excel-edit').show();
			options.find('.message').html('');
			options.find('.message').hide();
			options.find('.edit-options').hide();
			uiObj.alertsClose();
			uiObj.removeEdits(options);

			//cheater @TODO REMOVE LATER
			if (uiObj.findUser(data.user).username != user.username) {
				new Audio('sounds/notification.mp3').play();
			}
		});
	}

	//@TODO implement this in a better way
	function viewEdits() {

		$(document).on('click', '.view-edits', function (e) {
			var id = $(this).parent().parent('.excel-options').siblings('.hot').attr('class').split(' ')[1];

			var popup = $('#viewedits');
			var body = popup.find('.viewedits-body');
			body.html('');
			var html = '<table class="table table-striped" style="max-height: 400px; overflow: scroll;">' +
					    	'<thead>' +
					    		'<tr>' +
						    		'<th>Row</th>' +
						    		'<th>Column</th>' +
						    		'<th>Before</th>' +
						    		'<th>After</th>' +
						    	'</tr>' +
					    	'</thead>' +
					    	'<tbody>';
			changes[id].reverse().forEach( function (change) {
				change = change[0];

				html += '<tr>' +
							'<td>' + change[0] + '</td>' +
							'<td>' + change[1] + '</td>' +
							'<td>' + change[2] + '</td>' +
							'<td>' + change[3] + '</td>' +
						'</tr>';
			});

			html += 	'</tbody>' +
					'</table>';

			body.append(html);
		});
	}

	//@TODO
	function setHooks(hotInstance, id) {

		// http://docs.handsontable.com/0.20.2/Hooks.html#event:afterChange @TODO add hooks later, maybe auto saves etc
		/*
		*	@Array data: an array of cell data, row column last value and new value
		* 	@String source: The source of the change e.g. edit 
		*/
		hotInstance.addHook('afterChange', function (data, source) {
			logger('after change');
			if (source === 'edit') {
				//create changes array with id as key
				if (changes[id] === undefined) {
					//make array
					changes[id] = [];
				}

				changes[id].push(data);
				logger(changes);
			}
			
		});

		hotInstance.addHook('afterChangesObserved', function () {
			logger('change observed');
		});
		// hotInstance.addHook('afterSetCellMeta', function (row, col, key, value) {
		// 	console.log(row + col + key + value);
		// });
		// hotInstance.addHook('afterValidate', function (isValid, value, row, prop, source) {
		// 	console.log(isValid + value + row + prop + source);
		// });
		// hotInstance.addHook( 'afterSelectionEnd', function(r, c, r2, c2) {
		
		// });
	}

	/*
	* Takes the selected range and walks through adding each cell, finally gets that cells meta and adds it to an array. The array is returned.
	*/
	function getSelectedCells(hotInstance) {

		var selectedRange = hotInstance.getSelectedRange();

		var fromCol = selectedRange.from.col;
		var fromRow = selectedRange.from.row;

		var toCol = selectedRange.to.col;
		var toRow = selectedRange.to.row;

		var highlightCol = selectedRange.highlight.col;
		var highlightRow = selectedRange.highlight.row;

		//create an array of rows and columns with the selected
		var lowestCol = {};

		//get the top-left cell for reading
		if ( fromCol > toCol ) {
			var colStart = toCol;
			var colEnd = fromCol;
		} else {
			var colStart = fromCol;
			var colEnd = toCol;
		}

		if ( fromRow > toRow) {
			var rowStart = toRow;
			var rowEnd = fromRow;
		} else {
			var rowStart = fromRow;
			var rowEnd = toRow;
		}

		cells = [];
		resetCol = colStart;
		while (rowStart !== rowEnd+1) {
			//get current position
			cell = hotInstance.getCellMeta(rowStart, colStart);
			//add to column
			colStart++;
			//check to see if the columns now at the end, and also check row position
			if (colStart == colEnd+1) {
				//if column is at the end go to next row
				rowStart++;
				//reset col
				colStart = resetCol;
			}
			//push cell to array
			cells.push(cell);
		}

		return cells;
	}

	/*
	* accepts an array of cells, checks to see if they have cell meta/value @SEE setSelectedCellsMeta
	*/
	function checkSelectedCellsMeta(cells, metaProperty, metaValue) {
		var hasMeta = false;
		cells.forEach( function (cell) {
			if (cell[metaProperty] == metaValue) {
				hasMeta = true;
			}
			return hasMeta;
		});
		return hasMeta;
	}

	//for context menu
	function markLabelAsSelected(label) {
	  return '<span class="selected">' + String.fromCharCode(10003) + '</span>' + label;
	}

	/*
	*	Accepts an array of cells, sets the cell meta/value as provided @SEE checkSelectedCellsMeta
	*/
	function setSelectedCellsMeta (hotInstance, cells, meta, value) {
		cells.forEach( function (cell) {
			hotInstance.setCellMeta(cell.row, cell.col, meta, value);
		});
	}

	//socketio methods
	function socketExcel() {


	}

	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

})(jQuery);