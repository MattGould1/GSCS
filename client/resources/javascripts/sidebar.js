(function ($) {
	$('.hide-links').on('click', function () {
		$this = $(this);

		var parent = $this.parent().parent().parent();
		parent.find('.link').hide({
			'duration': 500,
		});
		$this.hide();
		$this.siblings('.show-links').show();
	});
	$('.show-links').on('click', function () {
		$this = $(this);

		var parent = $this.parent().parent().parent();
		parent.find('.link').show({
			'duration': 500,
		});
		$this.hide();
		$this.siblings('.hide-links').show();
	});
})(jQuery);