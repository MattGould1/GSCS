(function ($) {
	$('#header').on('click', '.edit-profile', function() {
		var container = $('.my-profile-content');

		container.find('.my-profile-username').val(user.username);
		container.find('.my-profile-firstname').val(user.firstName);
		container.find('.my-profile-lastname').val(user.lastName);
		container.find('.my-profile-status').val(user.status);
	});

	$('#my-profile').on('click', '.save-profile', function() {
		console.log('hmm');
		var content = $('.my-profile-content');

		profile = {
			username: content.find('.my-profile-username').val(),
			firstName: content.find('.my-profile-firstname').val(),
			lastName: content.find('.my-profile-lastname').val(),
			status: content.find('.my-profile-status').val(),
		};

		socket.emit('update-profile', profile);

		socket.on('update-profile', function (profile) {
			var user = profile;
		});
	});


})(jQuery);