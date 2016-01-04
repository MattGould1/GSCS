/*
* @var String token: authorization token
* @var Object socket: client/server connection
* @var Array chatrooms: array of all chatrooms
* @var Object user: Current user
* @var Array excelsheets: array of all excelsheets
* @var Array users: array of all users
*/
var token, socket, chatrooms = [], user, excelsheets = [], users = [];

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
		Auth.hide();
	}
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
	socket.on('connect', function (data) {
		//set ui
		setTimeout(function() {
			notAuth.hide();
			Auth.show();
		}, 500);
		console.log('connected');
		//make socketio calls
		socketIOInit();
	});

	//connection failed, lets stop the app
	socket.on('connect_failed', function (data) {
		//failed to connect, set ui
		console.log('connect fail');
		notAuth.hide();
		Auth.show();
	});

	//disconnect, stop the app
	socket.on('disconnect', function (data) {
		console.log('disconnect');
		notAuth.show();
		Auth.hide();
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

			//begin ui, see @ui.js
			ui = new ui({});

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
			hideNshow = new hideNshow({
				body: jQuery('#isAuth'),
				Container: jQuery('.room'),
				Link: jQuery('.link'),
				defaultActive: 4
			});
			
			hideNshow.init();
			//init excelsheet module, see excel.js
			excel = new eExcel();
			//listen for excelsheets socketio events
			excel.update();
			
			//init main UI
			ui.init();

			//init chatroom module, see chat.js
			chat = new ewbChat({
				form: '.chat-form'
			});

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