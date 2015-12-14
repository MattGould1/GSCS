(function ($) {
	var list = $('#chatlist');
	var container = $('#chat');
	var editChat = $('#editchat');
	var chatsave = $('.chatsave');
	var chat_form = editChat.find('form');
	var createchat = $('#createchat');
	var create_chat_form = createchat.find('form');

	function tableStructure (single) {
		html = '<tr class="' + single.name + '">';
		html +=		'<td>' + single.name + '</td>';
		html +=		'<td>' + single.department + '</td>';
		html += 	'<td>' + single.location + '</td>';
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

		//hide other divs, sihow edit div
		resetState(container, $this);

		//get username
		var name = $this.parents().closest('tr').attr('class');

		//compare name with user list
		chatrooms.forEach( function (entry) {
			console.log(entry);
			if (entry.name == name) {
				//username
				chat_form.find('#edit-chat-name').val(entry.name);
				//password
				chat_form.find('#edit-chat-location').val(entry.location);
				//firstname
				chat_form.find('#edit-chat-department').val(entry.department);

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
		var location = chat_form.find('#edit-chat-location').val();
		var department = chat_form.find('#edit-chat-department').val();
		$.ajax({
			url: 'http://127.0.0.1:8080/admin/chat/update',
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
				console.log(data);
				//update the userlist
				//get index of updated chatroom
				var index = findWithAttr(chatrooms, 'name', name);
				console.log(index);
				//update chatroom
				chatrooms[index].name = name;
				chatrooms[index].location = location;
				chatrooms[index].department = department;

				createList(list, chatrooms, tableStructure);

				chatsave.find('p').html('Successfully chatsaved!');
			},
			error: function (xhr, status, error) {
				console.log(error)
				chatsave.find('p').html('Error saving user, please contact support!');
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
			url: 'http://127.0.0.1:8080/admin/chat/delete',
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
		resetState(container, createchat);
	});

	container.on('click', '.chat-create', function(e) {
		e.preventDefault();
		var name = create_chat_form.find('#create-chat-name').val();
		var location = create_chat_form.find('#create-chat-location').val();
		var department = create_chat_form.find('#create-chat-department').val();

		$.ajax({
			url: 'http://127.0.0.1:8080/admin/chat/create',
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
				save.removeClass('hide');
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