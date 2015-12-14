//ui functions
(function ($) {


	//onload
	function showState() {
		var activeLink = $('.links').find('.active').attr('data');

		admin.children('div').each( function (i) {
			$this = $(this);

			$this.hide();

			//console.log(activeLink);
			if ($this.attr('id') == activeLink) {
				$this.show();

				$this.children('div').each( function() {
					$(this).hide();
				});
				$this.children().first('div').show();
			}

		});
	}

	showState();

	function hideNshow() {
		$(document).on('click', '.list-group-item', function() {
			//remove all active clases and reapply to $(this)
			$this = $(this);

			$('.list-group-item').each( function () {
				$(this).removeClass('active');
			});

			$this.addClass('active');

			showState();
		});
	}

	hideNshow();

	$(document).ready(function(){
	    $('[data-toggle="tooltip"]').tooltip();   
	});

})(jQuery);
/*
	@container HTML ID of component e.g. #chat, #excel
	@show The state to show (typically three exist, table create and edit)
*/
function resetState(container, show) {
	//container is the main id of a component aka chat, excel, users etc
	container.children('div').each( function() {
		$(this).hide();
	});
	//show is the state to show, typically three states exist, table, create and edit
	show.show();
}

/*
	@list HTML ID of table container aka "list"
	@data JSON data from server holds all information regarding that list
	@tableStructure base structure for table has to match equivalent structure found in .jade files
*/
function createList(list, data, tableStructure) {
	//clear list before appendning new data
	list.find('table td').closest('tr').html('');

	data.forEach( function (single) {
		var table = list.find('.table');
		table.append(tableStructure(single));
	});
}



	// function createChatroomsList(chatrooms) {
	// 	//clear the list before appending new
	// 	chatroomsList.find('table td').closest('tr').html('');

	// 	chatrooms.forEach( function (entry) {
	// 		var chatroomsTable = chatroomsList.find('.table');

	// 		html = '<tr class="' + entry.name + '">';
	// 		html +=		'<td>' + entry.name + '</td>';
	// 		html +=		'<td>' + entry.department + '</td>';
	// 		html += 	'<td>' + entry.location + '</td>';
	// 		html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><button type="button" data-toggle="modal" data-target="#modal-deletechat" class="btn btn-danger col-xs-6 delete">Delete</button></td>';
	// 		html += '</tr>';

	// 		chatroomsTable.append(html);
	// 	});
	// }
