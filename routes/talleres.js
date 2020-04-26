var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/costos', db.getCostos);
router.put('/costos', db.updateCostos);
router.get('/', db.getTalleres);
router.get('/:id', db.getCorreosByTallerId);
router.post('/', db.createTaller);
router.put('/:id', db.updateTaller);
router.delete('/:id', db.removeTaller);

module.exports = router;
