(function ($) {

	this.ui = function () {
	}

	//public
	ui.prototype.init = function () {
			// 		var offset = 1;
			// setInterval(function () {aler
			// 	var load = {
			// 		offset: offset,
			// 		id: '566f3a10e75906be36d74ebd',
			// 	}
			// 	socket.emit('moremessages', load);
			// 	socket.emit()
			// 	offset++;
			// }, 3000);
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
					var chatHeight = contentHeight - 80;
					cform.siblings('.chat-messages').css('height', chatHeight + 'px');
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

	ui.prototype.emotes = function (message) {
		var path = cURL + '/img/';

		var emotes = {
			angel: {
				link: path + 'angel.png',
				icon: 'O:)'
			},
			devil: {
				link: path + 'devil.png',
				icon: '3:)'
			},
			smile: {
				link: path + 'smile.png',
				icon: ':)'
			},
			big_smile: {
				link: path + 'big_smile.png',
				icon: ':D'
			},
			cry: {
				link: path + 'cry.png',
				icon: ':\'('
			},
			sad: {
				link: path + 'sad.png',
				icon: ':('
			},
			Tongue: {
				link: path + 'tongue.png',
				icon: ':P'
			},
			tongue: {
				link: path + 'tongue.png',
				icon: ':p'
			},
			confused: {
				link: path + 'confused.png',
				icon: 'o.O'
			},
			wink: {
				link: path + 'wink.png',
				icon: ';)'
			},
			surprise: {
				link: path + 'surprise.png',
				icon: ':O'
			},
			squint: {
				link: path + 'squint.png',
				icon: '-_-'
			},
			angry: {
				link: path + 'angry.png',
				icon: '>:O'
			},
			kiss: {
				link: path + 'kiss.png',
				icon: ':*',
			},
			love: {
				link: path + 'love.png',
				icon: '<3'
			},
			cheerful: {
				link: path + 'cheerful.png',
				icon: '^_^'
			},
			shark: {
				link: path + 'shark.png',
				icon: '(^^^)'
			}
		}
		var Message = message;

		for (var key in emotes) {
			var emote = emotes[key];
			var Message = Message.replace(emote.icon, '<img src="' + emote.link + '"/>');
		}
		return Message;
	}

	/*
	*	loads more messages
	*/
	ui.prototype.gotoBottom = function ($el) {
		$el.scrollTop($el[0].scrollHeight);
		var wait = 0;
		$($el).scroll(function () {
			if (loadMoreMessages == 1) {
				if (wait == 0) {
					position = $el.scrollTop();
					if (position < 50) {
						wait = 1;
						//make a call to server to load more posts append them at top disable scrolling while this occurs
						$this = $(this);
						var container = $this.parent().parent();
						if (container.find('.filter').val() == 'normal') {
							var html = '<li class="chat-waiting"><div class="waiting-for-messages">Loading please wait...</div></li>';
							var current = parseInt(container.attr('loaded'));
							if (current > 0) {
								container.prepend(html);
							}
							setTimeout(function () {
								//get current offset
								var current = parseInt(container.attr('loaded'));
								if (current > 0) {
									//send offset with chatroom id
									var load = {
										offset: current,
										id: container.attr('data-_id-chat')
									};
									socket.emit('moremessages', load);
									//update the offset
									current++;
									container.attr('loaded', current);
									//make sure we don't spam the server constantly
									wait = 0;
								} 
							}, 2000);
						} else {
							setTimeout(function () {
								wait = 0;
							}, 2000);
						}
					}
				}
			}
		});
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
		var Class = '';
		if (!private) {
			if (isCurrentUser.call(this, username)) {
				Class = 'my-message';
				Edit = '<span class="edit-my-message">Edit?</span>';
			} else {
				Edit = '';
				Class = 'not-my-message';
			}
			if (file != undefined && file != false) {	
				var link = '<div class="message-file img-responsive img-rounded">' +
								'<a href="' + url + file + '" target="_blank">' +
									'<img class="message-image" src="' + url + thumbnail + '"/>' +
								'</a>' +
							'</div>';
			} else {
				var link = '';
			}

			messageOutput = '<li class="' + Class + '">' +
								'<div class="message-name">' + username + Edit + '</div>' +
								'<div class="message-body">' +
									link + message +
								'</div>' +
								'<div class="message-time">' + moment(created).format('MMM-D LT') + '</div>' +
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
														'All' +
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
														'<div class="image-container"><div class="image-preview">' +
															'<img src="#" style="display: none;" class="preview"/>' +
														'</div></div>' +
														'<input style="display: none;"" type="file" class="file form-control"/>' +
													'</div>' +
												'</div>' +
												'<div class="col-xs-1">' +
													'<div class="form-group">' +
														'<input type="hidden" class="name">' +
														'<button class="image-upload btn btn-primary form-control" type="button"><span class="glyphicon glyphicon-paperclip"></span></button>' +
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
														'<label for="msgType">' +
															'<input type="radio" name="msgType" value="normal" class="reset-radio" checked>' +
															'All' +
														'</label>' +
													'</div>' +
													'<div class="radio-inline">' +
														'<label for="msgType">' +
															'<input type="radio" name="msgType" value="pnc">' +
															'Private and Confidential' +
														'</label>' +
													'</div>' +
													'<div class="radio-inline">' +
														'<label for="msgType">' +
															'<input type="radio" name="msgType" value="fxd">' +
															'Fixed' +
														'</label>' +
													'</div>' +
													'<div class="radio-inline">' +
														'<label for="msgType">' +
															'<input type="radio" name="msgType" value="subs">' +
															'Subs' +
														'</label>' +
													'</div>' +
													'<div class="radio-inline" style="float: right;">' +
														'<span class="message-loadmoremessages" style="display: none;">' +
																'<button class="button loadmoremessages">Load More Messages</button>' +
														'</span>' +
													'</div>' +
													'<div class="radio-inline" style="float: right;">' +
														'<span class="message-filter">' +
															'<label for="filter">Filter messages: ' +
																'<select name="filter" class="filter">' +
																	'<option value="normal">All</option>' +
																	'<option value="pnc">Private and Confidential</option>' +
																	'<option value="fxd">Fixed</option>' +
																	'<option value="subs">Subs</option>' +
																'</select>' +
															'</label>' +
														'</span>' +
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
		var wordHTML = '<div class="word room">' +
							'<div class="row">' +
								'<div class="col-xs-12">' +
									'<div class="word-options">' +
										'<div class="btn-group options">' +
											// '<a class="btn btn-primary save-to-word pull-left">Download</a>' +
											// '<a class="btn btn-info view-edits" data-toggle="modal" data-target="#viewedits">View Edits</a>' +
											'<a class="btn btn-info word-edit pull-left">Edit</a>' +
											'<div class="btn-group edit-options soft-hide">' +
												'<a class="btn btn-primary word-update">Update</a>' +
												'<a class="btn btn-warning word-cancel">Cancel</a>' +
											'</div>' +
										'</div>' +
									'</div>' +
									'<div class="message soft-hide"></div>' +
								'</div>' +
								'<div class="col-xs-12">' +
									'<textarea></textarea>' +
								'</div>' +
							'</div>' +
						'</div>';

		var linkHTML = '<li class="link"><a><span class="badge messageCount" style="float:right;"></span></a></li>';

		//turn html into jquery objects
		$chat = $($.parseHTML(chatHTML));
		$excel = $($.parseHTML(excelHTML));
		$word = $($.parseHTML(wordHTML));
		$link = $($.parseHTML(linkHTML));
		
		if (type === '-chat') {
			newContainer = $chat;
			newContainer.find('.loadmoremessages').attr('data-options-_id', room._id);
		} else if (type === '-excel') {
			newContainer = $excel;
		} else if (type === '-word') {
			newContainer = $word;
			newContainer.find('textarea').attr('id', room._id);
		}

		//add class to container
		newContainer.addClass(room.name);
		newContainer.attr('data-_id' + type, room._id);
		newContainer.attr('loaded', 1);
		//add attribute with type
		newContainer.attr('data-filter', room.name + type);
		//add hidden name attribute for sending data use _id as won't change
		newContainer.find('.name').val(room._id);
		newContainer.find('a').attr('data-link_id', room._id);
		//change title
		newContainer.find('.title').text(room.name);
		if (room._messages != undefined) {
			count = 0;
			room._messages.reverse().forEach( function (message, i) {
				//look for emotes and replace them
				var messageBody = this.ui.prototype.emotes.call(this, message.message);

				var msg = this.ui.prototype.message.call(this, false, messageBody, message.file, message.thumbnail, message.username, message.created);
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

		if (type === '-word') {
			wordObj.init(room);
		}
		
		//append link to list
		$(typeLink).append($link);

	}

	ui.prototype.alertsOpen = function (message = 'Please wait...') {
		$('#alerts').show();
		$('#alerts').find('.message').html(message);
	}

	ui.prototype.alertsClose = function (me = false) {
		$('#alerts').hide();
	}

	ui.prototype.myEdit = function (element, message = 'You are currently editting!') {
		element.append('<div class="edits">' + message + '</div>');
	}

	ui.prototype.notMyEdit = function (element, message = 'You are not editting!') {
		element.append('<div class="edits">' + message + '</div>');
	}

	ui.prototype.removeEdits = function (element) {
		element.find('.edits').remove();
	}
	//handles activity notifications, as well as flashing titles
	//@TODO implement beep into this rather than at chat.js
	// privatechat boolean
	ui.prototype.activityCount = function (container, element, privatechat, activity = 'Recent activity!') {
		logger('activitycount');
		if (privatechat) {
			var chatPartner = $('[data-_id="' + element + '"]');
			if (!container.is(':visible')) {
				var badge = chatPartner.find('.messageCount');
				var count = +badge.html();
				badge.html(count + 1);
			}
			//reassign element var
			element = chatPartner;
		} else {
			if (!container.is(':visible')) {
				var badge = element.find('.messageCount');
				var count = +badge.html();
				badge.html(count + 1);
			}
		}

		//is the window in focus? lets make it flash!
		if (!window_focus) {
			logger('window is out of focus');
			var content = 'GSCS - ' + activity;
			keepFlashimesng = true;
			flashTitle.call(this, content, element);
		}
	}

	ui.prototype.findUser = function (id) {
		if (id) {
			console.log(users[id]);
			return users[id];
		}
		return false;
	}


	ui.prototype.isCurrentUser = function (username) {
		if (username == user.username) {
			return true;
		}
		return false;
	}
	
	function isCurrentUser(username) {
		if (username == user.username) {
			return true;
		}
		return false;
	}

	function flashTitle(content, element) {
		var flash = setInterval(function () {
			var title = $('title');
			//set the titles
			if (title.html() == 'GSCS') {
				title.html(content);
			} else {
				title.html('GSCS');
			}
			//clear interval if message count or window focus changes
			if (element.find('.messageCount').html() == '' || window_focus == true) {
				title.html('GSCS');
				window.clearInterval(flash);
			}
		}, 1000);
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