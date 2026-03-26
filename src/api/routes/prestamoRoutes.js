// src/api/routes/prestamoRoutes.js
const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const prestamoDetalleController = require('../controllers/prestamoDetalleController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, prestamoController.getPrestamos);
router.post('/', authMiddleware, prestamoController.createPrestamo);
router.patch('/:id/acotaciones', authMiddleware, prestamoController.addAcotacion);

// 👇 RUTA: Obtener detalle COMPLETO del préstamo para /perfil-cliente
router.get('/detalle/:id', authMiddleware, prestamoDetalleController.getPrestamoDetalle);

// 👇 RUTA: Obtener todos los préstamos de un cliente por email
router.get('/cliente/:email', authMiddleware, prestamoDetalleController.getPrestamosPorEmail);

// 👇 RUTA ORIGINAL: Obtener el detalle de UN solo préstamo
router.get('/:id', authMiddleware, prestamoController.getPrestamoById);

module.exports = router;