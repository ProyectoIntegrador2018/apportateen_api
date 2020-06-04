var express = require('express');
var router = express.Router();
var db = require('../queries');


router.get('/', db.getPendingPayments);
router.put('/aceptar', db.aceptarComprobante)
router.put('/rechazar', db.rechazarComprobante)
router.get('/accepted', db.getAcceptedPayments);
module.exports = router;