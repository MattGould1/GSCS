var mongoose = require('mongoose');

//chat room
var roomSchema = new mongoose.Schema({

	name: { type: String, index: true, unique: true, required: true },
	location: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Locations' }],
	department: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Departments'}],
	rolesAllowed: [],
	usersAllowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	_messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }]

});

//chat message
var chatSchema = new mongoose.Schema({

	created: { type: Date, default: Date.now() },
	_room: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }],
	_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
	username: { type: String, required: true },
	message: { type: String, required: true },
	file: [{ type: String }],
	thumbnail: {type: String},
	read: Boolean

});

var ChatRoom = mongoose.model('ChatRoom', roomSchema);
var ChatMessage = mongoose.model('ChatMessage', chatSchema);