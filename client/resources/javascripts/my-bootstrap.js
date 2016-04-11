(function ($) {
	$('#header').on('click', '.edit-profile', function() {
		var container = $('.my-profile-content');

		container.find('.my-profile-username').val(user.username);
		container.find('.my-profile-firstname').val(user.firstName);
		container.find('.my-profile-lastname').val(user.lastName);
		container.find('.my-profile-status').val(user.status);
		if (user.options.sounds) {
			container.find('.my-profile-sounds').prop('checked', true);
		}
	});

	$('#my-profile').on('click', '.save-profile', function() {
		console.log('hmm');
		var content = $('.my-profile-content');
		var sounds = content.find('.my-profile-sounds').is(':checked');
		profile = {
			username: content.find('.my-profile-username').val(),
			firstName: content.find('.my-profile-firstname').val(),
			lastName: content.find('.my-profile-lastname').val(),
			status: content.find('.my-profile-status').val(),
			sounds: sounds
		};

		console.log(profile);

		socket.emit('update-profile', profile);

		socket.on('update-profile', function (profile) {
			users[profile._id] = profile;
			var user = profile;
			console.log(profile);
			$('[data-_id="' + profile._id + '"]').data('status', profile.status);
			$('[data-_id="' + profile._id + '"]').data('sounds', profile.sounds);
		});
	});

})(jQuery);