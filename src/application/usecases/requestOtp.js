// src/application/usecases/requestOtp.js
const nodemailer = require('nodemailer');
const Customer = require('../../infrastructure/database/models/Customer');

const execute = async (email) => {
  // 1. Validar que venga el email
  if (!email) {
    throw new Error('El email es obligatorio');
  }

  // 2. Buscar si el usuario existe
  const usuario = await Customer.findOne({ email: email.toLowerCase() });
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // 3. Generar OTP de 6 dígitos
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 4. Establecer expiración (5 minutos)
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 5. Guardar OTP en la base de datos
  usuario.otp = otp;
  usuario.otpExpiresAt = otpExpiresAt;
  console.log('💾 Guardando OTP en BD:', {
    email: usuario.email,
    otp: otp,
    otpExpiresAt: otpExpiresAt
  });
  
  try {
    await usuario.save();
    console.log('✅ OTP guardado exitosamente en BD');
  } catch (dbError) {
    console.error('❌ ERROR al guardar OTP en BD:', dbError.message);
    throw dbError;
  }

  // 6. Configurar transporte de email
  const transporter = nodemailer.createTransport({
    service: 'gmail', // o tu proveedor de email
    auth: {
      user: process.env.EMAIL_USER || 'tu-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'tu-password-app'
    }
  });

  // 7. Enviar email con OTP
  const mailOptions = {
    from: process.env.EMAIL_USER || 'tu-email@gmail.com',
    to: email,
    subject: 'Tu código de verificación - Clean Cash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código de Verificación</h2>
        <p>Hola ${usuario.datosDePerfil.nombres},</p>
        <p>Tu código de verificación para iniciar sesión es:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>Este código expirará en 5 minutos.</p>
        <p>Si no solicitaste este código, ignora este mensaje.</p>
        <br>
        <p>Saludos,<br>Equipo Clean Cash</p>
      </div>
    `
  };

  try {
    console.log('📧 Intentando enviar email a:', email);
    console.log('📧 Usuario de email:', process.env.EMAIL_USER);
    
    const resultado = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', resultado.messageId);
    return { message: 'OTP enviado exitosamente' };
  } catch (error) {
    console.error('❌ ERROR CRÍTICO al enviar email:', error.message);
    console.error('Detalles completos:', error);
    throw new Error(`Error al enviar el código de verificación: ${error.message}`);
  }
};

module.exports = { execute };