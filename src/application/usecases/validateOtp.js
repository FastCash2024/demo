const Customer = require('../../infrastructure/database/models/Customer');
const buildCustomerAuthResponse = require('./buildCustomerAuthResponse');

const execute = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('El email y el OTP son obligatorios');
  }

  const usuario = await Customer.findOne({ email: email.toLowerCase() });
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!usuario.otp || !usuario.otpExpiresAt) {
    throw new Error('No se encontro un codigo de verificacion valido');
  }

  if (new Date() > usuario.otpExpiresAt) {
    throw new Error('El codigo de verificacion ha expirado');
  }

  if (usuario.otp !== otp) {
    throw new Error('Codigo de verificacion invalido');
  }

  usuario.otp = undefined;
  usuario.otpExpiresAt = undefined;
  await usuario.save();

  return buildCustomerAuthResponse(usuario);
};

module.exports = { execute };
