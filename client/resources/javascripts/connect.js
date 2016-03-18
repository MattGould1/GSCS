jQuery(window).bind('beforeunload', function(){
  return 'Are you sure you want to leave?';
});
/*
* @var String token: authorization token
* @var Object socket: client/server connection
* @var Array chatrooms: array of all chatrooms
* @var Object user: Current user
* @var Array excelsheets: array of all excelsheets
* @var Array users: array of all users
*/
var token, socket, chatrooms = [], user, excelsheets = [], users = [], words = [], appInit, changes = {}, localWord = {};
var wordObj = new word();
var userObj = new usersO();
var uiObj = new ui();
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

function times() {
	var ny = $('.newyork'),
		london = $('.london'),
		athens = $('.athens'),
		mumbai = $('.mumbai'),
		singapore = $('.singapore'),
		sydney = $('.sydney');

		ny.html('<span class="hidden-xs hidden-sm">New York</span><span class="visible-xs visible-sm">NY</span> <span>' + moment().tz('America/New_York').format('LT') + '</span>');
		london.html('<span class="hidden-xs hidden-sm">London</span><span class="visible-xs visible-sm">LDN</span><span>' + moment().tz('Europe/London').format('LT') + '</span>');
		athens.html('<span class="hidden-xs hidden-sm">Athens</span><span class="visible-xs visible-sm">ATH</span><span>' + moment().tz('Europe/Athens').format('LT') + '</span>');
		mumbai.html('<span class="hidden-xs hidden-sm">Mumbai</span><span class="visible-xs visible-sm">BOM</span><span>' + moment().tz('Asia/Singapore').format('LT') + '</span>');
		singapore.html('<span class="hidden-xs hidden-sm">Singapore</span><span class="visible-xs visible-sm">SG</span><span>' + moment().tz('Asia/Kolkata').format('LT') + '</span>');
		sydney.html('<span class="hidden-xs hidden-sm">Sydney</span><span class="visible-xs visible-sm">SY</span><span>' + moment().tz('Australia/Sydney').format('LT') + '</span>');
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
		//clear word instances
		tinymce.editors = [];
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
			uiObj.containers(room, chatContainer, link, '-chat', '#chat', '#chatLinks');
		});
		setTimeout( function () {
			$('.chat-messages').each( function () {
				uiObj.gotoBottom($(this));
			});
		}, 300);
		//set excelsheets global var
		excelsheets = data.excelsheets;

		//create excelsheets
		excelsheets.forEach( function (room, i) {
			uiObj.containers(room, excelContainer, link, '-excel', '#excel', '#excelLinks');
			changes[room._id] = room.changes;
		});

		words = data.words;
		words.forEach( function (word, i) {
			uiObj.containers(word, wordContainer, link, '-word', '#word', '#wordLinks');
		});

		//init main UI
		uiObj.init();
		//begin hideNshow, see hideNshow.js for usage explaination
		new hideNshow({
			body: jQuery('#isAuth'),
			Container: jQuery('.room'),
			Link: jQuery('.link'),
			defaultActive: 1
		}).init();

		$('.user-offline').remove();
		data.users.forEach ( function (name, i) {
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