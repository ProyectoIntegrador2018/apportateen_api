var express = require('express');
var router = express.Router();
var db = require('../queries');


router.post('/', db.createInscripcion);
router.get('/:user_id', db.getTalleresInscritos);
router.delete('/:taller_id/:user_id', db.removeInscripcion);
router.put('/comprobante', db.subirComprobante);

module.exports = router;
