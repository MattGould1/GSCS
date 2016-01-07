// send chat messages with socketio and jquery
(function ($) {

	this.ewbChat = function () {

		//the form to attach events to
		var options = {
			form: null,
		};

		if ( arguments[0] && typeof arguments[0] === "object" ) {
			this.options = extendDefaults(options, arguments[0]);
		}
	}

	//public methods
	ewbChat.prototype.init = function () {
		var form = this.options.form;
		send.call(this, form);
		receive.call(this);
	}

	//private methods
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

	/*
	* @param form: jQuery form for submit event
	* use socketio to emit chat-message to server
	*/
	function send(form) {
		$('#chat').on('submit', form, function (e) {
			e.preventDefault();

			var $this = $(this);

			if ($this.find('.message').val() == '') {
				return false;
			}

			//message object to send to server
			msg = {
				_id: $this.find('.name').val(),
				message: $this.find('.message').val()
			};

			socket.emit('chat-message', msg);

			//regardless of success disable message for half a second
			$this.find('button').prop('disabled', true);

			setTimeout(function() {
				$this.find('button').prop('disabled', false);
			}, 500);
		});
	}
	/*
	* receive chat message and append it to the chatroom
	*/
	function receive() {
		/*
		* @param Object message: _id = chatroom._id, message, chatroom.room, user.username
		*/
		socket.on('chat-message', function (message) {
			//build message, include na
			msg = '<li>' + message.username + ': ' + message.message;
			//jquery append
			$('[data-filter="' + message.room + '-chat"]').find('.chat-messages ul').append(msg);

			var container = $('[data-filter="' + message.room + '-chat"').find('.chat-messages');
			container.scrollTop(container[0].scrollHeight);
		});
	}

	function validate() {

	}

})(jQuery);