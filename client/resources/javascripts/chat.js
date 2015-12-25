// send chat messages with socketio and jquery
(function ($) {

	this.ewbChat = function () {
		this.message = null;
		this.active = null;

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

	function send(form) {
		$('#chat').on('submit', form, function (e) {
			e.preventDefault();
			//message object to send to server, contains room name + message
			msg = {
				room: $(this).find('.name').val(),
				message: $(this).find('.message').val()
			};
			//emit message object
			socket.emit('chat-message', msg);
		});
	}

	function receive() {
		socket.on('chat-message', function (data) {
			console.log(data);
		});
	}

	function validate() {

	}

})(jQuery);