var admin, token, users, chatrooms, excels, locations, departments, systeminfo;

var url = 'http://localhost:8080';
admin = $('#admin');

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
}
$('.savesuccess').hide();
$('.createexcel-fail').hide();
