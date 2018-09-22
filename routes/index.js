var express = require('express');
var router = express.Router();
var db = require('../queries');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ApportaTeen API' });
});

router.get('/api/users', db.getAllUsers);
router.get('/api/users/:id', db.getUser);
router.post('/api/users', db.createUser);


module.exports = router;
