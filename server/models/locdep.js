var mongoose = require('mongoose');

var locationSchema = new mongoose.Schema({
	'locations': { type: String, index: true, unique: true, required: true }
});

var departmentSchema = new mongoose.Schema({
	'departments': { type: String, index: true, unique: true, required: true }
});

var Locations = mongoose.model('Locations', locationSchema);
var Departments = mongoose.model('Departments', departmentSchema);