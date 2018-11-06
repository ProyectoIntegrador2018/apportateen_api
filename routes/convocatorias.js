var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getEstatusConvocatorias);
router.put('/', db.updateEstatusConvocatorias);
module.exports = router;
