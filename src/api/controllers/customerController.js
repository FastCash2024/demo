// src/api/controllers/customerController.js
const bcrypt = require('bcryptjs');
const Customer = require('../../infrastructure/database/models/Customer');
const RegisterCustomerAuthUseCase = require('../../application/usecases/registerCustomerAuth');

const normalizarStringOpcional = (value) => {
  if (typeof value !== 'string') return value;
  const normalizado = value.trim();
  return normalizado || undefined;
};

const prepararClienteSinPassword = (cliente) => {
  const clienteData = cliente.toObject ? cliente.toObject() : cliente;
  if (clienteData.datosDePerfil) {
    delete clienteData.datosDePerfil.password;
  }
  return clienteData;
};

const registerCustomer = async (req, res) => {
  try {
    const resultado = await RegisterCustomerAuthUseCase.execute(req.body);

    res.status(201).json({
      mensaje: 'Registro exitoso',
      token: resultado.token,
      usuario: resultado.user,
    });
  } catch (error) {
    console.error('Error en registerCustomer:', error);
    res.status(400).json({ error: 'Error al registrar cliente: ' + error.message });
  }
};

const getCustomerProfile = async (req, res) => {
  try {
    const cliente = await Customer.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const clienteSinPassword = prepararClienteSinPassword(cliente);

    res.status(200).json({
      mensaje: 'Perfil del cliente obtenido',
      cliente: clienteSinPassword,
    });
  } catch (error) {
    console.error('Error en getCustomerProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil: ' + error.message });
  }
};

const updateCustomerProfile = async (req, res) => {
  try {
    const { datosDePerfil, cuentasBancarias, dispositivos } = req.body;
    const datosDePerfilActualizados = datosDePerfil ? { ...datosDePerfil } : undefined;

    const cliente = await Customer.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (datosDePerfilActualizados && datosDePerfilActualizados.password) {
      if (datosDePerfilActualizados.password.length < 6) {
        return res.status(400).json({ error: 'La contrasena debe tener minimo 6 caracteres' });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordEncriptada = await bcrypt.hash(datosDePerfilActualizados.password, salt);
      datosDePerfilActualizados.password = passwordEncriptada;
    }

    if (datosDePerfilActualizados && Object.prototype.hasOwnProperty.call(datosDePerfilActualizados, 'contactosExportadosUrl')) {
      datosDePerfilActualizados.contactosExportadosUrl = normalizarStringOpcional(datosDePerfilActualizados.contactosExportadosUrl);
    }

    const clienteActualizado = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        datosDePerfil: { ...cliente.datosDePerfil.toObject(), ...datosDePerfilActualizados },
        cuentasBancarias: cuentasBancarias || cliente.cuentasBancarias,
        dispositivos: dispositivos || cliente.dispositivos,
        fechaUltimaActividad: new Date(),
      },
      { new: true, runValidators: true }
    );

    const clienteSinPassword = prepararClienteSinPassword(clienteActualizado);

    res.status(200).json({
      mensaje: 'Perfil actualizado con exito',
      cliente: clienteSinPassword,
    });
  } catch (error) {
    console.error('Error en updateCustomerProfile:', error);
    res.status(400).json({ error: 'Error al actualizar perfil: ' + error.message });
  }
};

const addCuentaBancaria = async (req, res) => {
  try {
    const { titular, nombreBanco, claveBanco, tipoCuenta, numeroDeCuenta, estadoDeCuenta } = req.body;

    if (!nombreBanco || !numeroDeCuenta) {
      return res.status(400).json({ error: 'Campos requeridos: nombreBanco, numeroDeCuenta' });
    }

    const cliente = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          cuentasBancarias: {
            titular: titular || false,
            nombreBanco,
            claveBanco,
            tipoCuenta,
            numeroDeCuenta,
            estadoDeCuenta: estadoDeCuenta || 'Activo',
          },
        },
      },
      { new: true }
    );

    const clienteSinPassword = prepararClienteSinPassword(cliente);

    res.status(200).json({
      mensaje: 'Cuenta bancaria agregada',
      cliente: clienteSinPassword,
    });
  } catch (error) {
    console.error('Error en addCuentaBancaria:', error);
    res.status(400).json({ error: 'Error al agregar cuenta: ' + error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const clientes = await Customer.find();
    const clientesSinPassword = clientes.map(prepararClienteSinPassword);

    res.status(200).json({
      mensaje: 'Clientes obtenidos',
      total: clientesSinPassword.length,
      clientes: clientesSinPassword,
    });
  } catch (error) {
    console.error('Error en getAllCustomers:', error);
    res.status(500).json({ error: 'Error al obtener clientes: ' + error.message });
  }
};

module.exports = {
  registerCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  addCuentaBancaria,
  getAllCustomers,
};
