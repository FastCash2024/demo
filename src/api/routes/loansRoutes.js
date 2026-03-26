// src/api/routes/loansRoutes.js
const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loansController');
const authMiddleware = require('../middleware/authMiddleware');

// GET: Obtener todos los loans
router.get('/', authMiddleware, loansController.getLoans);

// POST: Crear un nuevo loan
router.post('/', authMiddleware, loansController.createLoan);

// GET: Obtener un loan específico por ID
router.get('/:id', authMiddleware, loansController.getLoanById);

module.exports = router;
