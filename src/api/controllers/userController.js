// src/api/controllers/userController.js
const RegisterUserUseCase = require('../../application/usecases/registerUser');
// const LoginUserUseCase = require('../../application/usecases/loginUser');
const LoginUserUseCase = require('../../application/usecases/loginUser'); 
const User = require('../../infrastructure/database/models/User'); 

// 1. PRUEBA
const testUser = async (req, res) => {
  try {
    const count = await User.countDocuments();
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

// 3. LOGIN
const loginUser = async (req, res) => {
  try {
    const resultado = await LoginUserUseCase.execute(req.body);
    
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
  loginUser
};