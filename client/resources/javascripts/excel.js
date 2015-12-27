var data = [
  ["", "Ford", "Volvo", "Toyota", "Honda"],
  ["2014", 10, 11, 12, 13],
  ["2015", 20, 11, 14, 13],
  ["2016", 30, 15, 12, 13]
];

	function excel(name, id) {
		
			var hot = $('[data-filter="' + name + '-excel"]').find('.hot').addClass(id);
			$('.' + id).handsontable({
				data: [
					["", "Ford", "Volvo", "Toyota", "Honda"],
					["2014", 10, 11, 12, 13],
					["2015", 20, 11, 14, 13],
					["2016", 30, 15, 12, 13]
				],
				minCols: 5,
				minRows: 5,
				allowInsertColumn: true,
				contextMenu: true,
				comments: true
			});

			var hotInstance = $('.' + id).handsontable('getInstance');

			hotInstance.addHook('afterChange', function (data, source) {
				console.log(data +  source);
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
