//hide and show elements

/*
*
* structure, li a data-link NAME
* div data-link NAME
*
*/
//make jquery available inside
(function ($) {

	//constructor
	this.hideNshow = function() {
		this.hide = null;
		this.show = null;

		var defaults = {
			main: null,
			Link: null,
			Container: null,
			defaultActive: 1,
			init: false,
		};

		// Create options by extending defaults with the passed in arugments
		if (arguments[0] && typeof arguments[0] === "object") {
			this.options = extendDefaults(defaults, arguments[0]);
		}

	}

	//public methods
	hideNshow.prototype.init = function ($this) {
		if (this.options.init === false) {
			//we're initting so make this true now
			this.options.init = true;
			//call init
			init.call(this);
		} else {
			if ($this !== undefined) {
				showNtell.call(this, $this);
			}
		}
	}

	//private methods
	function init() {
		//the default link/container to be visible
		var chosenOne = this.options.defaultActive;

		//hide all but the chosen one
		this.options.Container.each(function (i) {
			careTaker($(this));
			if (i === chosenOne) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});

		this.options.Link.each( function (i) {
			careTaker($(this));
			if ( i === chosenOne) {
				$(this).addClass('active');
				return false;
			}
		});
	}

	function careTaker(that) {
		if (that.attr('data-filter') === undefined) {
			that.remove();
		}
	}

	function showNtell(that) {
		//remove current active
		this.options.Link.removeClass('active');

		//add active to new current
		that.addClass('active');

		//get data-filter for container
		var show = that.attr('data-filter');

		//compare each container and look for data-filter attr
		this.options.Container.each( function (i) {
			if ($(this).attr('data-filter') === show) {
				$(this).show();
			} else {
				$(this).hide();
			}
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