var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/:id', db.getGuardianByChildId);
router.post('/', db.createGuardian);



module.exports = router;
