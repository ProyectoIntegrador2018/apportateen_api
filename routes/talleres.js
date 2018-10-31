var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getTalleres);
router.post('/', db.createTaller);
router.put('/:id', db.updateTaller);
router.delete('/:id', db.removeTaller);

module.exports = router;
