var express = require('express'),
    path = require('path');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var index = require('./routes/index');

//static file path
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/', index);

var server = require('http').createServer(app);

server.listen(8088, function(){
  console.log('listening on *:80');
});

module.exports = app;