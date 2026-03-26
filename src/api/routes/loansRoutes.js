// src/api/routes/loansRoutes.js
const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loansController');
const authMiddleware = require('../middleware/authMiddleware');

// 📋 GET: Obtener todos los loans
router.get('/', loansController.getLoans);

// ➕ POST: Crear un nuevo loan
router.post('/', loansController.createLoan);

// 🔍 GET: Obtener un loan específico por ID
router.get('/:id', loansController.getLoanById);

// ✏️ PUT: Actualizar un loan
router.put('/:id', loansController.updateLoan);

// 🗑️ DELETE: Eliminar un loan
router.delete('/:id', loansController.deleteLoan);

module.exports = router;
