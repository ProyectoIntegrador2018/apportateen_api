var express = require('express');
var router = express.Router();
var db = require('../queries');


router.post('/', db.createInscripcion);
router.post('/delete', db.removeInscripcion);


module.exports = router;
