var express = require('express'),
    fs = require('fs'),
    path = require('path');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var index = require('./routes/index');
var admin = require('./routes/admin');

// var ip = req.headers['x-forwarded-for'] || 
//      req.connection.remoteAddress || 
//      req.socket.remoteAddress ||
//      req.connection.socket.remoteAddress;

//static file path
app.use(express.static(path.join(__dirname, 'public')));
app.use (function (req, res, next) {
	var access_log = {
		'time': Date.now(),
		'url': req.url,
		'x-forwarded-for': req.headers['x-forwarded-for'],
		'connection remote address': req.connection.remoteAddress,
		'socket remore address': req.socket.remoteAddress,
		'client peername': req.client._peername,
		'client user agent': req.headers
	};
	var options = {
		'encoding': 'utf8',
		'mode': '0o666',
	};
	console.log(access_log);
	fs.appendFile('access_log.txt', JSON.stringify(access_log, ',', 2), function (err) {
	  if (err) throw err;
	  console.log('The "data to append" was appended to file!');
	});
	next();
});
//routes
app.use('/', index);
app.use('/admin', admin);


var server = require('http').createServer(app);

server.listen(8088, function(){
  console.log('listening on *:80');
});

module.exports = app;
