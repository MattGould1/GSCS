var mongoose = require('mongoose');
//user model
var userSchema = new mongoose.Schema({

	username: { type: String, index: true, unique: true, required: true },
	password: { type: String, required: true },
	firstName: String,
	lastName: String,
	email: String,
	picture: String,
	status: { type: String, default: 'Hey, what\'s up?' },
	online: { type: String, default: 'online' },
	lastActivity: { type: Number },
	lastlogin: { type: Date, default: Date.now() },
	admin: Boolean,
	created: { type: Date, default: Date.now() },
	location: { type: mongoose.Schema.Types.ObjectId, ref: 'Locations' },
	department: { type: mongoose.Schema.Types.ObjectId, ref: 'Departments'},
	_messages:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }],
	options: { 
		sounds: { type: Boolean, default: true }
	}

});

var User = mongoose.model('User', userSchema);