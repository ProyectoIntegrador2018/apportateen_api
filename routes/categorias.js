var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getCategorias);
router.post('/', db.createCategoria);
router.put('/:id', db.updateCategoria);
router.delete('/:id', db.removeCategoria);



module.exports = router;
