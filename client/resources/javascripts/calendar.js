(function ($) {

	this.calendar = function () {

	}

	calendar.prototype.init = function (events) {
		var copyEvent = {};
		var fullCalendarContainer = $('#fullcalendar');

		var start_g;
		var end_g;
		var allDay_g;
		var event_obj;

		logger('init calendar');
		logger(events);
		var options = {
			editable: true,
			eventStartEditable: true,
			eventDurationEditable: true,
			forceEventDuration: true,
			customButtons: {
				myCustomButton: {
					text: 'custom!',
					click: function() {
						alert('clicked the custom button!');
						copyEvent.title = 'hello';
						calendar.fullCalendar('renderEvent', copyEvent, true);
						calendar.fullCalendar('unselect');
					}
				}
			},
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek'
			},
			height: Height.call(this),
			selectable: true,
			selectHelper: true,
			select: function(start, end, allDay) {
				logger('Selecting event');

				start_g = String(start);
				end_g = String(end);
				allDay_g = String(allDay);

				var create_event = $('#create-event');

				create_event.modal();

			},
			events: events,
			eventClick: function (event, jsEvent, view) {
				logger('Clicking event');
				logger(event);
				//the edit element
				var edit_event = $('#edit-event');
				event.edit_id = 'none yet';

				event_obj = event;

				//fill out the modal data
				edit_event.find('.event-title').val(event.title);
				edit_event.find('.event-description').val(event.description);
				edit_event.find('.start-date').html(String(event.start._d));
				edit_event.find('.end-date').html(String(event.end._d));
				edit_event.find('.created-by').html(String(event.username));
				edit_event.find('.edit-by').html(String(event.edit_username));

				//open the modal
				$('#edit-event').modal();
			},
			eventAfterRender: function (event, a, b) {
				logger('Events rendered');
			},
			eventResize: function(event, delta, revertFunc) {
				logger('Event resized');
				saveEvent.call(this, false, String(event.start.format()), String(event.end.format()), calendar, event, true);
			},
			eventDrop: function (event, jsEvent, ui, view) {
				logger('Event moved');
				saveEvent.call(this, false, String(event.start.format()), String(event.end.format()), calendar, event, true);
			}
		};

		var calendar = fullCalendarContainer.fullCalendar(options);

		var create_event = $('#create-event');
		var edit_event = $('#edit-event');

		edit_event.find('.save-event').click(function (e) {
			e.preventDefault();

			logger('saving edit event');

			if (edit_event.find('.event-title').val() != '') {
				start = String(event_obj.start._id);
				end = String(event_obj.end._d);

				saveEvent.call(this, edit_event, start, end, calendar, event_obj, true, false);
			}
		});

		create_event.find('.save-event').click(function (e) {
			e.preventDefault();

			logger('saving event');

			if (create_event.find('.event-title').val() != '') {
				saveEvent.call(this, create_event, start_g, end_g, calendar, false, false, false);
			}


		});


		$('.Calendar').click(function (e) {
			e.preventDefault();
			logger('clicked on calendar item');
			
			setTimeout(function () {
				calendar.fullCalendar('render');
			}, 100);
		});
		socketioCalendar(calendar);
	}

	function saveEvent(element, start_g, end_g, calendar, event_o, update, allDay) {
		logger('saving event');
		logger('update: ' + update);
		logger(event_o);

		start_g = moment(start_g).format('YYYY-MM-DD');
		end_g = moment(end_g).format('YYYY-MM-DD');

		if (element) {
			var title = element.find('.event-title').val();
			var description = element.find('.event-description').val();

			element.find('input').val('');
			element.find('textarea').val('');
		} else {
			var title = event_o.title;
			var description = event_o.description;
		}

		if (update == false) {
			logger('saving new event');
			eventInfo = {
				title: title,
				description: description,
				start: start_g,
				end: end_g,
				//allDay: allDay_g,
				username: user.username,
				user_id: user._id
			};

		} else {
			logger('saving old event');

			event_o.title = title;
			event_o.description = description;
			event_o.username = user.username;
			event_o.user_id = user._id;

			eventInfo = {
				_id: event_o._id, 
				title: title,
				description: description,
				start: start_g,
				end: end_g,
				username: user.username,
				user_id: user._id,
				update: true
			};
		}

		eventInfo.allDay = true;

		logger('eventInfo');
		logger(eventInfo);

		socket.emit('saveEvent', eventInfo);
	}

	function Height() {
		var header = $('#header').outerHeight();
		var footer = $('#footer').outerHeight();

		var _window = $(window).outerHeight();

		//61 is the height of the bar above the excel
		return _window - footer - header;
	}

	function Width() {
		return $('#content').outerWidth();
	}

	//receive socket events here and handle accordingly //pass the calendar for fun times
	function socketioCalendar (calendar) {
		socket.on('renderEvent', function (event) {
			logger('events saved and socketio is rendering');
			logger(event);
			if (event.update) {
				logger('updating');
				var event_obj1 = calendar.fullCalendar('clientEvents', [event._id]);
				event_obj1[0].start = event.start;
				event_obj1[0].end = event.end;
				calendar.fullCalendar('updateEvent', event_obj1[0]);
				calendar.fullCalendar('unselect');
			} else {
				logger('creating new');
				calendar.fullCalendar('renderEvent', event, true);
				calendar.fullCalendar('unselect');
			}
		});
	}

})(jQuery);