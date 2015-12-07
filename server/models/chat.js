var mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({

	name: { type: String, index: true, unique: true, required: true },
	location: [],
	department: [],
	rolesAllowed: [],
	_messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }]

});
//chat message
var chatSchema = new mongoose.Schema({

	created: { type: Date, default: Date.now() },
	_room: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true }],
	_user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } ],
	message: { type: String, required: true }

});

var ChatRoom = mongoose.model('ChatRoom', roomSchema);
var ChatMessage = mongoose.model('ChatMessage', chatSchema);