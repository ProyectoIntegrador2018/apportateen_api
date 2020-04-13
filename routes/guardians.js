var express = require('express');
var router = express.Router();
var db = require('../queries');


// router.get('/:id', db.getGuardianByChildId);
// router.post('/', db.createGuardian);
router.post('/', db.agregaTutor);
router.get('/:id_tutor', db.getTutor);
router.put('/:id_tutor', db.updateTutor);



module.exports = router;
