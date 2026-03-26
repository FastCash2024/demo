// src/api/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 👇 Importamos nuestro nuevo Middleware de seguridad
const authMiddleware = require('../middleware/authMiddleware');

// Rutas Públicas (Cualquiera puede entrar)
router.get('/test', userController.testUser);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);  // <-- ruta legacy restaurada
router.post('/request-otp', userController.requestOtp);
router.post('/validate-otp', userController.validateOtp);

// 👇 NUEVA RUTA PRIVADA (Solo entras con Token)
// Fíjate cómo metemos "authMiddleware" en medio de la ruta y la respuesta
router.get('/perfil', authMiddleware, (req, res) => {
  // Si llegamos a esta línea, es porque el middleware nos dejó pasar
  // y nos dejó los datos del usuario en req.user
  res.json({
    mensaje: '¡Bienvenido a la zona VIP! 🍸',
    tusDatosSecretos: req.user
  });
});

module.exports = router;