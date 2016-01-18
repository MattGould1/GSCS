var mongoose = require('mongoose');
//chat room
var excelSchema = new mongoose.Schema({

	name: { type: String, index: true, unique: true, required: true },
	location: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Locations' }],
	department: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Departments'}],
	rolesAllowed: [String],
	lastModified: { type: Date, default: Date.now },
	usersAllowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	data: [],
	metaData: {
		colWidths: [],
		rowHeights: [],
		//className, comment
		cellMeta: []
	},
	active: { type: Boolean, default: false },
	settings: [],
	changes: [],
	revisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Revision' }],
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

});

var revisionSchema = new mongoose.Schema({
	revision: { type: Object, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	createdAt: { type: String, default: Date.now }
});

var Revision = mongoose.model('Revision', revisionSchema);
var Excel = mongoose.model('Excel', excelSchema);