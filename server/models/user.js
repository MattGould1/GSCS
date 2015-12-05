var mongoose = require('mongoose');
//user model
var userSchema = new mongoose.Schema({

	username: { type: String, index: true, unique: true, required: true },
	password: { type: String, required: true },
	firstName: String,
	lastName: String,
	email: String,
	picture: String,
	status: { type: String, default: 'I am here' },
	admin: Boolean,
	created: { type: Date, default: Date.now() },
	location: [],
	department: []

});

var User = mongoose.model('User', userSchema);