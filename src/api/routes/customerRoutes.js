// src/api/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

// 📝 POST: Registrar nuevo cliente (SIN autenticación)
router.post('/register', customerController.registerCustomer);

// � POST: Login de customer (SIN autenticación)
router.post('/login', customerController.loginCustomer);

// �📋 GET: Obtener perfil del cliente por ID (CON autenticación)
router.get('/:id', authMiddleware, customerController.getCustomerProfile);

// ✏️ PUT: Actualizar perfil del cliente (CON autenticación)
router.put('/:id', authMiddleware, customerController.updateCustomerProfile);

// 💳 POST: Agregar cuenta bancaria al cliente (CON autenticación)
router.post('/:id/cuentas-bancarias', authMiddleware, customerController.addCuentaBancaria);

// 👥 GET: Obtener todos los clientes (CON autenticación - solo admin)
router.get('/', authMiddleware, customerController.getAllCustomers);

module.exports = router;
