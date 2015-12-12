var usersList = $('#users-list');
var editUser = $('#edituser');
var usersContainer = $('#users');
//user functions and ui
function createUsersList(users) {
	users.forEach( function (entry) {
		var usersTable = usersContainer.find('.table');

		html = '<tr class="' + entry.username + '">';
		html +=		'<td>' + entry.username + '</td>';
		html +=		'<td>' + entry.firstName + '</td>';
		html += 	'<td>' + entry.lastName + '</td>';
		html += 	'<td>' + entry.location + '</td>';
		html +=		'<td>' + entry.department + '</td>';
		html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><a class="btn btn-danger col-xs-6 delete">Delete</a></td>';
		html += '</tr>';

		usersTable.append(html);
	});
}

//populate edit form with user details#
$(document).on('click', '.edit', function (e) {
	$this = $(this);

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

			var edit_form = $('#edituser').find('form');

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

$(document).on('click', '.user-goback', function() {

	$('#users').children('div').each( function() {
		$(this).hide();
	});

	usersList.show();
});