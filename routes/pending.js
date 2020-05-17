var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getPendingPayments);
router.put('/aceptar', db.aceptarComprobante)
router.put('/rechazar', db.rechazarComprobante)
module.exports = router;