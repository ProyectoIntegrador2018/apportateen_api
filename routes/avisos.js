var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getAvisos);
router.get('/:id', db.getAvisosForUser);
router.post('/', db.createAviso);
router.put('/:id', db.updateAviso);
router.delete('/:id', db.removeAviso);



module.exports = router;
