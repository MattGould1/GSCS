(function ($) {
	//connect
	//url format ttp://127.0.0.1:8080/login'
	if($.cookie('token')) {
		token = $.cookie('token');
		$.ajax({
			url: url + '/admin',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				token: token
			}),
			success: function (data, status, xhr) {
				console.log(data);
				users = data.users;
				chatrooms = data.chat;
				excels = data.excels;
				locations = data.locations;
				departments = data.departments;
				systeminfo = data.stats;
				words = data.words;
				window.wordLoad();
				window.dashboardLoad();
				window.setLocDep();
				window.userLoad();
				window.chatLoad();
				window.excelLoad();
			},
			error: function (xhr, status, error) {
				console.log(error)
			}
		});
	}
})(jQuery);