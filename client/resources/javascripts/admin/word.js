(function ($) {
	var list = $('#wordlist');
	var container = $('#word');
	var editword = $('#editword');
	var wordsave = $('.wordsave');
	var word_form = editword.find('form');
	var createword = $('#createword');
	var create_word_form = createword.find('form');

	function tableStructure (single) {
		var location = [];
		locations.forEach( function (loc) {
			if (single.location.indexOf(loc._id) != -1) {
				location.push( ' ' + loc.locations);
				console.log(loc.locations);
			}
		});
		var department = [];
		departments.forEach( function (dep) {
			if (single.department. indexOf(dep._id) != -1) {
				department.push( ' ' + dep.departments );
			}
		});
		html = '<tr class="' + single.name + '">';
		html +=		'<td>' + single.name + '</td>';
		html +=		'<td>' + department + '</td>';
		html += 	'<td>' + location + '</td>';
		html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><button type="button" data-toggle="modal" data-target="#modal-deleteword" class="btn btn-danger col-xs-6 delete">Delete</button></td>';
		html += '</tr>';

		return html
	}

	function wordLoad() {
		createList(list, words, tableStructure);
	}
	//make wordload global
	window.wordLoad = wordLoad;

	//populate edit form with user details#
	container.on('click', '.edit', function (e) {
		$this = $(this);

		//hide, and reset text
		wordsave.find('p').html('Saving...');

		//hide other divs, sihow edit div
		resetState(container, $this);

		//get username
		var name = $this.parents().closest('tr').attr('class');

		//compare name with user list
		words.forEach( function (entry) {
			console.log(entry);
			if (entry.name == name) {
				//id
				word_form.find('#edit-word-id').val(entry._id);
				word_form.find('#edit-word-departments').html('');
				word_form.find('#edit-word-locations').html('');
				locations.forEach(function (location, i) {
					
					word_form.find('#edit-word-locations').append('<input type="checkbox" class="word-locations" value="' + location._id + '"/>' + location.locations);
				});
				departments.forEach( function (department, i) {
					word_form.find('#edit-word-departments').append('<input type="checkbox" class="word-departments" value="' + department._id + '"/>' + department.departments);
				});
				//firstname
				word_form.find('#edit-word-department').val(entry.department);

				//show form, hide others
				editword.show();
			}
		});
	});

	container.on('click', '.word-goback', function() {
		resetState(container, list);
	});

	//delete
	container.on('click', '.delete', function () {
		$this = $(this);
		console.log('clicked settings delete');
		//get username
		var name = $this.parents().closest('tr').attr('class');

		$('#modal-deleteword').attr('name', name);

	});

	$(document).on('click', '#deleteword', function () {
		var name = $(this).parents('#modal-deleteword').attr('name');

		$.ajax({
			url: url + '/admin/word/delete',
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
				var index = findWithAttr(words, 'name', name);
				words.splice(index, 1);
				createList(list, words, tableStructure);
			},
			error: function (xhr, status, error) {
				console.log(error)
			}
		});
	});

	container.on('click', '.wordsave', function() {
		var id = word_form.find('#edit-word-id').val();
		var name = word_form.find('#edit-word-name').val();
		var location = [];
		word_form.find('#edit-word-locations').find('.word-locations').each( function (i) {
			if ($(this).prop('checked')) {
				location.push($(this).val());
			}
		});
		var department = [];
		word_form.find('#edit-word-departments').find('.word-departments').each (function (i) {
			if ( $(this).prop('checked') ) {
				department.push($(this).val());
			}
		});
		$.ajax({
			url: url + '/admin/word/update',
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
				wordsave.removeClass('hide');
			},
			success: function (data, status, xhr) {
				console.log(data);
				//update the userlist
				//get index of updated wordroom
				var index = findWithAttr(words, '_id', id);

				console.log('index: ' + index)
				//update wordroom
				words[index].name = name;
				words[index].location = location;
				words[index].department = department;

				createList(list, words, tableStructure);

				$('#editword').find('p').html('Successfully wordsaved!');
			},
			error: function (xhr, status, error) {
				console.log(error)
				wordsave.find('p').html('Error saving user, please contact support!');
			}
		});
	});

	container.on('click', '.create-word', function() {
		$('#create-word-departments').html('');
		$('#create-word-locations').html('');
		locations.forEach(function (location, i) {
			$('#create-word-locations').append('<input type="checkbox" class="word-locations" value="' + location._id + '"/>' + location.locations);
		});
		departments.forEach( function (department, i) {
			$('#create-word-departments').append('<input type="checkbox" class="word-departments" value="' + department._id + '"/>' + department.departments);
		});
		resetState(container, createword);
	});

	container.on('click', '.createword', function(e) {
		e.preventDefault();
		var name = create_word_form.find('#create-word-name').val();
		var location = [];
		$('#create-word-locations').find('.word-locations').each( function (i) {
			if ( $(this).prop('checked') ) {
				location.push($(this).val());
			}
		});
		var department = [];
		$('#create-word-departments').find('.word-departments').each( function (i) {
			if ( $(this).prop('checked') ) {
				department.push($(this).val());
			}
		});
		$.ajax({
			url: url + '/admin/word/create',
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
				wordsave.removeClass('hide');
			},
			success: function (data, status, xhr) {
				//update the userlist
				if(data) {
					create_word_form[0].reset();
					words.push(data);
					createList(list, words, tableStructure);
					$('.createword-fail').hide();
					$('.createword-success').show();
					resetState(container, list);
				} else {
					$('.createword-fail').show();
				}
			},
			error: function (xhr, status, error) {
				console.log(error);
			}
		});
	});
})(jQuery);