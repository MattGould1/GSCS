(function ($) {
	var container = $('#users');
	var list = $('#userslist');
	var editUser = $('#edituser');
	var edit_form = editUser.find('form');
	var save = $('.edit-save');
	var createuser = $('#createuser');
	var create_form = createuser.find('form');

	function tableStructure(single) {
			var location = [];
			console.log(single);
			locations.forEach( function (loc) {
				if (single.location != undefined) {
					if (single.location.indexOf(loc._id) != -1) {
						location.push( ' ' + loc.locations);
						console.log(loc.locations);
					}
				}
			});
			var department = [];
			departments.forEach( function (dep) {
				if (single.department != undefined) {
					if (single.department.indexOf(dep._id) != -1) {
						department.push( ' ' + dep.departments );
					}
				}
			});
			html = '<tr class="' + single.username + '">';
			html +=		'<td>' + single.username + '</td>';
			html +=		'<td>' + single.firstName + '</td>';
			html += 	'<td>' + single.lastName + '</td>';
			html += 	'<td>' + location + '</td>';
			html +=		'<td>' + department + '</td>';
			html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><button type="button" data-toggle="modal" data-target="#modal-deleteuser" class="btn btn-danger col-xs-6 delete">Delete</button></td>';
			html += '</tr>';
			return html
	}

	function userLoad() {
		createList(list, users, tableStructure);
	}
	//make chatload global
	window.userLoad = userLoad;

	//populate edit form with user details#
	container.on('click', '.edit', function (e) {
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
		users.forEach( function (single) {
			if (single.username == name) {
				//username
				edit_form.find('#edit-username').val(single.username);
				//password
				edit_form.find('#edit-password').val(single.password);
				//firstname
				edit_form.find('#edit-firstname').val(single.firstName);
				//lastname
				edit_form.find('#edit-lastname').val(single.lastName);
				//email
				edit_form.find('#edit-email').val(single.email);

				edit_form.find('#edit-department').html('');
				edit_form.find('#edit-location').html('');
				locations.forEach(function (location, i) {
					
					edit_form.find('#edit-location').append('<option class="user-locations" value="' + location._id + '">' + location.locations + '</option>');
				});
				departments.forEach( function (department, i) {
					edit_form.find('#edit-department').append('<option class="user-departments" value="' + department._id + '">' + department.departments + '</option>');
				});

				//status
				edit_form.find('#edit-status').val(single.status);

				//show form, hide others
				editUser.show();
			}
		});
	});

	container.on('click', '.user-goback', function() {
		resetState(container, list);
	});

	container.on('click', '.user-save', function() {
		editUsername = edit_form.find('#edit-username').val();
		editPassword = edit_form.find('#edit-password').val();
		editFirstname = edit_form.find('#edit-firstname').val();
		editLastname = edit_form.find('#edit-lastname').val();
		editEmail = edit_form.find('#edit-email').val();
		editLocation = edit_form.find('#edit-location').val();
		editDepartment = edit_form.find('#edit-department').val();
		editStatus = edit_form.find('#edit-status').val()
		$.ajax({
			url: 'http://127.0.0.1:8080/admin/user/update',
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

				createList(list, users, tableStructure);

				save.find('p').html('Successfully saved!');
			},
			error: function (xhr, status, error) {
				console.log(error)
				save.find('p').html('Error saving user, please contact support!');
			}
		});
	});

	//delete a user
	container.on('click', '.delete', function () {
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
				createList(list, users, tableStructure);
			},
			error: function (xhr, status, error) {
				console.log(error)
			}
		});
	});

	container.on('click', '.createuser', function() {
		$('#create-department').html('');
		$('#create-location').html('');
		locations.forEach(function (location, i) {
			$('#create-location').append('<option class="user-locations" value="' + location._id + '">' + location.locations + '</option>');
		});
		departments.forEach( function (department, i) {
			$('#create-department').append('<option class="user-departments" value="' + department._id + '">' + department.departments + '</option>');
		});
		resetState(container, createuser);
	});

	container.on('click', '.user-create', function() {
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
					createList(list, users, tableStructure);
					$('.createuser-fail').hide();
					$('.createuser-success').show();
					resetState(container, list);
				} else {
					$('.createuser-fail').show();
				}
			},
			error: function (xhr, status, error) {
				console.log(error);
			}
		});
	});
})(jQuery);