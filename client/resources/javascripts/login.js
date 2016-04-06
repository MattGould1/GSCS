//post data to server, receive token as success
$('.row').on('submit', '#login', function (e) {
	e.preventDefault();

	var $this = $(this);
	var button = $this.find('button[type="submit"]');
	button.attr('disabled', true);
	//credentials
	var username = $this.find('#username').val();
	var password = $this.find('#password').val();
	$.ajax({
		url: url + '/login',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			username: username,
			password: password
		}),
		success: function (user, status, xhr) {
			if (user.token) {
				button.attr('disabled', false);
				//set token as cookie to be sent with requests
				if ($this.find('#checkbox').is(':checked') === true) {
					$.cookie('token', user.token, { expires: 7, path: '/' });
				}
				//see connect.js, init will connect to socketio and display app if successfully init will also set the global token var
				init(user.token);
			} else {
				button.attr('disabled', false);
				$this.find('.alert-danger').removeClass('hide');
			}
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
});