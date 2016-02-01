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
		$('#chat').on('click', '.image-upload', function (e) {
			e.preventDefault();
			console.log('click');
			var $this = $(this);
			var file = $this.parent().parent().siblings('.message-info').find('.file').click();
		});
		$('#chat').on('change', '.file', function (e) {
			var $this = $(this);
			var file = $this.context.files[0];
			$this.parent().parent().parent('.row').siblings('.radios-meta').find('.filestoupload').text('uploading: ' + file.name);
		});
		$('#app').off().on('submit', form, function (e) {
			e.preventDefault();
			var $this = $(this);
			var pc = false;
			var to = false;
			var me = false;
			var unique = false;
			function uploadImage(callback) {
				if ($this.find('.file')[0].files.length != 0) {

					var ufile = $this.find('.file')[0].files[0];
					var reader = new FileReader();
					var hmm = reader.readAsDataURL(ufile);
					reader.onload = function() {
						var dataURL = reader.result;
				      	console.log(ufile);
				      	file = {
				      		name: ufile.name,
				      		type: ufile.type,
				      		size: ufile.size,
				      		data: dataURL
				      	};
				      	callback(file);
					};
				} else {
					callback();
				}
			}

			function prepareMessage(file) {
				console.log(file);
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
						to: to,
						unique: unique
					},
					file: file
				};

				if ( $this.find('.private').val() == 'private' ) {
					var message = $this.find('.message').val();
					var chatroom = $this.parent().parent('.private-chat');
					message = message.replace(/<(?:.|\s)*?>/g, "");
					message = message.replace(/\[url\](?:.*\/\/||www\.)(.*(?:\.com|\.co|\.uk|\.us|\.io|\.is).*)\[\/url\]/gi, "<a href='//$1' target='_blank'>$1</a>")
					//allow colors
					message = message.replace(/\[c\=\"(.*)\"\](.*)\[\/c\]/gi, '<span style="color: $1">$2</span>');
					//wrap message in its type
					message = '<span class="' + $this.find('input[name="msgType"]:checked') + '">' + message + '</span>';
					message = '<li><div class="message-name">' + user.username + ':</div><div class="message-body">' + message + '</div><div class="message-time">' + Date.now() + '</div></li>';
					chatroom.find('.chat-messages ul').append(message);
					chatroom.find('.message').val('');
					chatroom.find('.reset-radio').prop('checked', true);
					chatToBottom.call(this, data.find('.chat-messages'));
				}

				//send to server, emits to all if public if private chat only emits to partner
				logger('sending message');
				socket.emit('chat-message', msg);

				//regardless of success disable message for half a second
				$this.find('button').prop('disabled', true);

				setTimeout(function() {
					$this.find('button').prop('disabled', false);
				}, 1000);
			}
			uploadImage(prepareMessage);
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
	msg = '<li><div class="message-name">' + message.username + ':</div><div class="message-body">' + message.message + '</div><div class="message-time">' + Date.now() + '</div></li>';
				

			//private chat?
			if ( message.pc === true ) {
				var chatroom = $('#' + message.me._id);

				//make room if it doesn't exist
				if (chatroom.length == 0) {
					logger('room doesn\'t exist');
					//is chatroom visible?
					if ( chatroom.is(':visible') ) {
						console.log('not visible atm');
					}

					var app = $('#app');

					//html
					var chatroom = $($.parseHTML(ui.privateChatRoom()));
					
					//give some information for socketio
					chatroom.addClass('.' + user._id);

					chatroom.attr('id', message.me._id);	
					chatroom.attr('data-to', message.me._id);
					app.append(chatroom);
					room = {
						partner: message.me._id
					}
					socket.emit('getprivatemessages', room);

					socket.on('receiveprivatemessages', function (messages) {
						var messages = appendMessages.call(this, messages);
						chatroom.find('.chat-messages ul').append(messages);

						var container = chatroom.find('.chat-messages');

						container.scrollTop(container[0].scrollHeight);
					});
				} else {
					//add the message
					chatroom.find('.chat-messages ul').append(msg);
						var container = chatroom.find('.chat-messages');

						container.scrollTop(container[0].scrollHeight);
				}

				if ( !chatroom.is(':visible')) {
					var chatPartner = $('[data-_id="' + message.me._id + '"]');
					var badge = chatPartner.find('.messageCount');
					var count = +badge.html();
					badge.html(count + 1);
				}

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
			}
			//empty chat message + reset type
			chatroom.find('.message').val('');
			chatroom.find('.file').val('');
			chatroom.find('.filestoupload').text('');
			chatroom.find('.reset-radio').prop('checked', true);
			
		});
	}

	/*
	*	Uses ui.js to generate html for private chat
	*/
	function initPrivateChat() {
		$('#app').on('click', '.user', function () {
			//my partner
			partner = $(this).data();

			//check if there's a message count
			if ( $(this).find('.messageCount').html() > 0) {
				//set it to zero
				$(this).find('.messageCount').html('');

				socket.emit('pcreadmessages', partner._id);
			}

			//check if ur tryin to chat with yourself
			if ( user.username === partner.username ) {
				alert('Opps you cannot chat with yourself! Click another user!');
				return false;
			}

			$('.private-chat').hide();
			
			//chat is already open so no need to open a new one
			if ( $('[data-to="' + partner._id + '"]').length == 1 ) {
				$('.private-chat').hide();
				$('[data-to="' + partner._id + '"]').show();
				return false;
			}

			//send this to the server, used by your partner to create room with the same unique id
			var connect = {
				partner: partner
			};

			//add the room to the app rather than chat, keep things cleaner and easier to maintain looking forward @TODO consider redoing later
			var app = $('#app');

			//create jQuery object @SEE ui.js
			var room = $($.parseHTML(ui.privateChatRoom()));

			//add a class to the chatroom, this is used by us on the client side
			room.addClass(user._id);

			//add the partnets message to the room, used to send message to his socket
			room.attr('id', partner._id);
			room.attr('data-to', partner._id);

			//add jquery object to the dom
			app.append(room);

			chatToBottom.call(this, room.find('.chat-messages'));
			//create a private room on server and invite your partner
			socket.emit('privatechat', connect);
		});

		/*
		*	@param Object join: contains me (partner) and unique (id) between both you and your partner
		*/
		socket.on('joinprivatechat', function (join) {
			logger('hmm');
			logger(join);
			messages = '';

			//
			var messages = appendMessages.call(this, join.messages);

			//this shouldn't be possible, but hey, lets make sure @SEE initPrivatechat() function
			if ($('.' + user._id).length > 0) {
				logger('alrdy open');
				$('.' + user._id).find('.chat-messages ul').append(messages);
			} else {
				logger('creating room');
				//my partner, is actually the user who clicked .user
				partner = join.me;

				//app
				var app = $('#app');

				//html
				var room = $($.parseHTML(ui.privateChatRoom()));

				//give some information for socketio
				room.addClass(user._id);

				//set up the meta for socketio
				room.attr('id', partner._id);
				room.attr('data-to', partner._id);

				//append msgs and add room to dom
				room.find('.chat-messages ul').append(messages);
				app.append(room);
				//finally hide the room, no messages yet so don't popup
				room.hide();

				chatToBottom.call(this, room.find('.chat-messages ul'));
			}
		});

		socket.on('getprivatemessages', function (messages) {
			console.log(messages);
		});

		$('#app').on('click', '.glyphicon-remove', function () {
			$(this).parent().parent().parent().parent('.private-chat').hide();
			logger('hide private chat');
		});
	}

	function chatToBottom(container) {
		logger(container);
		container.scrollTop(container[0].scrollHeight);
	}
	function getRoom() {

	}
	function validate() {

	}

	function appendMessages(messages) {
		var msgs = '';

		messages.reverse().forEach( function (message) {
			msgs += '<li>' + message.username + ': ' + message.message + '</li>';
		});

		return msgs;
	}

})(jQuery);