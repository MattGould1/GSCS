module.exports = {
	message: function(sio, socket,messages) {
		/*
		*
		* msg object = room + message
		*
		*/
		socket.on('chat-message', function(msg) {
			//remove html/script tags
			console.log(msg);
			var room = msg.room;
			var message = msg.message;

			var message = message.replace(/<(?:.|\s)*?>/g, "");
			//allow links
			var message = message.replace(/\[url\](?:.*\/\/||www\.)(.*(?:\.com|\.co|\.uk|\.us|\.io|\.is).*)\[\/url\]/gi, "<a href='//$1' target='_blank'>$1</a>")
			//allow colors
			var message = message.replace(/\[c\=\"(.*)\"\](.*)\[\/c\]/gi, '<span style="color: $1">$2</span>');
			//save message

			sio.sockets.emit('chat-message', msg);
			
		});
	},
	usernames: function(sio, socket, users) {
		sio.sockets.emit('usernames', Object.keys(users));
	}
};