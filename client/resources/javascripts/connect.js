//define global vars and functions
var token, socket, chatrooms = [], user, excelsheets = [], url = 'http://localhost:8080';

//anything inside Auth will be shown when logged in, otherwise notAuth will be shown
Auth = jQuery('#isAuth');
notAuth = jQuery('#isNotAuth');

//check for token, once document has loaded
jQuery(document).ready(function() {
	if ($.cookie('token')) {
		//use token to connect and initialise app
		token = $.cookie('token');
		//pass token to init, it will try to connect to the socket.io server
		init(token);
	} else {
		//set UI
		notAuth.show();
		Auth.hide();
	}
});

function init(token) {
	//attempt to connect
	socket = io.connect( url + '/?token=' + token ,{
		'forceNew': true
	});

	socket.on('connect', function (data) {
		//set ui
		notAuth.hide();
		Auth.show();

		//make socketio calls
		socketIOInit();
	});

	socket.on('connect_failed', function (data) {
		//failed to connect, set ui
		notAuth.hide();
		Auth.show();
	});

	socket.on('disconnect', function (data) {

	});
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
		excel = new eExcel();
		excel.init(room);
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

		//init ui + components when data received
		socket.on('data', function (data) {

			//add user data to global user
			user = data.user;

			//create chatroom containers
			chatrooms = data.chatrooms;
			chatrooms.forEach( function (room, i) {
				createContainers(room, chatContainer, link, '-chat', '#chat', '#chatLinks');
			});
		
			//create excel containers
			excelsheets = data.excelsheets;
			excelsheets.forEach( function (room, i) {
				createContainers(room, excelContainer, link, '-excel', '#excel', '#excelLinks');
			});

			//init ui
			ui = new hideNshow({
				main: jQuery('#isAuth'),
				Container: jQuery('.room'),
				Link: jQuery('.link'),
				defaultActive: 4
			});
			
			ui.init();

			//init chat
			chat = new ewbChat({
				form: '.chat-form'
			});

			chat.init();

			//init excel update
			excel = new eExcel();
			excel.update();

		});
}

(function ($) {
	$(document).on('click', '.link', function () {
		ui.init($(this));
	});
})(jQuery);

(function($) {
	$('#login').submit( function (e) {
		e.preventDefault();
	});
}(jQuery));