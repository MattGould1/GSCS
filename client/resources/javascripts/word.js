(function ($) {
	this.word = function () {

	}

	//public methods
	word.prototype.init = function (word) {
		//grab the container and attach tinymce to it, set the required tinymce theme urls
		var container = $('[data-filter="' + word.name + '-excel"]');
		tinymce.baseURL = window.location + 'js/themes/modern.js';
		tinymce.init({
			theme_url: window.location + 'js/themes/modern.js',
			skin_url: window.location + 'css/',
			selector: '#' + word._id,
			height: 300,
			theme: 'modern',
			init_instance_callback: function(editor) {
				editor.getBody().setAttribute('contenteditable',false);
				editor.getBody().style.backgroundColor = "rgba(0,0,0,0.5)";
				if (word.data != undefined) {
					editor.setContent(word.data);
				} else {
					editor.setContent('');
				}
			}
		});
	}

	word.prototype.update = function () {
		isActive.call(this);
		cancel.call(this);
		update.call(this);
	}


	//private methods
	//handle the menu, hide/show when appropriate @TODO IMPLEMENT FOR EXCELS
	function menu (Word, edit, word, cancel) {
		console.log('hello');

		var options = word.find('.word-options');

		if (cancel) {
			options.find('.message').hide();
			options.find('.edit-options').hide();
			options.find('.word-edit').show();
		} else {
			if (edit === true) {
				options.find('.word-edit').hide();
				options.find('.edit-options').show();
				options.find('.message').show();
				options.find('.message').html('You are currently editting this word document');
			} else {
				console.log('hmmmmm');
				//@TODO get user object from data.excel.user, no point using .populate as global users holds information we require
				for (var key in users) {
					if(users.hasOwnProperty(key)) {
						var user = users[key];
						if (user._id === Word) {
							name = user.username;
						}
					}
				}
				options.find('.message').show();
				options.find('.word-edit').hide();
				options.find('.message').html('This word document is being editted by: ' + name)
			}
		}
	}

	//check to see if this word is active, and therefor whether or not it can be editted
	function isActive() {
		//is this active and can we edit? 
		$(document).on('click', '.word-edit', function () {
			logger('Can I edit?');
			var id = $(this).data('link_id');
			socket.emit('editword', id);
		});
		//response to can we edit if true, enable tinymce if false, tell client who's editting
		socket.on('editword', function (data) {

			if (data.edit === true) {
				var word = $('[data-_id-word="' + data.word._id +'"]');
				menu.call(this, data.word, data.edit, word, false);

				var editor = tinymce.get(data.word._id);
				editor.getBody().setAttribute('contenteditable', true);
				editor.getBody().style.backgroundColor = "rgba(255,255,255,0)";
			} else {
				var word = $('[data-_id-word="' + data.id + '"]');
				menu.call(this, data.user, data.edit, word, false);
			}
		});
	}

	//cancel the word edit and revert back to original state
	function cancel() {
		//i've pressed cancel so don't save changes and tell all clients its open
		$(document).on('click', '.word-cancel', function () {
			var id = $(this).data('link_id');
			socket.emit('cancelword', id);
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
		});

		socket.on('updateword', function (data) {
			console.log(data);
			var id = data._id;
			var editor = tinymce.get(id);
			var word = $('[data-_id-word="' + data._id +'"]');
			menu.call(this, '', data.active, word, true);

			editor.getBody().setAttribute('contenteditable',false);
			editor.getBody().style.backgroundColor = "rgba(0,0,0,0.5)";
			if (data.data === undefined) {
				editor.setContent('');
			} else {
				editor.setContent(data.data);
			}
		});
	}
})(jQuery);