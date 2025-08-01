// graduation.routes.js
const express = require('express');
const router = express.Router();
const graduationController = require('../../controllers/adminUnit/graduation.controller');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/details', graduationController.getGraduationDetails);
router.post('/upload', upload.single('file'), graduationController.uploadGraduationList);
router.put('/students/:user_code', graduationController.updateStudent);
router.delete('/students/:user_code', graduationController.deleteStudent);
router.get('/faculties',graduationController.getFaculties)
module.exports = router;
