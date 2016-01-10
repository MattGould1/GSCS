/*
* @var String token: authorization token
* @var Object socket: client/server connection
* @var Array chatrooms: array of all chatrooms
* @var Object user: Current user
* @var Array excelsheets: array of all excelsheets
* @var Array users: array of all users
*/
var token, socket, chatrooms = [], user, excelsheets = [], users = [], appInit;

//two states, Auth displays app, notAuth displays login
Auth = jQuery('#isAuth');
notAuth = jQuery('#isNotAuth');

//check for token, once document has loaded
jQuery(document).ready(function() {
	if ($.cookie('token')) {
		//use token to connect and initialise app
		token = $.cookie('token');
		init(token);
	} else {
		//set State
		notAuth.show();
		//hide app
		Auth.addClass('trick-hide');
		$('.link').remove();
		$('.chat').remove();
		$('.excel').remove();
	}

	$('#header').on('click', '.logout', function (e) {
		$.removeCookie('token');
	});
});

/*
* @param String token: authorization token
*/
function init(token) {

	//attempt to connect
	socket = io.connect( url + '/?token=' + token ,{
		'forceNew': true
	});

	//socketio connect event, this means we've succesfully connected so we can safely (fully) init app
	socket.once('connect', function (data) {
		//set ui
		setTimeout(function() {
			//show app
			Auth.removeClass('trick-hide');
			notAuth.hide();
		}, 500);
		//make socketio calls
		socketIOInit();


		//load modules, once
		if (appInit === undefined) {
			//set to true
			appInit = true;
			//modules
			ui = new ui();
			//init chatroom module, see chat.js
			chat = new ewbChat({
				form: '.chat-form'
			});
			//init excelsheet module, see excel.js
			excel = new eExcel();
		}
	});

	//connection failed, lets stop the app
	socket.on('connect_failed', function (data) {
		//failed to connect, set ui
		console.log('connect fail');
		notAuth.show();
		//show app
		Auth.removeClass('trick-hide');
	});

	//disconnect, stop the app
	socket.on('disconnect', function (data) {
		console.log('disconnect');
		//cleanup
		//reset global data vars
		users = null;
		chatrooms = null;
		excelsheets = null;
		user = null;
		//clear containers, incase of disconnect etc
		$('.chat').remove();
		$('.excel').remove();
		$('.link').remove();

		$time = 0;

		var disconnect = $('#disconnect');
		var dc = function () {
			if (chatrooms === null ) {
				$time ++;

				disconnect.removeClass('trick-hide');
				disconnect.find('.disconnect-message').html(disconnectStrings.message + $time + ' Seconds <br>' + disconnectStrings.reconnect);
			} else {
				disconnect.addClass('trick-hide');
			}
			clearInterval(dc);
		}

		setInterval(dc, 1000);
	});
}
/*
* Start listening for data + userList socketio events
*/
function socketIOInit() {
	//vars to clone when creating containers
	var chatContainer = $('.chat');
	var excelContainer = $('.excel');
	var link = $('.link');


	/*
	* @param Object data contains
	* @param Array data.chatrooms: Array of all chatrooms
	* @param Array data.excelsheets: Array of all excelsheets
	* @param Object data.user: current user
	*/
	socket.on('data', function (data) {
		//set current user global var
		user = data.user;

		//set chatrooms global var
		chatrooms = data.chatrooms;

		//create rooms
		chatrooms.forEach( function (room, i) {
			ui.containers(room, chatContainer, link, '-chat', '#chat', '#chatLinks');
		});
	
		//set excelsheets global var
		excelsheets = data.excelsheets;

		//create excelsheets
		excelsheets.forEach( function (room, i) {
			ui.containers(room, excelContainer, link, '-excel', '#excel', '#excelLinks');
		});

		//begin hideNshow, see hideNshow.js for usage explaination
		new hideNshow({
			body: jQuery('#isAuth'),
			Container: jQuery('.room'),
			Link: jQuery('.link'),
			defaultActive: 1
		}).init();

		//listen for excelsheets socketio events
		excel.update();
		//init main UI
		ui.init();
		//init chat functions
		chat.init();

	});
	/*
	* @param Object userList: contains a list of users that are Objects
	*/
	socket.on('userList', function (userList) {
		//remove current list
		$('.user').remove();

		//update global users var
		users = userList;

		//get username from each user
		for (var key in userList) {
			if (userList.hasOwnProperty(key)) {
				var user = userList[key];
				$('.users').append('<div class="user">' + user.username + '</div>');
			}
		}
	});
}