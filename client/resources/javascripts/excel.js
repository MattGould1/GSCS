var data = [
  ["", "Ford", "Volvo", "Toyota", "Honda"],
  ["2014", 10, 11, 12, 13],
  ["2015", 20, 11, 14, 13],
  ["2016", 30, 15, 12, 13]
];

var container = $('#excel');
container.handsontable({
  data: data,
  minCols: 20,
  minRows: 20,
  allowInsertColumn: true,
  contextMenu: true
});

var instance = container.handsontable('getInstance');

console.log(instance);

$('.update-excel').click(function() {
var instance = container.handsontable('getInstance').getCellsMeta();

console.log(instance);
});
$('.store').click(function() {
	
});