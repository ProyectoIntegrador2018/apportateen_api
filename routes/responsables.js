var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/:correo_responsable', db.getIDResponsable);
router.post('/', db.createResponsable);
router.put('/:id', db.updateResponsable);
router.delete('/:id', db.removeResponsable);


module.exports = router;