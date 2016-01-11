//post data to server, receive token as success
$('.row').on('submit', '#login', function (e) {
	e.preventDefault();

	var $this = $(this);

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
			console.log(user);
			if (user.token) {
				//set token as cookie to be sent with requests
				$.cookie('token', user.token, { expires: 7, path: '/' });
				//see connect.js, init will connect to socketio and display app if successfully init will also set the global token var
				init(user.token);
			} else {
				console.log('No token given, do not login!');
			}
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
});