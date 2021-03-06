var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/', db.getAllUsers);
router.get('/listaInscripciones', db.getEnrollmentList);
router.get('/:id', db.getUser);
//router.get('/:correo',db.getUserByEmail);
router.post('/', db.createUser);
router.put('/complete/:id', db.updateUserComplete);
router.put('/:id', db.updateUserTaller);
router.delete('/delete/:id', db.removeUser);
router.put('/pago/:id', db.updateUserNumConfPago);



module.exports = router;
