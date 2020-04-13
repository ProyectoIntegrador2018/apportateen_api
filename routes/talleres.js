var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getTalleres);
router.get('/detalle/:id', db.getTaller);
router.get('/:id', db.getCorreosByTallerId);
router.post('/', db.createTaller);
router.put('/:id', db.updateTaller);
router.delete('/:id', db.removeTaller);

module.exports = router;
