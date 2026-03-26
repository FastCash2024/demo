// src/application/usecases/loginUser.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../infrastructure/database/models/User');

const execute = async (credentials) => {
  const { email, password } = credentials;

  // 1. Validar que vengan los datos
  if (!email || !password) {
    throw new Error('El email y el password son obligatorios');
  }

  // 2. Buscar si el usuario existe (lo buscamos en minúsculas por seguridad)
  const usuario = await User.findOne({ email: email.toLowerCase() });
  
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }

  // 3. Comparar la contraseña que escribió con el Hash guardado en la BD
  const isPasswordValid = await bcrypt.compare(password, usuario.password);
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  // 4. Crear el Token de Acceso (JWT)
  const secret = process.env.JWT_SECRET || 'clave_secreta_super_segura_de_desarrollo';
  const token = jwt.sign(
    { id: usuario._id, email: usuario.email },
    secret,
    { expiresIn: '8h' }
  );

  // 5. Devolvemos el token y los datos básicos
  return {
    token,
    user: {
      id: usuario._id,
      email: usuario.email
    }
  };
};

module.exports = { execute };