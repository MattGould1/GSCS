//chat room
var excelSchema = new mongoose.Schema({

	name: { type: String, index: true, unique: true, required: true },
	location: [],
	department: [],
	rolesAllowed: [],
	usersAllowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	data: [],
	settings: [],
	revisions: [],
	active: [{ type: mongoose.Schema.Types.Objectid, ref: 'User' }],
	lastEditted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

});


var Excel = mongoose.model('Excel', excelSchema);