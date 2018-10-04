var express = require('express');
var router = express.Router();
var db = require('../queries');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ApportaTeen API' });
});


module.exports = router;
