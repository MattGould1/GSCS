/*
* Hide and show elements with data-filter attribute
*
* defaults:
* 		  	Body: used for jquery .on, a more specific jQuery object will improve performance
*		   	Link: jQuery Object for click event
* 			Container: jQuery Object to hide/show
* 			defaultActive: Numeric the container to show by default
* usage:
*			
	hideNshow = new hideNshow({
		body: jQuery('#isAuth'),
		Container: jQuery('.room'),
		Link: jQuery('.link'),
		defaultActive: 1
	});

	hideNshow.init();

	html will look something like this

	<div class="body">
		<div class="link" data-filter="1">
			link1
		</div>
		<div class="link" data-filter="2">
			link2
		</div>

		<div class="room" data-filter"1">
			room1
		</div>

		<div class="room" data-filter="2">
			room2
		</div>
	</div>
*
*/
(function ($) {

	//constructor
	this.hideNshow = function() {

		//default options
		var defaults = {
			body: null,
			Link: null,
			Container: null,
			defaultActive: 1,
		};

		// Create options by extending defaults with the passed in arugments
		if (arguments[0] && typeof arguments[0] === "object") {
			this.options = extendDefaults(defaults, arguments[0]);
		}

	}

	//public methods
	hideNshow.prototype.init = function ($this) {
		init.call(this);
		show.call(this);
	}

	//private methods
	function init() {
		//the default link/container to be visible
		var chosenOne = this.options.defaultActive;

		//jQuery .each container
		this.options.Container.each(function (i) {
			//run careTaker to remove any containers/links without data-filter attribute (they shouldn't exist and will mess with index)
			careTaker($(this));
			//show default container
			if (i === chosenOne) {
				$(this).show();
				var container = $(this).find('.chat-messages');
				if(container.length > 0) {
					container.scrollTop(container[0].scrollHeight + 500);
				}
			} else {
				$(this).hide();
			}
		});

		//jQuery .each container
		this.options.Link.each( function (i) {
			careTaker($(this));
			if ( i === chosenOne) {
				//add class for bootstrap
				$(this).addClass('active');
				//end hunt, nothing else needed
				return false;
			}
		});

	}

	/*
	*	@param that: jQuery Object $(this)
	*/
	function careTaker(that) {
		if (that.attr('data-filter') === undefined) {
			that.hide();
		}
	}

	function show() {
		var options = this.options;
		//attach click handler to .link, this will be used to add active class and show the correct container
		options.body.on('click', '.link', function () {
			//remove current active
			options.Link.removeClass('active');

			//add active to new current
			$(this).addClass('active');

			$(this).find('.messageCount').html('');
			//get the data-filter attribute, used to search for corresponding container with same data-filter
			var show = $(this).attr('data-filter');
			logger(show);
			//jQuery .each container
			options.Container.each( function (i) {
				//show the container if data-filter === link data-filter else hide
				if ($(this).attr('data-filter') === show) {
					$(this).show();
					var container = $(this).find('.chat-messages');
					if(container.length > 0) {
						container.scrollTop(container[0].scrollHeight);
					}
				} else {
					$(this).hide();
				}
			});
			logger('switching view and removing messagecount');
		});
	}

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