// src/api/routes/index.js
const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const prestamoRoutes = require('./prestamoRoutes'); // <-- 1. Importamos las rutas
const loansRoutes = require('./loansRoutes'); // <-- 2. Importamos rutas de loans
const customerRoutes = require('./customerRoutes'); // <-- 3. Importamos rutas de customers

router.use('/users', userRoutes);
router.use('/prestamos', prestamoRoutes); // <-- 4. Las activamos en la URL /api/prestamos
router.use('/loans', loansRoutes); // <-- 5. Las activamos en la URL /api/loans
router.use('/customer', customerRoutes); // <-- 6. Las activamos en la URL /api/customer

module.exports = router;