module.exports = {
	/*
	* @param Model ChatRoom
	* @param Model ChatMessage
	*/
	message: function(sio, socket, ChatRoom, ChatMessage, users, socketss) {
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
			console.log(msg);

			//handle private chat msgs differently to normal
			if (msg.pc === false) {
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
			} else if (msg.pc === true) {
				//create the new message
				var newMsg = new ChatMessage({
					_user: socket.decoded_token._id,
					_to: msg.to.to,
					username: socket.username,
					message: message
				});

				newMsg.save( function (err, savedMsg) {
					if (err) { console.log('Error saving private message' + err); }
			
					//update msg object
					msg.username = socket.username;
					console.log(msg);
					//emit to my partner
					sio.sockets.to(msg.to.to).emit('chat-message', msg);
					// //emit to me
					//sio.sockets.to(socket.decoded_token._id).emit('chat-message', msg);
				});
			}
		});
	},
	/*
	*	@param Object users global list of users, holds all user information
	*/
	userList: function(sio, socket, users) {
			sio.sockets.emit('userList', users);
	},
	/*
	* 	Create a private room for chatting 
	*/
	privatechat: function (sio, socket, socketss, ChatMessage, users) {
		socket.on('privatechat', function (connect) {
			console.log(socket.decoded_token._id);
			console.log(connect.partner._id);
			var query = ChatMessage
							.find({})
							.where('_to').in([socket.decoded_token._id, connect.partner._id])
							.sort({_id: -1})
							.limit(30);

			query.exec(function (err, messages) {
				//info required for the client, me will = you, on the partners side unique is the link between the to
				var info = {
					me: users[socket.username],
					partner: connect.partner,
					unique: connect.unique,
					messages: messages
				};
 
				//only emit to your partner @TODO consider later
				sio.sockets.to(connect.partner._id).emit('joinprivatechat', info);

				//emit to me
				sio.sockets.to(socket.decoded_token._id).emit('joinprivatechat', info);
			});
		});
	},
	/*
	*	get private messages
	*/
	getPrivateMessages: function (sio, socket, ChatMessage) {
		socket.on('getprivatemessages', function (data) {
			console.log(data);
		});
	}
};