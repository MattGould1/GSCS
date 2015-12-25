var express = require('express'),
	router = express.Router();

router.get('/', function (req, res, next) {
	res.render( 'admin/index', { title: 'EWB' });
});

module.exports = router;