module.exports = {
	/*
	* @param Model ChatRoom
	* @param Model ChatMessage
	*/
	message: function(sio, socket, ChatRoom, ChatMessage) {
		/*
		* @param Object msg: _id: ChatRoom._id, type: type of message, message: client message
		*/
		socket.on('chat-message', function (msg) {
			//remove html/script tags
			var message = msg.message;

			//remove html/<script> tags
			var message = message.replace(/<(?:.|\s)*?>/g, "");
			//allow links
			var message = message.replace(/\[url\](?:.*\/\/||www\.)(.*(?:\.com|\.co|\.uk|\.us|\.io|\.is).*)\[\/url\]/gi, "<a href='//$1' target='_blank'>$1</a>")
			//allow colors
			var message = message.replace(/\[c\=\"(.*)\"\](.*)\[\/c\]/gi, '<span style="color: $1">$2</span>');
			//wrap message in its type
			var message = '<span class="' + msg.type + '">' + message + '</span>';
			//add message back to msg Object
			msg.message = message;

			//find chatroom, and create chatmessage and save both, emit back to clients (including sender)
			ChatRoom.findOne({ _id: msg._id }, function (err, chatroom) {
				if (err) { console.log ('error finding chatroom ' + msg._id + 'error: ' + err); }

				var newMsg = new ChatMessage({
					_room: msg._id,
					_user: socket.decoded_token._id,
					username: socket.username,
					message: message
				});

				newMsg.save(function (err, savedMsg) {
					if (err) { console.log('error saving message' + err); }
					//push ChatMessage id into chatroom _messages array
					chatroom._messages.push(savedMsg._id);
					//save chatroom
					chatroom.save(function (err, success) {
						if (err) { console.log ('Error saving chatroom after message push' + err); }

						//update msg object and send back to client
						msg.room = chatroom.name;
						msg.username = socket.username;

						sio.sockets.to(chatroom._id).emit('chat-message', msg);
					});
				});
			});
		});
	},
	/*
	*	@param Object users global list of users, holds all user information
	*/
	userList: function(sio, socket, users) {
			sio.sockets.emit('userList', users);
	}
};