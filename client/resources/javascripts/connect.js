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

function createContainers(room, container, link, type, typeContainer, typeLink) {

	newContainer = container.clone();
	newLink = link.clone();

	//add class to container
	newContainer.addClass(room.name);
	//add attribute with type
	newContainer.attr('data-filter', room.name + type);
	//add hidden name attribute for sending data use _id as won't change
	newContainer.find('.name').val(room._id);
	//change title
	newContainer.find('.title').text(room.name);
	if (room._messages != undefined) {
		room._messages.forEach( function (message, i) {
			msg = '<li>' + message.username + ': ' + message.message;
			newContainer.find('.chat-messages ul').append(msg);
		});
	}

	//add container to typeContainer
	$(typeContainer).append(newContainer);
	if (type === '-excel') {
		excel(room.name, room._id);
	}

	//do the same for link
	newLink.addClass(room.name);

	//filter
	newLink.attr('data-filter', room.name + type);

	//change link text
	newLink.find('a').text(room.name);

	//append link to list
	$(typeLink).append(newLink);
}

function socketIOInit() {
		$('body').attr('init', 'true');
		socket.on('time', function(time) {
			console.log(time);
		});

		var chatContainer = $('.chat');
		var excelContainer = $('.excel');
		var link = $('.link');

		socket.on('data', function (data) {
			chatrooms = data.chatrooms;
			chatrooms.forEach( function (room, i) {
				createContainers(room, chatContainer, link, '-chat', '#chat', '#chatLinks');
			});
		
			excelsheets = data.excelsheets;
			excelsheets.forEach( function (room, i) {

				createContainers(room, excelContainer, link, '-excel', '#excel', '#excelLinks');
			});

			test = new hideNshow({
				main: jQuery('#isAuth'),
				Container: jQuery('.room'),
				Link: jQuery('.link'),
				defaultActive: 4
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