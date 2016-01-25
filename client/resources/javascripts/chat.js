// send chat messages with socketio and jquery
(function ($) {

	this.ewbChat = function () {

		//the form to attach events to
		var options = {
			form: null,
		};

		if ( arguments[0] && typeof arguments[0] === "object" ) {
			this.options = extendDefaults(options, arguments[0]);
		}
	}

	//public methods
	ewbChat.prototype.init = function () {
		var form = this.options.form;
		send.call(this, form);
		receive.call(this);
		initPrivateChat.call(this);
	}

	//private methods
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

	/*
	* @param form: jQuery form for submit event
	* use socketio to emit chat-message to server
	*/
	function send(form) {
		$('#app').off().on('submit', form, function (e) {
			e.preventDefault();

			var $this = $(this);
			var pc = false;
			var to = false;
			var me = false;
			var unique = false;
			if ($this.find('.message').val() == '') {
				return false;
			}

			if ($this.find('.private').val() == 'private') {
				console.log('hmm');
				var data = $this.parent().parent('.private-chat');
				pc = true;
				to = data.attr('data-to');
				toName = data.attr('data-to-name');
				unique = data.attr('id');
				me = user;
			}

			//message object to send to server
			msg = {
				_id: $this.find('.name').val(),
				type: $this.find('input[name="msgType"]:checked').val(),
				message: $this.find('.message').val(),
				pc: pc,
				me: me,
				to: {
					unique: unique
				}
			};
			logger('sending message');
			socket.emit('chat-message', msg);

			//regardless of success disable message for half a second
			$this.find('button').prop('disabled', true);

			setTimeout(function() {
				$this.find('button').prop('disabled', false);
			}, 1000);
		});
	}

	/*
	* receive chat message and append it to the chatroom
	*/
	function receive() {
		/*
		* @param Object message: _id = chatroom._id, message, chatroom.room, user.username
		*/
		socket.on('chat-message', function (message) {
			console.log(message);
			//build message, include na
			msg = '<li>' + message.username + ': ' + message.message + '</li>';

			//private chat?
			if ( message.pc === true ) {
				var unique = message.to.unique;
				var chatroom = $('#' + unique);
				if (chatroom.length == 0) {
					//is chatroom visible?
					if ( !chatroom.is(':visible') ) {
						console.log('not visible atm');
					}

					socket.emit('getprivatemessages', message.me);
					var app = $('#app');
					//html
					var chatroom = $($.parseHTML(ui.privateChatRoom()));
					//give some information for socketio
					chatroom.addClass(message.to.unique);
					chatroom.attr('id', unique);	
					chatroom.attr('data-unique', message.to.unique);
					app.append(chatroom);
				}
				chatroom.find('.chat-messages ul').append(msg);
			} else {
				//jquery append
				var chatroom = $('[data-filter="' + message.room + '-chat"]');
				chatroom.find('.chat-messages ul').append(msg);
				//scroll to bottom
				var container = $('[data-filter="' + message.room + '-chat"').find('.chat-messages');

				//add message count to chatroom if not visible (not looking @ it)
				if (!container.is(':visible')) {
					var badge = chatroom.find('.messageCount');
					var count = +badge.html();
					badge.html(count + 1);				
				}

				container.scrollTop(container[0].scrollHeight);
				//empty chat message + reset type
				chatroom.find('.message').val('');
				chatroom.find('.reset-radio').prop('checked', true);
			}
		});
	}

	/*
	*	Uses ui.js to generate html for private chat
	*/
	function initPrivateChat() {
		$('#app').on('click', '.user', function () {

			//get me and this user, to create the room
			me = user;
			partner = $(this).data();

			//create a unique string, maybe use username in future? @TODO consider later
			var unique = me._id + partner._id;

			//check if ur tryin to chat with yourself
			if ( me.username === partner.username ) {
				alert('Opps you cannot chat with yourself! Click another user!');
				return false;
			}

			//chat is already open so no need to open a new one
			if ( $('[data-to-name="' + partner.username + '"]').length == 1 ) {
				$('[data-to-name="' + partner.username + '"]').show();
				return false;
			}

			//send this to the server, used by your partner to create room with the same unique id
			var connect = {
				partner: partner,
				unique: unique
			};

			//add the room to the app rather than chat, keep things cleaner and easier to maintain looking forward @TODO consider redoing later
			var app = $('#app');

			//create jQuery object @SEE ui.js
			var room = $($.parseHTML(ui.privateChatRoom()));

			//add meta to the jquery object, used to validate and determine who's who
			room.addClass(unique);
			room.attr('id', unique);
			room.attr('data-to-name', partner.username);

			//add jquery object to the dom
			app.append(room);

			//create a private room on server and invite your partner
			socket.emit('privatechat', connect);
		});

		/*
		*	@param Object join: contains me (partner) and unique (id) between both you and your partner
		*/
		socket.on('joinprivatechat', function (join) {
			logger(join);
			messages = '';
			join.messages.forEach( function (message) {
				messages += '<li>' + message.username + ': ' + message.message + '</li>';
			});

			//this shouldn't be possible, but hey, lets make sure @SEE initPrivatechat() function
			if ($('div[data-to-name="' + join.partner.username + '"]').length > 0 || $('div[data-to-name="' + join.me.username + '"]').length > 0) {
				logger('alrdy open');
				$('div[data-to-name="' + join.partner.username + '"]').find('.chat-messages ul').append(messages);
				$('div[data-to-name="' + join.me.username + '"]').find('.chat-messages ul').append(messages);
			} else {

				//me and my partner
				me = user;
				you = join.me;

				//create unique reverse of jquery .user click 
				var unique = join.unique;

				//app
				var app = $('#app');

				//html
				var room = $($.parseHTML(ui.privateChatRoom()));

				//give some information for socketio
				room.addClass(unique);
				room.attr('id', unique);
				room.attr('data-to-name', you.username);

				room.find('.chat-messages ul').append(messages);
				app.append(room);
				
			}
		});

		socket.on('getprivatemessages', function (messages) {
			console.log(messages);
		});

		$('#app').on('click', '.glyphicon-remove', function () {
			$(this).parent().parent().parent('.private-chat').hide();
			logger('hide private chat');
		});
	}

	function getRoom() {

	}
	function validate() {

	}

})(jQuery);