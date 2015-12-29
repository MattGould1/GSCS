module.exports = {
	message: function(sio, socket, ChatRoom, ChatMessage) {
		/*
		*
		* msg object = room + message
		*
		*/
		socket.on('chat-message', function(msg) {
			//remove html/script tags
			var message = msg.message;

			//remove html/<script> tags
			var message = message.replace(/<(?:.|\s)*?>/g, "");
			//allow links
			var message = message.replace(/\[url\](?:.*\/\/||www\.)(.*(?:\.com|\.co|\.uk|\.us|\.io|\.is).*)\[\/url\]/gi, "<a href='//$1' target='_blank'>$1</a>")
			//allow colors
			var message = message.replace(/\[c\=\"(.*)\"\](.*)\[\/c\]/gi, '<span style="color: $1">$2</span>');

			msg.message = message;
			//save message
			ChatRoom.findOne({ _id: msg._id }, function (err, chatroom) {
				if (err) { console.log ('error finding chatroom ' + msg._id + 'error: ' + err); }

				var newMsg = new ChatMessage({
					_room: msg._id,
					_user: socket._id,
					username: socket.username,
					message: message
				});

				newMsg.save(function (err, smsg) {
					if (err) { console.log('error saving message' + err); }

					chatroom._messages.push(smsg._id);
					chatroom.save(function (err, success) {
						msg.room = chatroom.name;
						msg.username = socket.username;
						sio.sockets.emit('chat-message', msg);
					});
				});
			});
		});
	},
	usernames: function(sio, socket, users) {
		sio.sockets.emit('usernames', Object.keys(users));
	}
};