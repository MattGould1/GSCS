(function ($) {

	this.users = function () {

	}

	users.prototype.load = function () {
		/*
		* @param Object userList: contains a list of users that are Objects
		*/
		socket.on('userList', function (userList) {
			//remove current list
			$('.user').remove();

			//update global users var
			users = userList;
			//get username from each user
			for (var key in userList) {
				if (userList.hasOwnProperty(key)) {
					var user = userList[key];
					logger(user);
					var html = '<div class="user"' +
									'data-admin="' + user.admin + '"' +
									'data-_id="' + user._id + '"' +
									'data-department="' + user.department + '"' +
									'data-location="' + user.location + '"' +
									'data-email="' + user.email + '"' +
									'data-firstname="' + user.firstName + '"' +
									'data-lastname="' + user.lastName + '"' +
									'data-online="' + user.online + '"' +
									'data-status="' + user.status + '"' +
									'data-username="' + user.username + '"' +
									'>' + user.username + '</div>';
					$('.users').append(html);
				}
			}
		});
		/*
		* @param Object user: a user who has dc'd
		* use this to cleanup app for a single user disconnect
		*/
		socket.on('leave', function (user) {
			$('.private-chat').each( function () {
				if ($(this).attr('class').indexOf(user._id) !== -1) {
					logger ('this user has disconnected!');
					$(this).find('.pc-header').append('<li>' + user.username + ' has disconnected!');
				}
			});
		});

	}
})(jQuery);
