(function ($) {
	var list = $('#excellist');
	var container = $('#excel');
	var editExcel = $('#editexcel');
	var excelsave = $('.excelsave');
	var excel_form = editExcel.find('form');
	var createexcel = $('#createexcel');
	var create_excel_form = createexcel.find('form');

	function tableStructure (single) {
		html = '<tr class="' + single.name + '">';
		html +=		'<td>' + single.name + '</td>';
		html +=		'<td>' + single.department + '</td>';
		html += 	'<td>' + single.location + '</td>';
		html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><button type="button" data-toggle="modal" data-target="#modal-deleteexcel" class="btn btn-danger col-xs-6 delete">Delete</button></td>';
		html += '</tr>';

		return html
	}

	function excelLoad() {
		createList(list, excels, tableStructure);
	}
	//make excelload global
	window.excelLoad = excelLoad;

	//populate edit form with user details#
	container.on('click', '.edit', function (e) {
		$this = $(this);

		//hide, and reset text
		excelsave.find('p').html('Saving...');

		//hide other divs, sihow edit div
		resetState(container, $this);

		//get username
		var name = $this.parents().closest('tr').attr('class');

		//compare name with user list
		excels.forEach( function (entry) {
			console.log(entry);
			if (entry.name == name) {
				//id
				excel_form.find('#edit-excel-id').val(entry._id);
				//username
				excel_form.find('#edit-excel-name').val(entry.name);
				//password
				excel_form.find('#edit-excel-location').val(entry.location);
				//firstname
				excel_form.find('#edit-excel-department').val(entry.department);

				//show form, hide others
				editExcel.show();
			}
		});
	});

	container.on('click', '.excel-goback', function() {
		resetState(container, list);
	});

	//delete
	container.on('click', '.delete', function () {
		$this = $(this);

		//get username
		var name = $this.parents().closest('tr').attr('class');

		$('#modal-deleteexcel').attr('name', name);

	});

	$(document).on('click', '#deleteexcel', function () {
		var name = $(this).parents('#modal-deleteexcel').attr('name');

		$.ajax({
			url: 'http://127.0.0.1:8080/admin/excel/delete',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				token: token,
				name: name
			}),
			success: function (data, status, xhr) {
				//update the chatrooms list
				//get index of updated chatroom
				var index = findWithAttr(excels, 'name', name);
				excels.splice(index, 1);
				createList(list, excels, tableStructure);
			},
			error: function (xhr, status, error) {
				console.log(error)
			}
		});
	});

	container.on('click', '.excelsave', function() {
		var id = excel_form.find('#edit-excel-id').val();
		var name = excel_form.find('#edit-excel-name').val();
		var location = excel_form.find('#edit-excel-locations').val();
		var department = excel_form.find('#edit-excel-departments').val();
		$.ajax({
			url: 'http://127.0.0.1:8080/admin/excel/update',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				token: token,
				id: id,
				name: name,
				location: location,
				department: department
			}),
			beforeSend: function() {
				excelsave.removeClass('hide');
			},
			success: function (data, status, xhr) {
				console.log(data);
				//update the userlist
				//get index of updated excelroom
				var index = findWithAttr(excels, '_id', id);

				console.log('index: ' + index)
				//update excelroom
				excels[index].name = name;
				excels[index].location = location;
				excels[index].department = department;

				createList(list, excels, tableStructure);

				excelsave.find('p').html('Successfully excelsaved!');
			},
			error: function (xhr, status, error) {
				console.log(error)
				excelsave.find('p').html('Error saving user, please contact support!');
			}
		});
	});

	container.on('click', '.create-excel', function() {
		resetState(container, createexcel);
	});

	container.on('click', '.createexcel', function(e) {
		e.preventDefault();
		var name = create_excel_form.find('#create-excel-name').val();
		var location = create_excel_form.find('#create-excel-locations').val();
		var department = create_excel_form.find('#create-excel-departments').val();

		$.ajax({
			url: 'http://127.0.0.1:8080/admin/excel/create',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				token: token,
				name: name,
				location: location,
				department: department
			}),
			beforeSend: function() {
				excelsave.removeClass('hide');
			},
			success: function (data, status, xhr) {
				//update the userlist
				if(data) {
					create_excel_form[0].reset();
					excels.push(data);
					createList(list, excels, tableStructure);
					$('.createexcel-fail').hide();
					$('.createexcel-success').show();
					resetState(container, list);
				} else {
					$('.createexcel-fail').show();
				}
			},
			error: function (xhr, status, error) {
				console.log(error);
			}
		});
	});
})(jQuery);