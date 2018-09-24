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
router.get('/api/sponsors', db.getAllSponsors);
router.post('/api/sponsors', db.createSponsor);
router.get('/api/guardians/:id', db.getGuardianByChildId);
router.post('/api/guardians', db.createGuardian);

module.exports = router;
