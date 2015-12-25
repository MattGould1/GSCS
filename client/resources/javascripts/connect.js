//define global vars and functions
var token, socket, chatrooms = [], user, excelsheets = [];

//anything inside Auth will be shown when logged in, otherwise notAuth will be shown
Auth = jQuery('#isAuth');
notAuth = jQuery('#isNotAuth');

//check for token, authenticate if token exists
jQuery(document).ready(function() {

	//check for token
	if ($.cookie('token')) {
		//use token to connect and initialise app
		token = $.cookie('token');
		init(token);
	} else {
		//set UI
		notAuth.show();
		Auth.hide();
	}

});

function init(token) {
	//connect to server
	socket = io.connect( 'http://localhost:8080/?token=' + token ,{
		'forceNew': true
	});
	//set UI
	notAuth.hide();
	Auth.show();
	//load chat
	if ($('body').attr('init') != 'true') {
		socketIOInit();
	}
}

function socketIOInit() {
		$('body').attr('init', 'true');
		socket.on('time', function(time) {
			console.log(time);
		});

		socket.on('data', function (data) {
			var chatStructure = $('.chat');
			var sideLink = $('.link');
			chatrooms = data.chatrooms;
			chatrooms.forEach( function (room, i) {
					
				//clone chat container, add new class as room name and append to #chat
				newContainer = chatStructure.clone();
				newLink = sideLink.clone();

				//class
				newContainer.addClass(room.name);

				//add filter
				newContainer.attr('data-filter', room.name + '-chat');

				//add html "name" attribute
				newContainer.find('.name').val(room.name);

				//add name for chatroom
				newContainer.find('.title').text(room.name);

				//add new chatroom to #chat
				$('#chat').append(newContainer);

				//class
				newLink.addClass(room.name);

				//filter
				newLink.attr('data-filter', room.name + '-chat');

				//change link text to room name
				newLink.find('a').text(room.name);

				//add link to link list
				$('#chatLinks').append(newLink);
			});
			
			var excelContainer = $('.excel');
			excelsheets = data.excelsheets;
			excelsheets.forEach( function (room, i) {

				newContainer = excelContainer.clone();
				newLink = sideLink.clone();


				//class
				newContainer.addClass(room.name);

				//add filter
				newContainer.attr('data-filter', room.name + '-excel');

				//add html "name" attribute
				newContainer.find('.name').val(room.name);

				//add name for chatroom
				newContainer.find('.title').text(room.name);

				//add new chatroom to #chat
				$('#excel').append(newContainer);

				//class
				newLink.addClass(room.name);

				//filter
				newLink.attr('data-filter', room.name + '-excel');

				//change link text to room name
				newLink.find('a').text(room.name);

				//add link to link list
				$('#excelLinks').append(newLink);
			});

			test = new hideNshow({
				main: jQuery('#isAuth'),
				Container: jQuery('.room'),
				Link: jQuery('.link'),
				defaultActive: 3
			});
			
			test.init();

			test1 = new ewbChat({
				form: '.chat-form'
			});
			test1.init();
		});
}

(function ($) {
	$(document).on('click', '.link', function () {
		test.init($(this));
	});
})(jQuery);

(function($) {
	$('#login').submit( function (e) {
		e.preventDefault();
	});
}(jQuery));