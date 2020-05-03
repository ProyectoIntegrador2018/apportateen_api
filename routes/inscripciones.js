var express = require('express');
var router = express.Router();
var db = require('../queries');


router.post('/', db.createInscripcion);


module.exports = router;
