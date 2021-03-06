(function ($) {

// var location = '<div class="form-group">
// 					<label class="col-xs-2 control-label" for="location">Location</label>
// 					<div class="col-xs-10">
// 						<input class="form-control locations" type="text" name="locations"/>
// 					</div>
// 				</div>';
	var location = '<div class="form-group">' +
						'<label class="col-xs-2 control-label" for="location">Location</label>' +
						'<div class="col-xs-10">' +
							'<input style="width: 70%; float:left"  class="form-control locations" type="text" name="locations"/>' +
							'<a style="width: 25%; float:left" class="delete btn btn-primary">Delete</a>' +
						'</div>' +
					'</div>';
// var department = '<div class="form-group">
// 					<label class="col-xs-2 control-label" for="department">Department</label>
// 					<div class="col-xs-10">
// 						<input class="form-control departments" type="text" name="departments"/>
// 					</div>
// 				</div>';

	var department = '<div class="form-group">' +
						'<label class="col-xs-2 control-label" for="department">Department' +
						
						'</label>' + 
						'<div class="col-xs-10">' +
							'<input style="width: 70%; float:left" class="form-control departments" type="text" name="departments"/>' +
							'<a style="width: 25%; float:left" class="delete btn btn-primary">Delete</a>' +
						'</div>' + 

					'</div>';
function makeLoc(value) {
	var location = '<div class="form-group">' +
						'<label class="col-xs-2 control-label" for="location">Location</label>' +
						'<div class="col-xs-10">' +
							'<input style="width: 70%; float:left" value="' + value + '" class="form-control locations" type="text" name="locations"/>' +
							'<a style="width: 25%; float:left" class="delete btn btn-primary">Delete</a>' +
						'</div>' +
					'</div>';
	return location;
}

function makeDep(value) {
	var department = '<div class="form-group">' +
						'<label class="col-xs-2 control-label" for="department">Department' +
						
						'</label>' + 
						'<div class="col-xs-10">' +
							'<input style="width: 70%; float:left" value="' + value + '" class="form-control departments" type="text" name="departments"/>' +
							'<a style="width: 25%; float:left" class="delete btn btn-primary">Delete</a>' +
						'</div>' + 

					'</div>';
	return department;
}

function setLocDep() {
	if (locations.length <= 0) {
		$('#locdep').find('.for-location').append(location);
	} else {
		locations.forEach( function (loc, i) {
			$('#locdep').find('.for-location').append(makeLoc(loc.locations));
		});
	}

	if (departments.length <= 0) {
		$('#locdep').find('.for-department').append(department);
	} else {
		departments.forEach( function (dep, i) {
			$('#locdep').find('.for-department').append(makeDep(dep.departments));
		});
	}
}

window.setLocDep = setLocDep;
$('#locdep').on('click', '.delete', function (e) {
	e.preventDefault();
	console.log('delete');
	$(this).parent().parent().remove();
	var input = $(this).siblings('input');
console.log(input.val());
	$.ajax({
		url: url + '/admin/locdep/delete',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token,
			data: {
				type: input.attr('name'),
				value: input.val()
			}
		}),
		beforeSend: function() {
			
		},
		success: function (data, status, xhr) {
			$('#settings').find('.savesuccess').show().html('').append('Successfully deleted!');
			setTimeout( function () {
				$('#settings').find('.savesuccess').hide();
			}, 5000);

		},
		error: function (xhr, status, error) {

		}
	});
});
//add new input box
$('#locdep').on('click', '.add-location', function (e) {
	e.preventDefault();
	var div = $(this).parents('.form-group').siblings('.for-location');
	div.append(location);
});

$('#locdep').on('click', '.add-department', function (e) {
	e.preventDefault();
	var div = $(this).parents('.form-group').siblings('.for-department');
	div.append(department);
});

$('#locdep').on('click', '.locdep-save', function (e) {
	e.preventDefault();
	var locArray = [];
	var depArray = [];
	$('.locations').each( function (i) {
		if ($(this).val() != '') {
			console.log($(this).val());
			locArray.push($(this).val());
		}
	});

	$('.departments').each( function (i) {
		if ($(this).val() != '') {

			depArray.push($(this).val());
		}
	});
	console.log(depArray);
	$.ajax({
		url: url + '/admin/locdep',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			token: token,
			locations: locArray,
			departments: depArray
		}),
		beforeSend: function() {
			
		},
		success: function (data, status, xhr) {
			$('#settings').find('.savesuccess').show().append('Successfully updated!');
			setTimeout( function () {
				$('#settings').find('.savesuccess').hide();
			}, 5000);
			locations = data.locations;
			departments = data.departments;
		},
		error: function (xhr, status, error) {

		}
	});
});
})(jQuery);