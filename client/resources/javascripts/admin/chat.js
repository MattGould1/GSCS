(function ($) {
	var list = $('#chatlist');
	var container = $('#chat');
	var editChat = $('#editchat');
	var chatsave = $('.chatsave');
	var chat_form = editChat.find('form');
	var createchat = $('#createchat');
	var create_chat_form = createchat.find('form');

	function tableStructure (single) {
		var location = [];
		locations.forEach( function (loc) {
			if (single.location.indexOf(loc._id) != -1) {
				location.push( ' ' + loc.locations);
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
		html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><button type="button" data-toggle="modal" data-target="#modal-deletechat" class="btn btn-danger col-xs-6 delete">Delete</button></td>';
		html += '</tr>';

		return html
	}

	function chatLoad() {
		createList(list, chatrooms, tableStructure);
	}
	//make chatload global
	window.chatLoad = chatLoad;

	//populate edit form with user details#
	container.on('click', '.edit', function (e) {
		$this = $(this);

		//hide, and reset text
		chatsave.find('p').html('Saving...');
		chatsave.addClass('hide');
		console.log($this);
		//hide other divs, sihow edit div
		resetState(container, $this);

		//get username
		var name = $this.parents().closest('tr').attr('class');

		//compare name with user list
		chatrooms.forEach( function (entry) {
			console.log(entry);
			console.log(name);
			if (entry.name == name) {
				console.log('chat found');
				//name
				chat_form.find('#edit-chat-name').val(entry.name);
				chat_form.find('#edit-chat-departments').html('');
				chat_form.find('#edit-chat-locations').html('');
				locations.forEach(function (location, i) {
					if ($.inArray(location._id, entry.location) > -1) {
						chat_form.find('#edit-chat-locations').append('<input type="checkbox" checked="checked" class="chat-locations" value="' + location._id + '"/>' + location.locations);
					} else {
						chat_form.find('#edit-chat-locations').append('<input type="checkbox" class="chat-locations" value="' + location._id + '"/>' + location.locations);
					}
				});
				departments.forEach( function (department, i) {
					if ($.inArray(department._id, entry.department) > -1) {
						chat_form.find('#edit-chat-departments').append('<input type="checkbox" checked="checked" class="chat-departments" value="' + department._id + '"/>' + department.departments);
					} else {
						chat_form.find('#edit-chat-departments').append('<input type="checkbox" class="chat-departments" value="' + department._id + '"/>' + department.departments);
					}
				});
				//id
				chat_form.find('#edit-chat-id').val(entry._id);
				//show form, hide others
				editChat.show();
			}
		});
	});

	container.on('click', '.chat-goback', function() {
		resetState(container, list);
	});

	container.on('click', '.chat-save', function() {
		var name = chat_form.find('#edit-chat-name').val();

		var location = [];
		chat_form.find('#edit-chat-locations').find('.chat-locations').each( function (i) {
			if ($(this).prop('checked')) {
				location.push($(this).val());
			}
		});
		var department = [];
		chat_form.find('#edit-chat-departments').find('.chat-departments').each (function (i) {
			if ( $(this).prop('checked') ) {
				department.push($(this).val());
			}
		});

		var id = chat_form.find('#edit-chat-id').val();
		$.ajax({
			url: url + '/admin/chat/update',
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
				chatsave.removeClass('hide');
			},
			success: function (data, status, xhr) {
				//update the userlist
				//get index of updated chatroom
				var index = findWithAttr(chatrooms, '_id', id);
				//update chatroom
				console.log(index);
				chatrooms[index].name = name;
				chatrooms[index].location = location;
				chatrooms[index].department = department;

				createList(list, chatrooms, tableStructure);

				chatsave.find('p').html('Successfully chatsaved!');
			},
			error: function (xhr, status, error) {
				console.log(error)
				chatsave.find('p').html('Error saving chatroom, please contact support!');
			}
		});
	});

	//delete a user
	container.on('click', '.delete', function () {
		$this = $(this);

		//get username
		var name = $this.parents().closest('tr').attr('class');

		$('#modal-deletechat').attr('name', name);

	});

	$(document).on('click', '#deletechat', function () {
		var name = $(this).parents('#modal-deletechat').attr('name');

		$.ajax({
			url: url + '/admin/chat/delete',
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
				var index = findWithAttr(chatrooms, 'name', name);
				chatrooms.splice(index, 1);
				createList(list, chatrooms, tableStructure);
			},
			error: function (xhr, status, error) {
				console.log(error)
			}
		});
	});

	container.on('click', '.createchat', function() {
		$('#create-chat-department').html('');
		$('#create-chat-location').html('');
		locations.forEach(function (location, i) {
			$('#create-chat-location').append('<input type="checkbox" class="chat-locations" value="' + location._id + '"/>' + location.locations);
		});
		departments.forEach( function (department, i) {
			$('#create-chat-department').append('<input type="checkbox" class="chat-departments" value="' + department._id + '"/>' + department.departments);
		});
		resetState(container, createchat);
	});

	container.on('click', '.chat-create', function(e) {
		e.preventDefault();
		var name = create_chat_form.find('#create-chat-name').val();
		var location = [];
		$('#create-chat-location').find('.chat-locations').each( function (i) {
			if ( $(this).prop('checked') ) {
				location.push($(this).val());
			}
		});
		var department = [];
		$('#create-chat-department').find('.chat-departments').each( function (i) {
			if ( $(this).prop('checked') ) {
				department.push($(this).val());
			}
		});

		$.ajax({
			url: url + '/admin/chat/create',
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
				chatsave.removeClass('hide');
			},
			success: function (data, status, xhr) {
				//update the userlist
				if(data) {
					create_chat_form[0].reset();
					chatrooms.push(data);
					createList(list, chatrooms, tableStructure);
					$('.createchat-fail').hide();
					$('.createchat-success').show();
					resetState(container, list);
				} else {
					$('.createchat-fail').show();
				}
			},
			error: function (xhr, status, error) {
				console.log(error);
			}
		});
	});
})(jQuery);