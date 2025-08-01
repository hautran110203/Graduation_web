const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');

// CRUD đơn vị
router.get('/', unitController.getAllUnits);
router.get('/:unit_code', unitController.getUnitByCode);
router.post('/', unitController.createUnit);
router.put('/:unit_code', unitController.updateUnit);
router.delete('/:unit_code', unitController.deleteUnit);

module.exports = router;
