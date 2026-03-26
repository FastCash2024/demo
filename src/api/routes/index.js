// src/api/routes/index.js
const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const prestamoRoutes = require('./prestamoRoutes'); // <-- 1. Importamos las rutas
const loansRoutes = require('./loansRoutes'); // <-- 2. Importamos rutas de loans

router.use('/users', userRoutes);
router.use('/prestamos', prestamoRoutes); // <-- 3. Las activamos en la URL /api/prestamos
router.use('/loans', loansRoutes); // <-- 4. Las activamos en la URL /api/loans

module.exports = router;