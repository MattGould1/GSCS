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
			var headerHeight = $('#header').outerHeight();
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

				$(compartment).css('height', contentHeight);
			});

	}

	ui.prototype.resize = function () {

	}

	/*
	* @param Object room: chatroom or excelsheet
	* @param jQuery element container
	* @param jQuery element link
	* @param String type: -chat or -excel
	* @param String typeContainer: HTML ID
	* @param String typeLink: HTML ID
	*/
	ui.prototype.containers = function (room, container, link, type, typeContainer, typeLink) {

		//create jquery objects with the html
		var chatHTML = '<div class="container chat room">' +
								'<div class="row">' +
									'<div class="col-xs-12 chat-messages">' +
										'<ul>' +
										'</ul>' +
									'</div>' +
								'<div class="col-xs-12">' +
									'<div class="row">' +
										'<form class="chat-form">' +
											'<div class="col-xs-10">' +
												'<div class="form-group">' +
													'<input type="text" class="message form-control"/>' +
												'</div>' +
											'</div>' +
											'<div class="col-xs-2">' +
												'<div class="form-group">' +
													'<input type="hidden" class="name">' +
													'<button class="btn btn-primary form-control" type="submit">Submit</button>' +
												'</div>' +
											'</div>' +
										'</form>' +
									'</div>' +
								'</div>' +
							'</div>';

		var excelHTML = '<div class="container excel room">' +
							'<div class="row">' +
								'<div class="col-xs-12">' +
									'<div class="excel-options">' +
										'<a class="btn btn-info excel-edit">Edit</a>' +
										'<a class="btn btn-primary excel-update soft-hide">Update</a>' +
										'<a class="btn btn-warning excel-cancel soft-hide">Cancel</a>' +
									'</div>' +
									'<div class="message alert alert-info soft-hide"></div>' +
									'<div class="hot"></div>' +
								'</div>' +
							'</div>' +
						'</div>';

		var linkHTML = '<li class="link"><a></a></li>';

		//turn html into jquery objects
		$chat = $($.parseHTML(chatHTML));
		$excel = $($.parseHTML(excelHTML));
		$link = $($.parseHTML(linkHTML));
		
		if (type === '-chat') {
			newContainer = $chat;
		} else if (type === '-excel') {
			newContainer = $excel;
		}

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
		$link.addClass(room.name);

		//filter
		$link.attr('data-filter', room.name + type);

		//change link text
		$link.find('a').text(room.name);

		//append link to list
		$(typeLink).append($link);
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