// src/api/controllers/userController.js
const RegisterUserUseCase = require('../../application/usecases/registerUser');
const RequestOtpUseCase = require('../../application/usecases/requestOtp');
const ValidateOtpUseCase = require('../../application/usecases/validateOtp');
const Customer = require('../../infrastructure/database/models/Customer'); 

// 1. PRUEBA
const testUser = async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    res.json({ mensaje: '¡Hola desde el CONTROLADOR de Usuarios! 🎮', usuariosEnBD: count });
  } catch (error) {
    res.status(500).json({ error: 'Error al comunicarse con la base de datos' });
  }
};

// 2. REGISTRO
const registerUser = async (req, res) => {
  try {
    const usuarioCreado = await RegisterUserUseCase.execute(req.body);
    res.status(201).json({
      mensaje: 'Usuario registrado con éxito 🎉',
      usuario: usuarioCreado
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 3. REQUEST OTP
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const resultado = await RequestOtpUseCase.execute(email);
    
    res.status(200).json({
      mensaje: resultado.message
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. VALIDATE OTP
const validateOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const resultado = await ValidateOtpUseCase.execute(email, otp);
    
    res.status(200).json({
      mensaje: 'Login exitoso',
      token: resultado.token,
      usuario: resultado.user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// EXPORTACIONES
module.exports = {
  testUser,
  registerUser,
  requestOtp,
  validateOtp
};