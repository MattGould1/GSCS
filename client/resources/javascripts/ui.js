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
					var cform = $('.chat-form');
					cform.siblings('.chat-messages').css('height', contentHeight - 80);

					//excel
					Compartment.find('#excel .excel-options').css('height', '60px');
				}

				$(compartment).css('height', contentHeight);
			});
			//@todo implement resize in a more friendly manner
			jQuery(window).resize(function () {
				//get heights
				var headerHeight = $('#header').outerHeight();
				var footerHeight = $('#footer').height();
				var contentHeight = $(window).height() - headerHeight - footerHeight;

				//set app height based on header height and window height, use overflow hidden on rest
			
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
						var cform = $('.chat-form');
						cform.siblings('.chat-messages').css('height', contentHeight - 80);

						//excel
						Compartment.find('#excel .excel-options').css('height', '60px');
					}

					$(compartment).css('height', contentHeight);
				});
			});
	}

	ui.prototype.resize = function () {

	}
	ui.prototype.gotoBottom = function ($el) {
		$el.scrollTop($el[0].scrollHeight);
	}
	/*
	*	@Boolean private
	*	@String message
	*	@String file (url)
	*	@String username
	*	@Date created
	*	@String url is the global url
	*/
	ui.prototype.message = function (private, message, file, thumbnail, username, created) {
		if (!private) {
			if (file != undefined) {
				var link = '<div class="message-file img-responsive img-rounded">' +
								'<a href="' + url + file + '" target="_blank">' +
									'<img class="message-image" src="' + url + thumbnail + '"/>' +
								'</a>' +
							'</div>';
			} else {
				var link = '';
			}

			messageOutput = '<li>' +
								'<div class="message-name">' + username + '</div>' +
								'<div class="message-body">' +
									link + message +
								'</div>' +
								'<div class="message-time">' + created + '</div>' +
							'</li>';

			return messageOutput;
		}

	}

	/*
	*	Create the html for a private chat
	*/
	ui.prototype.privateChatRoom = function () {
		var html = '<div class="private-chat chat room">' +
								'<div class="row">' +
									'<div class="col-xs-12 pc-header">' +
										'<div class="pc-hide">' +
											'<span class="glyphicon glyphicon-remove"></span>' +
										'</div>' + 
									'</div>' +

								'</div>' +
								'<div class="row">' +
									'<div class="col-xs-12 chat-messages">' +
										'<ul class="list-unstyled">' +
										'</ul>' +
									'</div>' +
								'<div class="col-xs-12 chat-form">' +
									'<form>' +
										'<div class="row">' +
											'<div class="col-xs-10" style="padding: 0px;">' +
												'<div class="form-group">' +
													'<input type="text" class="message form-control"/>' +
												'</div>' +
											'</div>' +
											'<div class="col-xs-2">' +
												'<div class="form-group">' +
													'<input type="hidden" class="name">' +
													'<input type="hidden" class="private" value="private">' +
													'<button class="btn btn-primary form-control" type="submit">SEND</button>' +
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="row">' +
											'<div class="col-xs-12">' +
												'<div class="radio-inline" style="display: none">' +
													'<label>' +
														'<input type="radio" name="msgType" value="normal" class="reset-radio" checked>' +
														'Normal' +
													'</label>' +
												'</div>' +
											'</div>' +
										'</div>' +
									'</form>' +
								'</div>' +
							'</div>';


		return html;
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
		var chatHTML = '<div class="chat room">' +
								'<div class="row">' +
									'<div class="col-xs-12 chat-messages">' +
										'<ul class="list-unstyled">' +
										'</ul>' +
									'</div>' +
								'<div class="col-xs-12 chat-form">' +
									'<form>' +
										'<div class="row">' +
											'<div class="col-xs-9 message-info" style="padding: 0px;">' +
												'<div class="form-group">' +
													'<input type="text" class="message form-control"/>' +
													'<input style="display: none;"" type="file" class="file form-control"/>' +
												'</div>' +
											'</div>' +
											'<div class="col-xs-1">' +
												'<div class="form-group">' +
													'<input type="hidden" class="name">' +
													'<button class="image-upload btn btn-info form-control" type="button"><span class="glyphicon glyphicon-paperclip"></span></button>' +
												'</div>' +
											'</div>' +
											'<div class="col-xs-2">' +
												'<div class="form-group">' +
													'<input type="hidden" class="name">' +
													'<button class="btn btn-primary form-control" type="submit">SEND</button>' +
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="radios-meta row">' +
											'<div class="col-xs-12">' +
												'<div class="radio-inline">' +
													'<label>' +
														'<input type="radio" name="msgType" value="normal" class="reset-radio" checked>' +
														'Normal' +
													'</label>' +
												'</div>' +
												'<div class="radio-inline">' +
													'<label>' +
														'<input type="radio" name="msgType" value="pnc">' +
														'Private and Confidential' +
													'</label>' +
												'</div>' +
												'<div class="radio-inline">' +
													'<label>' +
														'<input type="radio" name="msgType" value="fxd">' +
														'Fixed' +
													'</label>' +
												'</div>' +
												'<div class="radio-inline">' +
													'<label>' +
														'<input type="radio" name="msgType" value="subs">' +
														'Subs' +
													'</label>' +
												'</div>' +
												'<div class="radio-inline">' +
													'<span class="filestoupload"></span>' +
												'</div>' +

											'</div>' +
										'</div>' +
									'</form>' +
								'</div>' +
							'</div>';

		var excelHTML = '<div class="excel room">' +
							'<div class="row">' +
								'<div class="col-xs-12">' +
									'<div class="excel-options">' +
										'<div class="btn-group options">' +
											'<a class="btn btn-primary save-to-excel pull-left">Download</a>' +
											'<a class="btn btn-info view-edits" data-toggle="modal" data-target="#viewedits">View Edits</a>' +
											'<a class="btn btn-info excel-edit pull-left">Edit</a>' +
											'<div class="btn-group edit-options soft-hide">' +
												'<a class="btn btn-primary excel-update">Update</a>' +
												'<a class="btn btn-warning excel-cancel">Cancel</a>' +
											'</div>' +
										'</div>' +
										'<div class="message soft-hide"></div>' +
									'</div>' +
									'<div class="hot"></div>' +
								'</div>' +
							'</div>' +
						'</div>';

		var linkHTML = '<li class="link"><a><span class="badge messageCount" style="float:right;"></span></a></li>';

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
				var msg = this.ui.message(false, message.message, message.file, message.thumbnail, message.username, message.created);

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
		var badge = $link.find('a').html();
		$link.find('a').html(room.name + badge);

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

})(jQuery);