var usersList = $('#users-list');
var editUser = $('#edituser');
var usersContainer = $('#users');
var edit_form = editUser.find('form');
var save = $('.edit-save');
var createuser = $('#createuser');
var create_form = createuser.find('form');
//user functions and ui
function createUsersList(users) {
	//clear the list before appending new

	usersList.find('.table td').html('');
	usersList.find('table td').closest('tr').html('');

	users.forEach( function (entry) {
		var usersTable = usersList.find('.table');

		html = '<tr class="' + entry.username + '">';
		html +=		'<td>' + entry.username + '</td>';
		html +=		'<td>' + entry.firstName + '</td>';
		html += 	'<td>' + entry.lastName + '</td>';
		html += 	'<td>' + entry.location + '</td>';
		html +=		'<td>' + entry.department + '</td>';
		html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><button type="button" data-toggle="modal" data-target="#modal-deleteuser" class="btn btn-danger col-xs-6 delete">Delete</button></td>';
		html += '</tr>';

		usersTable.append(html);
	});
}

function resetUserState(show) {
	usersContainer.children('div').each( function() {
		$(this).hide();
	});

	show.show();
}

//populate edit form with user details#
usersContainer.on('click', '.edit', function (e) {
	$this = $(this);

	//hide, and reset text
	save.find('p').html('Saving...');
	save.addClass('hide');

	//hide other divs, sihow edit div
	$('#users').children('div').each( function() {
		$(this).hide();
	});

	$this.show();

	//get username
	var name = $this.parents().closest('tr').attr('class');

	//compare name with user list
	users.forEach( function (entry) {
		if (entry.username == name) {
			//username
			edit_form.find('#edit-username').val(entry.username);
			//password
			edit_form.find('#edit-password').val(entry.password);
			//firstname
			edit_form.find('#edit-firstname').val(entry.firstName);
			//lastname
			edit_form.find('#edit-lastname').val(entry.lastName);
			//email
			edit_form.find('#edit-email').val(entry.email);
			//location
			edit_form.find('#edit-location').val(entry.location);
			//department
			edit_form.find('#edit-department').val(entry.department);
			//status
			edit_form.find('#edit-status').val(entry.status);

			//show form, hide others
			editUser.show();
		}
	});
});

usersContainer.on('click', '.user-goback', function() {
	resetUserState(usersList);
});

usersContainer.on('click', '.user-save', function() {
	editUsername = edit_form.find('#edit-username').val();
	editPassword = edit_form.find('#edit-password').val();
	editFirstname = edit_form.find('#edit-firstname').val();
	editLastname = edit_form.find('#edit-lastname').val();
	editEmail = edit_form.find('#edit-email').val();
	editLocation = edit_form.find('#edit-location').val();
	editDepartment = edit_form.find('#edit-department').val();
	editStatus = edit_form.find('#edit-status').val()
	$.ajax({
		url: 'http://127.0.0.1:8080/admin/user',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token,
			username: editUsername,
			password: editPassword,
			firstName: editFirstname,
			lastName: editLastname,
			email: editEmail,
			location: editLocation,
			department: editDepartment,
			status: editStatus
		}),
		beforeSend: function() {
			save.removeClass('hide');
		},
		success: function (data, status, xhr) {
			//update the userlist
			//get index of updated user
			var index = findWithAttr(users, 'username', editUsername);

			//update user
			users[index].username = editUsername;
			users[index].password = editPassword;
			users[index].firstName = editFirstname;
			users[index].lastName = editLastname;
			users[index].email = editEmail;
			users[index].location = editLocation;
			users[index].department = editDepartment;
			users[index].status = editStatus;

			createUsersList(users);

			save.find('p').html('Successfully saved!');
		},
		error: function (xhr, status, error) {
			console.log(error)
			save.find('p').html('Error saving user, please contact support!');
		}
	});
});
	// usersContainer.on('show.bs.modal', '.delete', function(	) {

	// });
//delete a user
usersContainer.on('click', '.delete', function () {
	$this = $(this);

	//get username
	var name = $this.parents().closest('tr').attr('class');

	$('#modal-deleteuser').attr('username', name);

});

$(document).on('click', '#deleteuser', function () {
	var username = $(this).parents('#modal-deleteuser').attr('username');

	$.ajax({
		url: 'http://127.0.0.1:8080/admin/user/delete',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token,
			username: username
		}),
		success: function (data, status, xhr) {
			console.log(data);
			//update the userlist
			//get index of updated user
			var index = findWithAttr(users, 'username', username);
			users.splice(index, 1);
			createUsersList(users);
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
});

usersContainer.on('click', '.createuser', function() {
	resetUserState(createuser);
});

usersContainer.on('click', '.user-create', function() {
	createUsername = create_form.find('#create-username').val();
	createPassword = create_form.find('#create-password').val();
	createFirstname = create_form.find('#create-firstname').val();
	createLastname = create_form.find('#create-lastname').val();
	createEmail = create_form.find('#create-email').val();
	createLocation = create_form.find('#create-location').val();
	createDepartment = create_form.find('#create-department').val();
	createStatus = create_form.find('#create-status').val();
	createAdmin = create_form.find('#create-admin').is(':checked');
	$.ajax({
		url: 'http://127.0.0.1:8080/admin/user/create',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token,
			username: createUsername,
			password: createPassword,
			firstName: createFirstname,
			lastName: createLastname,
			email: createEmail,
			location: createLocation,
			department: createDepartment,
			status: createStatus,
			admin: admin
		}),
		beforeSend: function() {
			save.removeClass('hide');
		},
		success: function (data, status, xhr) {
			//update the userlist
			if(data) {
				create_form[0].reset();
				users.push(data);
				createUsersList(users);
				$('.createuser-fail').hide();
				$('.createuser-success').show();
				resetUserState(usersList);
			} else {
				$('.createuser-fail').show();
			}
		},
		error: function (xhr, status, error) {
			console.log(error);
		}
	});
});