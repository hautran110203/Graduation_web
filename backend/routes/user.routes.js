const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/create',userController.createUser);
router.get('/getUsers', userController.getAllUsers); 
router.get('/get/:user_code', userController.getUser); 
module.exports = router