// send chat messages with socketio and jquery
(function ($) {

	this.ewbChat = function () {

		//the form to attach events to
		var options = {
			form: null
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
		loadMoreMessages.call(this);
		filter.call(this);
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
	* read an input and add a preview image
	*/
	function readURL(input, container) {

		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				var preview = container.find('.preview');
				preview.attr('src', e.target.result);
				preview.show();
			}

			reader.readAsDataURL(input.files[0]);
		}
	}

	/*
	* @param form: jQuery form for submit event
	* use socketio to emit chat-message to server
	*/
	function send(form) {
		$('#chat').on('click', '.image-container', function () {
			var $this = $(this);
			var input = $(this).siblings('.file').val('');

			var container = $this.parent();

			container.find('.message').css({
				'width': '100%'
			});
			container.find('.image-container').css({
				'display': 'none'
			});
		});
		//get the image ready for uploading
		$('#chat').on('click', '.image-upload', function (e) {
			e.preventDefault();
			logger('finding a file');
			var $this = $(this);
			var file = $this.parent().parent().siblings('.message-info').find('.file').click();
		});

		$('#chat').on('change', '.file', function (e) {
			var $this = $(this);
			var file = $this.context.files[0];
			console.log(file);

			if (file.type === 'image/png' || file.type === 'image/jpeg') {
				$this.parent().parent().parent('.row').siblings('.radios-meta').find('.filestoupload').text('uploading: ' + file.name);
				var container = $this.parent().parent();
				if (!container.find('.image-container').is(':visible')) {
					var messageBox = container.find('.message');
					var width = messageBox.width() - 36;
					var cssWidth = width + 'px';
					console.log(cssWidth);
					container.find('.message').css({
						'width': cssWidth,
						'display': 'inline',
						'float': 'left'
					});
					container.find('.image-container').css({
						'display': 'block'
					});
				}
				readURL.call(this, this, container);
			} else {
				alert('This file type is not allowed!');
				$this.val('');
				return false;
			}
		});

		$('#app').off().on('submit', form, function (e) {
			e.preventDefault();
			var $this = $(this);
			//prepare an image for uploading, callback send the message
			prepareImage.call(this, sendMessage, $this);
		});
	}

	/*
	*	@Function callback: prepares the message to be updated with a file
	* 	@jQuery $this: form's $(this);
	*/
	function prepareImage(callback, $this) {
		//check if there are any files @TODO fix privatechat
		if ($this.find('.file')[0] == undefined) {
			callback.call(this, $this);
			return false;
		}
		if ($this.find('.file')[0].files.length != 0 ) {
			//read the first file @TODO multiple file uploads?
			var ufile = $this.find('.file')[0].files[0];
			//@TODO check for max file size
			if (ufile.size > 2000000) {
				alert('Sorry but that image is massive! Could you please reduce the size?');
				return false;
			}
			if (ufile.type === 'image/png' || ufile.type === 'image/jpeg') {

			}
			var reader = new FileReader();
			
			reader.readAsDataURL(ufile);
			//read the file sync, don't wanna fire the upload until the image has been read
			reader.onload = function() {

				//@TODO validation for images, maybe pdf's etc?
		      	file = {
		      		name: ufile.name,
		      		type: ufile.type,
		      		size: ufile.size,
		      		data: reader.result
		      	};

		      	//resize the image, this is done async so the callback has to be put inside
		      	ImageTools.resize(ufile, {
			        width: 160, // maximum width
			        height: 120 // maximum height
			    }, function(blob, didItResize) {
			    	//check s-lazy.js
			    	if (didItResize) {
			    		reader.readAsDataURL(blob);
						reader.onload = function() {
							file.thumbnail = reader.result;
							logger('image successfully resized');
							callback.call(this, $this, file);
						};
			    	}  else {
			    		logger('image didn\'t resize');
			    		callback.call(this, $this, file);
			    	}
			    });
		      	
			};
		} else {
			callback.call(this, $this);
		}
	}
	/*
	*	@file blob Object with thumbnail property
	* 	$this jQuery's form $(this)
	*/
	function sendMessage($this, file) {
		var pc = false;
		var to = false;
		var me = false;
		var unique = false;
		var chatroom = $this;

		if (chatroom.find('.message').val() == '' && file == undefined) {
			alert('Please enter a value or upload a file!');
			return false;
		}

		if ($this.find('.private').val() == 'private') {
			logger('private message');
			var data = $this.parent().parent('.private-chat');
			pc = true;
			to = data.attr('data-to');
			toName = data.attr('data-to-name');
			unique = data.attr('id');
			me = user;
		}

		//message object to send to server
		msg = {
			_id: chatroom.find('.name').val(),
			type: chatroom.find('input[name="msgType"]:checked').val(),
			message: chatroom.find('.message').val(),
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
			var privatechatroom = $this.parent().parent('.private-chat');

			message = message.replace(/<(?:.|\s)*?>/g, "");
			message = message.replace(/(?:.*\/\/||www\.)(.*(?:\.com|\.co|\.uk|\.us|\.io|\.is).*)/gi, "<a href='//$1' target='_blank'>$1</a>")
			//allow colors
			message = message.replace(/\[c\=\"(.*)\"\](.*)\[\/c\]/gi, '<span style="color: $1">$2</span>');

			var messageObj = {
				private: false,
				message: message,
				file: false,
				thumbnail: false,
				username: user.username,
				created: Date.now(),
				single: true
			};

			message = appendMessages.call(this, messageObj);
			message = uiObj.emotes(message);
			
			privatechatroom.find('.chat-messages ul').append(message);
			privatechatroom.find('.message').val('');
			privatechatroom.find('.reset-radio').prop('checked', true);
			chatToBottom.call(this, data.find('.chat-messages'));
		}
		//send to server, emits to all if public if private chat only emits to partner
		logger('sending message');
		socket.emit('chat-message', msg);

		//regardless of success disable message for half a second and reset to defaults
		chatroom.find('button').prop('disabled', true);
		chatroom.find('.message').val('');
		chatroom.find('.message').css({
			'width': '100%'
		});
		chatroom.find('.image-container').css({
			'display':'none'
		});
		chatroom.find('.file').val('');
		chatroom.find('.filestoupload').text('');
		chatroom.find('.reset-radio').prop('checked', true);

		setTimeout(function() {
			chatroom.find('button').prop('disabled', false);
		}, 1000);
	}

	//beep the user
	function beep() {
		logger('beep');
		var audio = new Audio('sounds/notification.mp3');
		audio.play();
	}

	//change smileys into real ones
	function emoticons() {
		logger('emoticon');
	}
	
	/*
	* receive chat message and append it to the chatroom
	*/
	function receive() {
		/*
		* @param Object message: _id = chatroom._id, message, chatroom.room, user.username
		*/
		socket.on('chat-message', function (message) {
			message.created = Date.now();
			message.single = true;
			var msg = appendMessages.call(this, message);		
			msg = uiObj.emotes(msg);
			//private chat?
			if ( message.pc === true ) {
				var chatroom = $('#' + message.me._id);
				var container = chatroom.find('.chat-messages');
				//make room if it doesn't exist
				if (chatroom.length == 0) {
					logger('creating new privatechat room');
					var app = $('#app');

					//html
					var chatroom = $($.parseHTML(uiObj.privateChatRoom()));
					
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
						container.scrollTop(container[0].scrollHeight);
					});
				} else {
					//add the message
					chatroom.find('.chat-messages ul').append(msg);
					container.scrollTop(container[0].scrollHeight);
				}
				uiObj.activityCount(chatroom, message.me._id, true);
				beep();
			} else {
				logger('normal chat');
				var chatroom = $('[data-filter="' + message.room + '-chat"]');
				chatroom.find('.chat-messages ul').append(msg);
				var container = $('[data-filter="' + message.room + '-chat"').find('.chat-messages');

				//@TODO @mentions
				//if (message.message.indexOf('@' + user.username) != -1) {
				//}
				logger(message);
				if (user.username != message.username) {
					beep();
				}

				//add message count to chatroom if not visible (not looking @ it)
				uiObj.activityCount(container, chatroom);

				if (message.file) {
					setTimeout(function () {
						container.scrollTop(container[0].scrollHeight);
					}, 200);
				} else {
					container.scrollTop(container[0].scrollHeight);
				}
			}
			
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
			var partnerRoom = $('[data-to="' + partner._id + '"]');
			//chat is already open so no need to open a new one
			if ( partnerRoom.length == 1 ) {
				$('.private-chat').hide();
				partnerRoom.show();
				chatToBottom.call(this, partnerRoom.find('.chat-messages'));
				return false;
			}

			//send this to the server, used by your partner to create room with the same unique id
			var connect = {
				partner: partner
			};

			//add the room to the app rather than chat, keep things cleaner and easier to maintain looking forward @TODO consider redoing later
			var app = $('#app');

			//create jQuery object @SEE ui.js
			var room = $($.parseHTML(uiObj.privateChatRoom()));

			//add a class to the chatroom, this is used by us on the client side
			room.addClass(user._id);

			//add the partnets message to the room, used to send message to his socket
			room.attr('id', partner._id);
			room.attr('data-to', partner._id);

			//add jquery object to the dom
			app.append(room);
			room.show();

			chatToBottom.call(this, room.find('.chat-messages'));

			//create a private room on server and invite your partner
			socket.emit('privatechat', connect);
			logger('complete');
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
			var user_room = $('[data-to="' + join.partner._id + '"]');
			//this shouldn't be possible, but hey, lets make sure @SEE initPrivatechat() function
			if (user_room.length > 0) {
				logger('Private chat already opening, appending messages if none exist');
				if (user_room.find('.chat-messages ul').length < 2) {
					user_room.find('.chat-messages ul').append(messages);
				}
				chatToBottom.call(this, user_room.find('.chat-messages'));
			} else {
				logger('creating room');
				//my partner, is actually the user who clicked .user
				partner = join.me;

				//app
				var app = $('#app');

				//html
				var room = $($.parseHTML(uiObj.privateChatRoom()));

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

				chatToBottom.call(this, room.find('.chat-messages'));
			}
		});

		socket.on('getprivatemessages', function (messages) {
			logger('get private messages');
			logger(messages);
		});

		$('#app').on('click', '.glyphicon-remove', function () {
			$(this).parent().parent().parent().parent('.private-chat').hide();
			logger('hide private chat');
		});
	}

	function chatToBottom(container) {
		logger('setting chatroom to bottom');
		container.scrollTop(container[0].scrollHeight);
	}

	function loadMoreMessages() {
		/*
		* Data Object
		* data.room = chatroom._id
		* data.messages = array of chatmessages
		* data.allLoaded = boolean depending on whether there are more messages to load
		*/
		socket.on('moremessages', function (data) {
			//get the chatroom
			var chatroom = $('[data-_id-chat="' + data.room + '"]');
			var container = chatroom.find('.chat-messages');

			//remove the waiting message
			chatroom.find('.chat-waiting').remove();

			//check if there are messages in the data
			if (data.allLoaded == true) {
				if (chatroom.find('.allLoaded').length == 0) {
					var html = '<li class="allLoaded"><div>All of the chat messages have been loaded!</div></li>';
					container.prepend(html);
					chatroom.attr('loaded', 'Null');
				}
				return false;
			}

			//get the old height
			var oldHeight = container[0].scrollHeight;

			//prepend messages
			chatroom.find('.chat-messages ul').prepend(appendMessages.call(this, data.messages));

			//get the current type of filter
			var value = chatroom.find('.filter').val();

			setMessageTypes.call(this, value, chatroom);

			//get the new height
			newHeight = container[0].scrollHeight;

			//set the scroll height
			container.scrollTop(newHeight - oldHeight);
		});
	}

	function setMessageTypes(value, chatroom) {

		if (value == 'normal') {
			chatroom.find('li').show();
		} else {
			chatroom.find('li').each(function () {
				var $this = $(this);
				var type = $this.find('.message-body').find('span').attr('class');

				if (type == value) {
					$this.show();
				} else {
					$this.hide();
				}
			});
		}

	}
	function filter() {
		$('#chat').on('change', '.filter', function () {
			$this = $(this);
			//get the chatroom
			var chatroom = $this.parent().parent().parent().parent().parent().parent().siblings('.chat-messages');
			var value = $this.val();

			setMessageTypes.call(this, value, chatroom);
		});
	}

	function getRoom() {

	}

	function validate() {

	}

	function appendMessages(messages) {
		var msgs = '';
		if (messages.single == true) {
			msgs = uiObj.message(false, messages.message, messages.file, messages.thumbnail, messages.username, messages.created);
		} else {
			messages.reverse().forEach( function (message) {
				msgs += uiObj.message(false, message.message, message.file, message.thumbnail, message.username, message.created);
			});
		}
		return msgs;
	}

})(jQuery);