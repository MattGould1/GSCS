$('.row').on('submit', '#login', function (e) {
	e.preventDefault();

	var $this = $(this);

	//info
	var username = $this.find('#username').val();
	var password = $this.find('#password').val();

	$.ajax({
		url: 'http://127.0.0.1:8080/login',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			username: username,
			password: password
		}),
		success: function (data, status, xhr) {
			console.log(data);
			if (data.token) {
				$.cookie('token', data.token, { expires: 7, path: '/' });
				socket = io.connect('http://localhost:8080?token=' + data.token ,{
					'forceNew': true
				});
			} else {
				console.log('No token given, do not login!');
			}
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
});