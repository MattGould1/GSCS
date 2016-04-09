module.exports = {
	init: function (cUser, ChatRoom, Excel, ChatMessage, User, Word, socket) {
        //@TODO implement better method of sending data, atm chat should be prioritised look @FUTURE
        //connection data
        ChatRoom.find({ location: cUser.location, department: cUser.department }).populate({ path: '_messages', options: { limit: 40, sort: { 'created': -1 } }}).exec(function (err, chatrooms) {
            if (err) { console.log('socketio error finding chatrooms' + err); socket.emit('data', false); return false; }
            Excel.find({ location: cUser.location, department: cUser.department }).populate('user').exec(function (err, excelsheets) {
                if (err) { console.log('socketio error finding excelsheets' + err); socket.emit('data', false); return false; }
                ChatMessage.find()
                    .where('_to').equals(socket.decoded_token._id)
                    .where('read').equals(false)
                    .exec(function (err, unreadMessages) {
                        if (err) { console.log('socketio error finding unread chat messages' + err); socket.emit('data', false); return false; }
                        User.find()
                            .select('username status email online lastlogin')
                            .exec( function (err, names) {
                                Word.find({ location: cUser.location, department: cUser.department })
                                    .exec( function (err, words) {
                                        //emit data
                                        var data = {
                                            chatrooms: chatrooms,
                                            excelsheets: excelsheets,
                                            words: words,
                                            user: cUser,
                                            users: names,
                                            unread: unreadMessages
                                        };
                                        chatrooms.forEach(function (chatroom) {
                                            socket.join(chatroom._id);
                                        });
                                        excelsheets.forEach(function (excelsheet) {
                                            socket.join(excelsheet._id);
                                        });
                                        words.forEach(function (word) {
                                            socket.join(word._id);
                                        });
                                        socket.emit('data', data);
                                    });
                        });
                });
            });
        });
	}
};