var token, users;

(function ($) {
	//connect
	//url format ttp://127.0.0.1:8080/login'
	if($.cookie('token')) {
		token = $.cookie('token');
	}

	$.ajax({
		url: 'http://127.0.0.1:8080/admin',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token
		}),
		success: function (data, status, xhr) {
			users = data.users;
			createUsersList(data);
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});

	function createUsersList(data) {
		data.users.forEach( function (entry) {
			var usersList = $('#users').find('.table');

			html = '<tr class="' + entry.username + '">';
			html +=		'<td>' + entry.username + '</td>';
			html +=		'<td>' + entry.firstName + '</td>';
			html += 	'<td>' + entry.lastName + '</td>';
			html += 	'<td>' + entry.location + '</td>';
			html +=		'<td>' + entry.department + '</td>';
			html += 	'<td><a class="btn btn-primary col-xs-6 edit">Edit</a><a class="btn btn-danger col-xs-6 delete">Delete</a></td>';
			html += '</tr>';

			usersList.append(html);
		});
	}

	//populate edit form with user details
	$(document).on('click', '.edit', function (e) {
		$this = $(this);
		//get username
		var name = $this.parents().closest('tr').attr('class');

		//compare name with user list
		users.forEach( function (entry) {
			if (entry.username == name) {
				console.log(entry);
			}
		});
	});
	
})(jQuery);