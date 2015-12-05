//chat model
var chatSchema = new mongoose.Schema({

	name: { type: String, index: true, unique: true, required: true },
	status: String,
	created: { type: Date, default: Date.now() },
	rolesAllowed: [],
	location: [],
	department: [],
	message: { type:String, required: true }

});

var Chat = mongoose.model('Chat', chatSchema);