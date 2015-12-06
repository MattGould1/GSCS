var token, socket;

var chat = {
	init: function () {
		socket.on('time', function(time) {
			console.log(time);
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

//connect to game namespace
function connect(token) {
	if(token) {
		socket = io.connect( 'http://localhost:8080/?token=' + token ,{
			'forceNew': true
		});
	}
}
