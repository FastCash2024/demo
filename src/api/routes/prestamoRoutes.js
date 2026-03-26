// src/api/routes/prestamoRoutes.js
const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, prestamoController.getPrestamos);
router.post('/', authMiddleware, prestamoController.createPrestamo);
router.patch('/:id/acotaciones', authMiddleware, prestamoController.addAcotacion);

// 👇 NUEVA RUTA GET: Obtener el detalle de UN solo préstamo
router.get('/:id', authMiddleware, prestamoController.getPrestamoById);

module.exports = router;