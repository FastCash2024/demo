const RegisterUserUseCase = require('../../application/usecases/registerUser');
const LoginUserUseCase = require('../../application/usecases/loginUser');
const RequestOtpUseCase = require('../../application/usecases/requestOtp');
const ValidateOtpUseCase = require('../../application/usecases/validateOtp');
const buildCustomerAuthResponse = require('../../application/usecases/buildCustomerAuthResponse');
const Customer = require('../../infrastructure/database/models/Customer');

const testUser = async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    res.json({ mensaje: 'Hola desde el controlador de usuarios', usuariosEnBD: count });
  } catch (error) {
    res.status(500).json({ error: 'Error al comunicarse con la base de datos' });
  }
};

const registerUser = async (req, res) => {
  try {
    const usuarioCreado = await RegisterUserUseCase.execute(req.body);
    res.status(201).json({
      mensaje: 'Registro exitoso',
      usuario: usuarioCreado,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const resultado = await LoginUserUseCase.execute(req.body);
    res.status(200).json({
      mensaje: 'Login exitoso',
      token: resultado.token,
      usuario: resultado.user,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const resultado = await RequestOtpUseCase.execute(email);

    res.status(200).json({
      mensaje: resultado.message,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const validateOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const resultado = await ValidateOtpUseCase.execute(email, otp);

    res.status(200).json({
      mensaje: 'Login exitoso',
      token: resultado.token,
      usuario: resultado.user,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    if (req.user?.tipo && req.user.tipo !== 'customer') {
      return res.status(403).json({ error: 'Este token no pertenece a un cliente' });
    }

    const cliente = await Customer.findById(req.user.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const resultado = buildCustomerAuthResponse(cliente);

    res.status(200).json({
      mensaje: 'Sesion valida',
      usuario: resultado.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la sesion: ' + error.message });
  }
};

module.exports = {
  testUser,
  registerUser,
  loginUser,
  requestOtp,
  validateOtp,
  getMe,
};
