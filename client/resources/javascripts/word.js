(function ($) {
	this.word = function () {

	}
	function dimensions() {

		var width = $('#word').outerWidth();
		var headerHeight = $('#header').outerHeight();
		var footerHeight = $('#footer').outerHeight();
		var contentHeight = $(window).outerHeight() - footerHeight - headerHeight;

		return {
			width: width,
			height: contentHeight,
		}
	}
	//public methods
	word.prototype.init = function (word) {
		//get dimensions to fit onto page
		var headerHeight = $('#header').outerHeight();
		var footerHeight = $('#footer').outerHeight();
		var contentHeight = $(window).outerHeight() - footerHeight - headerHeight;
		console.log(contentHeight);
		//grab the container and attach tinymce to it, set the required tinymce theme urls
		var container = $('[data-filter="' + word.name + '-word"]');
		tinymce.baseURL = window.location + 'js/themes';
		logger('creating tinymce for ' + word.name);
		tinymce.init({
			theme_url: window.location + 'js/themes/modern.js',
			skin_url: window.location + 'css/',
			selector: '#' + word._id,
			height: contentHeight - 100,
			theme: 'modern',
			// plugins: 'textcolor	',
			// toolbar: 'forecolor backcolor',
			init_instance_callback: function(editor) {
				editor.getBody().setAttribute('contenteditable',false);
				editor.getBody().style.backgroundColor = "rgba(0,0,0,0.5)";
				if (word.data != undefined) {
					editor.setContent(word.data);
				} else {
					editor.setContent('');
				}

				//editor.theme.resizeTo(100, 100);
       			
				menu.call(this, word, word.active, container, false, true, user);
			}
		});
	}

	word.prototype.update = function () {
		isActive.call(this);
		cancel.call(this);
		update.call(this);
		//wtf is this?
		$(document).on('click', '.locked', function () {
			e.preventDefault();
			return false;
		});
	}


	//private methods
	//handle the menu, hide/show when appropriate @TODO IMPLEMENT FOR EXCELS
	function menu (Word, active, word, cancel, init, cuser) {

		var options = word.find('.word-options');

		if (init) {
			if (active === true) {
				if (Word.user._id === cuser._id) {
					options.find('.word-edit').hide();
					options.find('.edit-options').show();
					word.find('.mce-toolbar-grp').show();
					word.find('.mce-toolbar').show();
				} else {
					options.find('.word-edit').hide();
					word.find('.mce-toolbar-grp').hide();
					word.find('.mce-toolbar').hide();
				}
			} else {
				word.find('.mce-toolbar-grp').hide();
				word.find('.mce-toolbar').hide();
				options.find('.word-edit').show();
			}
			return false;
		}

		if (cancel) {
			options.find('.edit-options').hide();
			options.find('.word-edit').show();
			word.find('.mce-toolbar-grp').hide();
			word.find('.mce-toolbar').hide();
		} else {
			if (active === true) {
				options.find('.word-edit').hide();
				options.find('.edit-options').show();
				word.find('.mce-toolbar-grp').show();
				word.find('.mce-toolbar').show();
			} else {
				options.find('.word-edit').hide();
				word.find('.mce-toolbar-grp').hide();
				word.find('.mce-toolbar').hide();
			}
		}
	}

	//check to see if this word is active, and therefor whether or not it can be editted
	//add events
	function isActive() {
		//is this active and can we edit? 
		$(document).on('click', '.word-edit', function () {
			logger('Can I edit?');
			var id = $(this).data('link_id');
			socket.emit('editword', id);

			uiObj.alertsOpen();
		});
		//response to can we edit if true, enable tinymce if false, tell client who's editting
		socket.on('editword', function (data) {
			if (data.edit === true) {
				var word = $('[data-_id-word="' + data.word._id +'"]');
				menu.call(this, data.word, data.edit, word, false);

				var editor = tinymce.get(data.word._id);
				editor.getBody().setAttribute('contenteditable', true);
				editor.getBody().style.backgroundColor = "rgba(255,255,255,0)";
				var width = $('#word').width() - 30;
				editor.theme.resizeTo()

				uiObj.myEdit(word.find('.word-options'));
				uiObj.alertsClose();
			} else {
				var word = $('[data-_id-word="' + data.id + '"]');
				menu.call(this, data.user, data.edit, word, false);
				uiObj.notMyEdit(word.find('.word-options'), uiObj.findUser(data.user).username + ' is currently editting!');
			}
			$('.word-options').append();
		});
	}

	//cancel the word edit and revert back to original state
	function cancel() {
		//i've pressed cancel so don't save changes and tell all clients its open
		$(document).on('click', '.word-cancel', function () {
			var id = $(this).data('link_id');
			socket.emit('cancelword', id);

			uiObj.alertsOpen();
		});

		//response to cancelling the edit
		socket.on('cancelword', function (word) {
			var wordC = $('[data-_id-word="' + word._id + '"]');
			menu.call(this, word, word.active, wordC, true);
			var editor = tinymce.get(word._id);
			editor.getBody().setAttribute('contenteditable',false);
			editor.getBody().style.backgroundColor = "rgba(0,0,0,0.5)";
			if (word.data === undefined) {
				editor.setContent('');
			} else {
				editor.setContent(word.data);
			}
			uiObj.removeEdits(wordC);
			uiObj.alertsClose();
		});
	}

	//handles all updates, this includes sending updates as well as receivin them
	function update() {
		$(document).on('click', '.word-update', function () {
			logger('updating word');
			var id = $(this).data('link_id');
			var editor = tinymce.get(id);
			var data = {
				contents: editor.getContent(),
				_id: id
			};

			socket.emit('updateword', data);
			uiObj.alertsOpen();
		});

		socket.on('updateword', function (data) {
			logger(data.name + ' word document has been updated');

			var id = data._id;
			var editor = tinymce.get(id);
			var word = $('[data-_id-word="' + data._id +'"]');
			var wordLink = $('[data-filter="' + data.name + '-word"]');
			menu.call(this, '', data.active, word, true);

			editor.getBody().setAttribute('contenteditable',false);
			editor.getBody().style.backgroundColor = "rgba(0,0,0,0.5)";

			if (data.data === undefined) {
				editor.setContent('');
			} else {
				editor.setContent(data.data);
			}

			//update message count
			uiObj.activityCount(word, wordLink);

			//remove alerts and edits
			uiObj.removeEdits(word);
			uiObj.alertsClose();
			//cheater @TODO REMOVE LATER
			new Audio('sounds/notification.mp3').play();
		});
	}
})(jQuery);