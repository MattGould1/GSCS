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

	function uploadUserAvatar() {
		var content = $('.my-profile-content');
		var file = content.find('.upload-user-avatar')[0].files[0];

		if (file === undefined) {
			userInfo(false);
			return false;
		}

		if (file.size > 200000) {
			alert('This file is too big! Please choose a smaller one.');
			return false;
		} else {
				var reader = new FileReader();

				reader.readAsDataURL(file);

				reader.onload = function () {

					result = {
						name: file.name,
						type: file.type,
						size: file.size,
						data: reader.result
					};

					//resize the image, this is done async so the callback has to be put inside
					ImageTools.resize(file, {
						width: 160, // maximum width
						height: 120 // maximum height
						}, function(blob, didItResize) {
						//check s-lazy.js
						if (didItResize) {
							reader.readAsDataURL(blob);
							reader.onload = function() {
								result.thumbnail = reader.result;
								logger('image successfully resized');
								userInfo(result);
							};
						} else {
							logger('image didn\'t resize');
							userInfo(false);
						}
					});
				}
		}
	}

	function userInfo(result) {

		console.log('start saving profile');
		var content = $('.my-profile-content');
		var sounds = content.find('.my-profile-sounds').is(':checked');

		profile = {
			username: content.find('.my-profile-username').val(),
			firstName: content.find('.my-profile-firstname').val(),
			lastName: content.find('.my-profile-lastname').val(),
			status: content.find('.my-profile-status').val(),
			sounds: sounds
		};

		profile.avatar = result;

		console.log(profile);

		socket.emit('update-profile', profile);
	}

	$('#my-profile').on('click', '.save-profile', function() {

		uploadUserAvatar();

	});

})(jQuery);