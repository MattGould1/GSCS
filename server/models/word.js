var mongoose = require('mongoose');

var wordSchema = new mongoose.Schema({
	name: { type: String, index: true, unique: true, required: true },
	location: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Locations' }],
	department: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Departments'}],
	rolesAllowed: [String],
	lastModified: { type: Date, default: Date.now },
	usersAllowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	active: { type: Boolean, default: false },
	data: {
		type: String
	},
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

var Word = mongoose.model('Word', wordSchema);