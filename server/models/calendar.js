var mongoose = require('mongoose');

var calendarSchema = new mongoose.Schema({
	//_id: { type: String, required: true },
	title: { type: String, required: true },
	description: { type: String },
	start: { type: String },
	end: { type: String },
	user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	username: {type: String },
	edit_username: {type: String},
});

var Calendar = mongoose.model('Calendar', calendarSchema);