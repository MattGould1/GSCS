/*
* Hide and show elements with data-filter attribute
*
* defaults:
* 		  	Body: used for jquery .on, a more specific jQuery object will improve performance
*		   	Link: jQuery Object for click event
* 			Container: jQuery Object to hide/show
* 			defaultActive: Numeric the container to show by default
*			
*			<div data-filter="show">SHOW ME</div>
*			<a data-filter="show">Show the div</a>
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
			that.remove();
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

			//get the data-filter attribute, used to search for corresponding container with same data-filter
			var show = $(this).attr('data-filter');

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