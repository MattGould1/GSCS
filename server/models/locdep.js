var mongoose = require('mongoose');

var locationSchema = new mongoose.Schema({
	locations: { type: String, index: true, unique: true, required: true }
});

var departmentSchema = new mongoose.Schema({
	departments: { type: String, index: true, unique: true, required: true }
});

var Locations = mongoose.model('Locations', locationSchema);
var Departments = mongoose.model('Departments', departmentSchema);


locationSchema.pre('remove', function (next){
    this.model('ChatRoom').update(
        {location: this._id}, 
        {$pull: {location: this._id}}, 
        {multi: true},
        next
    );
    this.model('Excel').update(
    	{location: this._id},
    	{$pull: {location: this._id}},
    	{multi: true},
    	next
    );
    this.model('User').update(
    	{location: this._id},
    	{$pull: {location: this._id}},
    	{multi: true},
    	next
    )
});
departmentSchema.pre('remove', function (next){
    this.model('ChatRoom').update(
        {department: this._id}, 
        {$pull: {department: this._id}}, 
        {multi: true},
        next
    );
    this.model('Excel').update(
    	{department: this._id},
    	{$pull: {department: this._id}},
    	{multi: true},
    	next
    );
    this.model('User').update(
    	{department: this._id},
    	{$pull: {department: this._id}},
    	{multi: true},
    	next
    );
});
