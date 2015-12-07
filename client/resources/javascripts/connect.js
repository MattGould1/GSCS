var token, socket, rooms = [];

var chat = {
	init: function () {
		socket.on('time', function(time) {
			console.log(time);
		});


		socket.on('rooms', function(room) {
			rooms.push(room);
			console.log(rooms);
		});
	}
};

(function($){
	if($.cookie('token')) {
		token = $.cookie('token');
		connect(token);
		chat.init();
	}	
}(jQuery));

function disconnect() {
	socket.disconnect();
}

(function($) {
	$('#login').submit( function (e) {
		e.preventDefault();
		console.log(socket);
	});
}(jQuery));



//connect to game namespace
function connect(token) {
	if(token) {
		socket = io.connect( 'http://localhost:8080/?token=' + token ,{
			'forceNew': true
		});
		console.log('"' + token + '"');
		$.ajax({
		url: 'http://localhost:8080/chatrooms',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token
		}),
		success: function (data, status, xhr) {
			console.log(data);
		},
		error: function (xhr, status, error) {
			console.log(error)
		}
	});
	}
}