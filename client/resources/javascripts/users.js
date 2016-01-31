(function ($) {

	this.users = function () {

	}

	users.prototype.load = function () {
		/*
		* @param Object userList: contains a list of users that are Objects
		*/
		socket.on('userList', function (userList) {
			setTimeout( function() {
				//remove current list
				$('.people-online').find('.user').remove();
				console.log(userList);
				//update global users var
				users = userList;
				//get username from each user
				for (var key in userList) {
					if (userList.hasOwnProperty(key)) {
						var user = userList[key];

						//remove from offline
						var offline = $('[data-_id="' + user._id + '"]');
						var offlineMsgs = offline.find('.messageCount').html();
						offline.remove();

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
										'>' + user.username + '<span class="badge messageCount" style="float:right;">' + offlineMsgs + '</span></div>';
						$('.people-online').after(html);
						$('.private-chat').each( function () {
							if ($(this).attr('id').indexOf(user._id) !== -1) {
								$(this).find('.pc-user-status').remove();
							}
						});
					}
				}
			}, 1000);
		});
		/*
		* @param Object user: a user who has dc'd
		* use this to cleanup app for a single user disconnect
		*/
		socket.on('leave', function (otherUser) {
			logger('leave');
			var online = $('[data-_id="' + otherUser._id + '"]');
			var onlineMsgs = online.find('.messageCount').html();
			online.remove();

			var offline = $('.people-offline');
			var html = '<div class="user"' +
							'data-_id="' + otherUser._id + '"' +
							'data-username=" ' + otherUser.username + '">' +
								otherUser.username +
							'<span class="badge messageCount" style="float:right;">' + onlineMsgs + '</span></div>';
			offline.after(html);
			$('.private-chat').each( function () {
				if ($(this).attr('id').indexOf(otherUser._id) !== -1) {
					logger ('this user has disconnected!');

					$(this).find('.pc-hide').after('<div class="pc-user-status">' + otherUser.username + ' is now offline! Messages will be delivered when they login!</div>');
				}
			});
		});
	}
})(jQuery);
