var express = require('express'),
	router = express.Router();

router.get('/', function (req, res, next) {
	res.render( 'layout/index', { title: 'EWB' });
});

module.exports = router;