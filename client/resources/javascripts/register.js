$('.row').on('submit', '#register', function(e) {
	e.preventDefault();

	var $this = $(this);

	//info
	var username = $this.find('#username').val();
	var password = $this.find('#password').val();
	var firstName = $this.find('#firstname').val();
	var lastName = $this.find('#lastname').val();
	var email = $this.find('#email').val();
	var location = $this.find('#location').val();
	var department = $this.find('#department').val();
	var admin = true;

	$.ajax({
		url: url + '/register',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			username: username,
			password: password,
			lastName: lastName,
			firstName: firstName,
			email: email,
			admin: admin
		}),
		success: function (data, status, xhr) {
			console.log(data);
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
});