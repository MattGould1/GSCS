var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    User = mongoose.model('User'),
    ChatRoom = mongoose.model('ChatRoom'),
    Excel = mongoose.model('Excel'),
	Locations = mongoose.model('Locations'),
	Departments = mongoose.model('Departments'),
	login = require('./../modules/login'),
    //socketio jwt
    socketioJwt = require('socketio-jwt');

//db
var db = require('./../models/db');

//login
router.post('/', function (req, res) {
	//build chatroom query, get chat room + messages 
	ChatRoom.find({})
			.populate('_messages')
			.exec(function (err, rooms) {

		if(err) { console.log('error finding rooms: ' + err); }
		//rooms holds chat rooms + chat messages for each chatroom

		//get users now
		User.find({})
			.exec(function (err, users) {

			if(err) { console.log('error finding users: ' + err); }

			//get excelsheets
			Excel.find({})
				 .exec( function (err, excels) {
				 if(err) { console.log('Error finding excel sheets: ' + err); }

				 Locations.find({}).exec( function (err, locations) {
				 	Departments.find({}).exec( function (err, departments) {
						res.json({ chat: rooms, users: users, excels: excels, locations: locations, departments: departments });
				 	});
				 });
			});

		});
	});
});
router.post('/locdep', function (req, res) {
	req.body.locations.forEach( function (location, i) {
		var loc = new Locations({
			locations: location
		});
		loc.save( function (err, saved) {

		});
	});

	req.body.departments.forEach( function (department, i) {
		var dep = new Departments({
			departments: department
		});
		dep.save( function (err, saved) {

		});
	});
});

router.post('/locdep/delete', function (req, res) {
	if (req.body.data.type === 'locations') {
		Locations.findOneAndRemove({ locations: req.body.data.value }, function (err, location) {
			location.remove();
		});
	}
	if (req.body.data.type === 'departments') {
		Departments.findOneAndRemove({ departments: req.body.data.value }, function (err, department) {
			department.remove();
		});
	}

});

router.post('/user/update', function (req, res) {
	User.findOne({username: req.body.username} , function (err, user) {
		if (err) { console.log('Error finding user: ' + err); }
		console.log('updating user model...');
		user.password = req.body.password;
		user.firstName = req.body.firstName;
		user.lastName = req.body.lastName;
		user.email = req.body.username;
		user.location = req.body.location;
		user.department = req.body.department;
		user.status = req.body.status;

		user.save( function (err, saved) {
			if (err) { console.log('Error saving user: ' + err); }
			console.log('saved user model');
			res.json(true);
		});
	});
});

router.post('/user/delete', function (req, res) {
	User.findOne({ username: req.body.username }).remove(function (err, deleted) {
		if(err) { console.log('Error deleting user: ' + err); }
		console.log('Deleted user');
		res.json(true);
	});
});

router.post('/user/create', function (req, res) {
	login.register(User, req, function (success) {
		res.json(success);
	});
});

router.post('/chat/update', function (req, res) {
	console.log(req.body);
	ChatRoom.findOne({ _id: req.body.id }, function (err, chatroom) {
		if (err) { console.log('Error finding chatroom: ' + err); }
		console.log(chatroom);
		console.log('updating chatroom');
		chatroom.name = req.body.name;
		chatroom.location = req.body.location;
		chatroom.department = req.body.department;

		chatroom.save( function (err, saved) {
			if (err) { console.log('Error saving chatroom: ' + err); }
			console.log('chatroom saved');
			res.json(true);
		});
	});
});

router.post('/chat/delete', function (req, res) {
	ChatRoom.findOne({ name: req.body.name}).remove(function (err, deleted) {
		if (err) { console.log('Error deleting chatroom: ' + err) }
		console.log('Chatroom deleted');
		res.json(true);
	});
});

router.post('/chat/create', function (req, res) {
	login.createChatroom(ChatRoom, req, function (success) {
		res.json(success);
	});
});
router.post('/excel/update', function (req, res) {
	Excel.findOne({ _id: req.body.id }, function (err, excel) {
		if (err) { console.log('Error finding excel: ' + err); }
		console.log(req.body);
		console.log(excel);
		console.log('updating excel');
		excel.name = req.body.name;
		excel.location = req.body.location;
		excel.department = req.body.department;

		excel.save( function (err, saved) {
			if (err) { console.log('Error saving excel: ' + err); }
			console.log('excel saved');
			res.json(true);
		});
	});
});

router.post('/excel/delete', function (req, res) {
	Excel.findOne({ name: req.body.name}).remove(function (err, deleted) {
		if (err) { console.log('Error deleting excel: ' + err) }
		console.log('Excel deleted');
		res.json(true);
	});
});

router.post('/excel/create', function (req, res) {
	login.createExcel(Excel, req, function (success) {
		res.json(success);
	});
});
module.exports = router;