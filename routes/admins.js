var express = require('express');
var router = express.Router();
var db = require('../queries');


router.post('/agregar', db.addUserAdmin);
router.get('/usuarios', db.getUsersUsuarios);
router.get('/administradores', db.getUsersAdmn);
router.delete('/delete/:id', db.deleteUserAdmin);

module.exports = router;