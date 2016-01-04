var admin, token, users, chatrooms, excels, locations, departments;

var url = 'http://178.62.100.159:8088';
admin = $('#admin');

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
}