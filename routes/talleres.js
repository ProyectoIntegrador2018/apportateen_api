var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getTalleres);
/*router.post('/', db.createSede);
router.put('/:id', db.updateSede);
router.delete('/:id', db.removeSede);*/



module.exports = router;
