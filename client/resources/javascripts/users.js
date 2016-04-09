(function ($) {

	this.usersO = function () {

	}

	usersO.prototype.lastActive = function() {
		//measured in seconds
		idle = 0;

		//events that reset the idle timer
		window.onmousemove = resetTimer;
	    window.onmousedown = resetTimer; // catches touchscreen presses
	    window.onclick = resetTimer;     // catches touchpad clicks
	    window.onkeypress = resetTimer;

	    setInterval(setTimer, 60000);
	    
	    //increment idle time, and send update to server if necessary
	    function setTimer() {
	    	idle++;
	    	//send server update for every 5 mins of inactivity
	    	mins = idle / 5;

	    	if (mins % 1 === 0 && mins >=	 1) {
	    		
	    		socket.emit('inactive', { _id: user._id, idle: mins });
	    	}
	    	//each mins is 5, so 60 mins and force logout
	    	if (mins > 12) {
	    		$('.logout').trigger('click');

	    		setTimeout(function () {
	    			window.location.reload();
	    		}, 1000);
	    	}
	    }
		//reset idle var
	    function resetTimer() {
	    	if (idle != 0) {
	    		socket.emit('active', user._id );
	    	}
	    	idle = 0;
	    }
	    /*
	    *	Object time = user._id and idle time (5 mins per 1 idle)
	    */
		socket.on('inactive', function (time) {
			//every 1 idle == 5 mins @TODO use momentjs later?
			var idleTime = time.idle * 5;

			$('[data-_id="' + time.user + '"]').data('lastactive', idleTime + ' Mins Ago');
		});

		socket.on('active', function (_id) {
			$('[data-_id="' + _id + '"]').data('lastactive', 'Now!');
		});
	}

	usersO.prototype.load = function () {
		userList.call(this);
		userLeave.call(this);
		userInfo.call(this);
		status.call(this);
	}

	function userList() {
		/*
		* @param Object userList: contains a list of users that are Objects
		*/
		socket.on('userList', function (userList) {
			setTimeout( function() {
				logger('updated user list');
				//remove current list
				$('.people-online').find('.user').remove();
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

						var html = '<div class="user ' + user.online + '"' +
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
										'data-sounds="' + user.sounds + '"' +
										'data-lastactive="Now!"' +
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
	}

	function userLeave() {
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
							'data-lastactive="' + user.lastlogin + '"' +
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

	function userInfo() {
		$('.users').on('mouseenter mouseleave', '.user',
			function (e) {
				var info = $('.userinfo'),
					$this = $(this),
					data = $this.data(),
					position = $this.offset();
				if (e.type === 'mouseenter') {
					info.html('');
					var userinfo = '<div class="my-lastactive">Last Active: ' + data.lastactive + '</div>' +
								   '<div class="my-status">Status: ' + data.status + '</div>' +
								   '<div class="my-email">Email: ' + data.email + '</div>';
					info.append(userinfo);
					info.show();
					info.css({
						'top': position.top + 20,
						'left': position.left
					});
				} else {
					info.hide();
				}
			}
		);
	}

	function status() {
		$('#header').on('click', '.onlinestatus', function() {
			var status = $(this).html();
			var info = {
				_id: user._id,
				status: status
			};
			socket.emit('onlinestatus', info);
		});

		socket.on('updatestatus', function (status) {
			$('[data-_id="' + status.user._id + '"]').removeClass(status.old).addClass(status.user.online);
		});
	}
})(jQuery);
