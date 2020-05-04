var express = require('express');
var router = express.Router();
var db = require('../queries');


router.post('/', db.createInscripcion);
router.delete('/:taller_id/:user_id', db.removeInscripcion);


module.exports = router;
