$('.row').on('submit', '#login', function (e) {
	e.preventDefault();

	var $this = $(this);

	//info
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
				$.cookie('token', user.token, { expires: 7, path: '/' });
				connect();
			} else {
				console.log('No token given, do not login!');
			}
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
});