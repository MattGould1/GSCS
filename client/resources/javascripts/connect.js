/*
* @var String token: authorization token
* @var Object socket: client/server connection
* @var Array chatrooms: array of all chatrooms
* @var Object user: Current user
* @var Array excelsheets: array of all excelsheets
* @var Array users: array of all users
*/
var token, socket, chatrooms = [], user, excelsheets = [], users = [], words = [], appInit, changes = {}, localWord = {};

//two states, Auth displays app, notAuth displays login
Auth = jQuery('#isAuth');
notAuth = jQuery('#isNotAuth');
var wordObj = new word();
var userObj = new usersO();

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

function times() {
	var ny = $('.newyork'),
		london = $('.london'),
		athens = $('.athens'),
		mumbai = $('.mumbai'),
		singapore = $('.singapore'),
		sydney = $('.sydney');

		ny.html('New York <span>' + moment().tz('America/New_York').format('h:mma') + '</span>');
		london.html('London <span>' + moment().tz('Europe/London').format('h:mma') + '</span>');
		athens.html('Athens <span>' + moment().tz('Europe/Athens').format('h:mma') + '</span>');
		mumbai.html('Mumbai <span>' + moment().tz('Asia/Singapore').format('h:mma') + '</span>');
		singapore.html('Singapore <span>' + moment().tz('Asia/Kolkata').format('h:mma') + '</span>');
		sydney.html('Syndey <span>' + moment().tz('Australia/Sydney').format('h:mma') + '</span>');
}
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
		console.log('connect');
		//set ui
		setTimeout(function() {
			//show app
			Auth.removeClass('trick-hide');
			notAuth.hide();
		}, 500);
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
			setTimeout(function () {}, 2000);
			//init excelsheet module, see excel.js
			excel = new eExcel();
			//listen for excelsheets socketio events
			excel.update();

			wordObj.update();
			//init chat functions
			chat.init();
			times();
			//configure the timezones
			setInterval(function () {
				times();
			}, 5000);
		}
		//make socketio calls
		socketIOInit();
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
		$('.word').remove();
		$('.private-chat').remove();

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
	var wordContainer = $('.word');
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
		users = data.users;
		//set chatrooms global var
		chatrooms = data.chatrooms;

		//create rooms
		chatrooms.forEach( function (room, i) {
			ui.containers(room, chatContainer, link, '-chat', '#chat', '#chatLinks');
		});
		setTimeout( function () {
			$('.chat-messages').each( function () {
				ui.gotoBottom($(this));
			});
		}, 300);
		//set excelsheets global var
		excelsheets = data.excelsheets;

		//create excelsheets
		excelsheets.forEach( function (room, i) {
			ui.containers(room, excelContainer, link, '-excel', '#excel', '#excelLinks');
			changes[room._id] = room.changes;
		});

		words = data.words;
		words.forEach( function (word, i) {
			ui.containers(word, wordContainer, link, '-word', '#word', '#wordLinks');
		});

		//init main UI
		ui.init();
		//begin hideNshow, see hideNshow.js for usage explaination
		new hideNshow({
			body: jQuery('#isAuth'),
			Container: jQuery('.room'),
			Link: jQuery('.link'),
			defaultActive: 6
		}).init();

		$('.user-offline').remove();
		data.users.forEach ( function (name, i) {
			console.log(name);
			var offline = $('.people-offline');
			var html = '<div class="user user-offline"' +
							'data-_id="' + name._id + '"' +
							'data-email="' + name.email + '"' +
							'data-status="' + name.status + '"' +
							'data-lastactive="' + moment(name.lastlogin).format('lll') + '"' +
							'data-username=" ' + name.username + '">' +
								name.username + 
							'<span class="badge messageCount" style="float:right;"></span></div>';
			offline.after(html);
		});
		$('.messageCount').html('');
		//append a badge and number for each unreadmessage
		data.unread.forEach ( function (message, i) {

			var partner = $('[data-_id="' + message._user + '"]');

			var badge = partner.find('.messageCount');
			var count = +badge.html();
			badge.html(count +1);
			logger(message);
		});
	});
	userObj.load();
	userObj.lastActive();
}