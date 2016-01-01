(function ($) {

	this.ui = function () {
		var options = {
			Null: null		
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

	ui.prototype.containers = function (room, container, link, type, typeContainer, typeLink) {
		createContainers.call(this, room, container, link, type, typeContainer, typeLink);
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

	/*
	* @param Object room: chatroom or excelsheet
	* @param jQuery element container
	* @param jQuery element link
	* @param String type: -chat or -excel
	* @param String typeContainer: HTML ID
	* @param String typeLink: HTML ID
	*/
	function createContainers(room, container, link, type, typeContainer, typeLink) {

		//clone jQuery elements to manipulate + append
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

		//create handsontable
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

})(jQuery)