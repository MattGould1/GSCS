//ui functions
(function ($) {


	//onload
	function showState() {
		var activeLink = $('.links').find('.active').attr('data');

		admin.children('div').each( function (i) {
			$this = $(this);

			$this.hide();

			//console.log(activeLink);
			if ($this.attr('id') == activeLink) {
				$this.show();

				$this.children('div').each( function() {
					$(this).hide();
				});
				$this.children().first('div').show();
			}

		});
	}

	showState();

	function hideNshow() {
		$(document).on('click', '.list-group-item', function() {
			//remove all active clases and reapply to $(this)
			$this = $(this);

			$('.list-group-item').each( function () {
				$(this).removeClass('active');
			});

			$this.addClass('active');

			showState();
		});
	}

	hideNshow();

	$(document).ready(function(){
	    $('[data-toggle="tooltip"]').tooltip();   
	});

})(jQuery);