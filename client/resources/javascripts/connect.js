var token, socket, rooms = [], user;

Auth = jQuery('#isAuth');
notAuth = jQuery('#isNotAuth');

(function ($) {
	//check for token
	if ($.cookie('token')) {
		//use token to connect and initialise app
		token = $.cookie('token');
		//check connect, we wait until response 2 load up app
		connect(token);

	}

	function init(data) {

		//hide isnotauth
		notAuth.hide();
		//show isauth
		Auth.show();

		//chat
		data.chat.forEach(function (room) {
			//clone html
			var chatRoom = jQuery('#chat').clone();
			//add unique class
			chatRoom.addClass(room.name);
			//add class to form use this when sending data to server to identify
			chatRoom.find('form').addClass(room.name);
			//change title
			chatRoom.find('h2').html(room.name);
			//append it
			chatRoom.insertAfter('#chat');
		});
		
	}

	//connect to game namespace
	function connect(token) {
		if(token) {

			socket = io.connect( 'http://localhost:8080/?token=' + token ,{
				'forceNew': true
			});

			$.ajax({
				url: 'http://localhost:8080/login',
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({
				token: token
			}),
			success: function (data, status, xhr) {
				init(data);
			},
			error: function (xhr, status, error) {
				console.log(error)
			}
		});
		}
	}
})(jQuery);


(function ($) {

	jQuery('#chat').find('form').on('submit', function (e) {

		e.preventDefault();

		//$this refers to the current form being submitted, take the class and send in the emit for server to identify which room
		$this = $(this);

		//message contains message, user and room
		message = {
			'room': $this.attr('class'),
			'user': user.name,
			'message': $this.find('.message').val();
		};

		socket.emit('message', message);

	});

})(jQuery);





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


function disconnect() {
	socket.disconnect();
}

(function($) {
	$('#login').submit( function (e) {
		e.preventDefault();
		console.log(socket);
	});
}(jQuery));