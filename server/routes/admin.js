var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    jwt = require('jsonwebtoken'),
    methodOverride = require('method-override'), //used to manipulate POST
    User = mongoose.model('User'),
    ChatRoom = mongoose.model('ChatRoom'),
    Excel = mongoose.model('Excel'),
    Word = mongoose.model('Word'),
	Locations = mongoose.model('Locations'),
	Departments = mongoose.model('Departments'),
	login = require('./../modules/login'),
	os = require('os'),
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
				 		Word.find({}).exec( function (err, words) {
					 		var stats = {
					 			cpu: os.cpus(),
					 			freemem: os.freemem(),
					 			hostname: os.hostname(),
					 			loadavg: os.loadavg(),
					 			network: os.networkInterfaces(),
					 			totalmem: os.totalmem(),
					 			uptime: os.uptime()
					 		};

							res.json({ chat: rooms, users: users, excels: excels, words: words, locations: locations, departments: departments, stats: stats });
				 		});
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
	Locations.find({}).exec( function (err, locations) {
 		Departments.find({}).exec( function (err, departments) {
 			console.log('sending back');
 			res.json( {
 				locations: locations,
 				departments: departments
 			});
 		});
	});
});

router.post('/locdep/delete', function (req, res) {
	if (req.body.data.value == '') {
		return false;
	}
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

router.post('/word/update', function (req, res) {
	Word.findOne({ _id: req.body.id }, function (err, word) {
		if (err) { console.log('Error finding word: ' + err); }
		console.log(req.body);
		console.log(word);
		console.log('updating word');
		word.name = req.body.name;
		word.location = req.body.location;
		word.department = req.body.department;

		word.save( function (err, saved) {
			if (err) { console.log('Error saving word: ' + err); }
			console.log('word saved');
			res.json(true);
		});
	});
});

router.post('/word/delete', function (req, res) {
	Word.findOne({ name: req.body.name}).remove(function (err, deleted) {
		if (err) { console.log('Error deleting word: ' + err) }
		console.log('Word deleted');
		res.json(true);
	});
});

router.post('/word/create', function (req, res) {
	login.createWord(Word, req, function (success) {
		res.json(success);
	});
});

module.exports = router;