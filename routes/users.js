var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getAllUsers);
router.get('/:id', db.getUser);
router.post('/', db.createUser);



module.exports = router;
