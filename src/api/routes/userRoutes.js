const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/test', userController.testUser);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/request-otp', userController.requestOtp);
router.post('/validate-otp', userController.validateOtp);

router.get('/me', authMiddleware, userController.getMe);
router.get('/perfil', authMiddleware, userController.getMe);

module.exports = router;
     