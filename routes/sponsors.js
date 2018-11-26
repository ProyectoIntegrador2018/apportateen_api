var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getAllSponsors);
router.post('/', db.createSponsor);
router.delete('/:id', db.removeSponsor);



module.exports = router;
