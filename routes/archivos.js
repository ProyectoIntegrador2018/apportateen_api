var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/',db.getArchivosAdmn);
router.post('/', db.createArchivoAdmn);
router.delete('/delete/:id',db.deleteArchivoAdmn);
router.get('/user/:id',db.getArchivoUser);
router.get('/admin/user_files/:id', db.getArchivoAdminByUsers);

module.exports = router;