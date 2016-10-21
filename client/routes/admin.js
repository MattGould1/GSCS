var express = require('express'),
	router = express.Router();

router.get('/', function (req, res, next) {
	res.render( 'admin/index', { title: 'EWB' });
});

router.get('/test', function (req, res, next) {
	res.render('admin/gscs/index', {});
});

module.exports = router;