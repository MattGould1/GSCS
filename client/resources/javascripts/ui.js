(function ($) {

	this.ui = function () {
		var options = {
			width: $(window).width(),
			height: $(window).height()
		};


		if ( arguments[0] && typeof arguments[0] === "object" ) {
			this.options = extendDefaults(options, arguments[0]);
		}
	}

	//public
	ui.prototype.init = function () {
			//get heights
			var headerHeight = $('#header').height();
			var footerHeight = $('#footer').height();
			var contentHeight = $(window).height() - headerHeight - footerHeight;

			//set app height based on header height and window height, use overflow hidden on rest
			$('#isAuth').css('height', contentHeight);
			/*
			*	Three more compartments to handle, #sidebar #content and #users
			*/
			var compartments = ['#sidebar', '#content', '#users'];
			compartments.forEach( function (compartment) {
				var Compartment = $(compartment);

				if (compartment === '#sidebar') {
					Compartment.find('#links').css('overflow', 'auto');
				}

				if (compartment === '#content') {
					//chatroom heights
					Compartment.find('#chat').find('.chat-form').css('height', '49px');
					Compartment.find('#chat').find('.chat-messages').css('height', contentHeight - 49);

					//excel
					//Compartment.find('#excel .current').css('height', '49px');
					Compartment.find('#excel .excel-options').css('height', '49px');
				}

				if (compartment === '#users') {

				}

				$(compartment).css('height', contentHeight);
			});

	}

	ui.prototype.resize = function () {

	}

	//private
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

})(jQuery)