// src/application/usecases/registerUser.js
const bcrypt = require('bcryptjs');
const User = require('../../infrastructure/database/models/User');

const execute = async (userData) => {
  const { email, password } = userData;

  // Regla de Negocio 1: Validar que vengan los datos
  if (!email || !password) {
    throw new Error('El email y el password son obligatorios');
  }

  // Regla de Negocio 2: Verificar que el usuario no exista
  const usuarioExistente = await User.findOne({ email });
  if (usuarioExistente) {
    throw new Error('Ese correo electrónico ya está registrado en el sistema');
  }

  // ==========================================
  // 🔒 MAGIA DE SEGURIDAD: ENCRIPTACIÓN
  // ==========================================
  // 1. Generamos un "salt" (un texto aleatorio para hacer el hash impredecible)
  const salt = await bcrypt.genSalt(10);
  
  // 2. Mezclamos el password original con el salt para crear el Hash final
  const hashedPassword = await bcrypt.hash(password, salt);

  // Regla de Negocio 3: Crear al usuario con la contraseña ENCRIPTADA
  const nuevoUsuario = new User({ 
    email, 
    password: hashedPassword // <-- ¡Guardamos el Hash, NUNCA el texto original!
  });
  
  await nuevoUsuario.save();

  // Devolvemos los datos limpios (SIN el password)
  return {
    id: nuevoUsuario._id,
    email: nuevoUsuario.email,
    creadoEn: nuevoUsuario.createdAt
  };
};

module.exports = { execute };