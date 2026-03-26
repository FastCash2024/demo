// src/application/usecases/validateOtp.js
const jwt = require('jsonwebtoken');
const Customer = require('../../infrastructure/database/models/Customer');

const execute = async (email, otp) => {
  // 1. Validar que vengan los datos
  if (!email || !otp) {
    throw new Error('El email y el OTP son obligatorios');
  }

  // 2. Buscar el usuario
  const usuario = await Customer.findOne({ email: email.toLowerCase() });
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // 3. Verificar que tenga OTP y no haya expirado
  if (!usuario.otp || !usuario.otpExpiresAt) {
    throw new Error('No se encontró un código de verificación válido');
  }

  if (new Date() > usuario.otpExpiresAt) {
    throw new Error('El código de verificación ha expirado');
  }

  // 4. Verificar que el OTP coincida
  if (usuario.otp !== otp) {
    throw new Error('Código de verificación inválido');
  }

  // 5. Limpiar OTP después de usar
  usuario.otp = undefined;
  usuario.otpExpiresAt = undefined;
  await usuario.save();

  // 6. Crear el Token de Acceso (JWT)
  const secret = process.env.JWT_SECRET || 'clave_secreta_super_segura_de_desarrollo';
  const token = jwt.sign(
    { id: usuario._id, email: usuario.email },
    secret,
    { expiresIn: '8h' }
  );

  // 7. Preparar datos del usuario sin información sensible
  const userData = {
    id: usuario._id,
    email: usuario.email,
    datosDePerfil: usuario.datosDePerfil,
    cuentasBancarias: usuario.cuentasBancarias,
    dispositivos: usuario.dispositivos,
    estado: usuario.estado,
    verificado: usuario.verificado,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
  };

  // 8. Devolvemos el token y los datos del usuario
  return {
    token,
    user: userData
  };
};

module.exports = { execute };