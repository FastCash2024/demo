// src/api/controllers/customerController.js
const bcrypt = require('bcryptjs');
const Customer = require('../../infrastructure/database/models/Customer');

// ✅ VALIDACIÓN DE EMAIL
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ✅ VALIDACIÓN DE CURP
const validarCURP = (curp) => {
  if (!curp) return true; // opcional
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
  return regex.test(curp.toUpperCase());
};

// ✅ VALIDACIÓN DE RFC
const validarRFC = (rfc) => {
  if (!rfc) return true; // opcional
  const regex = /^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/;
  return regex.test(rfc.toUpperCase());
};

// 1️⃣ REGISTRAR NUEVO CLIENTE
const registerCustomer = async (req, res) => {
  try {
    const {
      datosDePerfil,
      cuentasBancarias = [],
      dispositivos = []
    } = req.body;

    // ✅ VALIDACIONES BÁSICAS
    if (!datosDePerfil) {
      return res.status(400).json({
        error: 'Campo requerido: datosDePerfil'
      });
    }

    const {
      nombres,
      apellidos,
      email,
      password,
      curp,
      rfc
    } = datosDePerfil;

    // Validar campos obligatorios
    if (!nombres || !apellidos || !email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos en datosDePerfil: nombres, apellidos, email, password'
      });
    }

    // Validar email
    if (!validarEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar que la contraseña tenga mínimo 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
    }

    // Validar CURP si se proporciona
    if (curp && !validarCURP(curp)) {
      return res.status(400).json({ error: 'CURP inválido' });
    }

    // Validar RFC si se proporciona
    if (rfc && !validarRFC(rfc)) {
      return res.status(400).json({ error: 'RFC inválido' });
    }

    // ✅ VALIDAR QUE NO EXISTA CLIENTE CON MISMO EMAIL
    const clienteExistente = await Customer.findOne({ email: email.toLowerCase() });
    if (clienteExistente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // ✅ VALIDAR QUE NO EXISTA CLIENTE CON MISMO CURP
    if (curp) {
      const clienteCurp = await Customer.findOne({ 'datosDePerfil.curp': curp.toUpperCase() });
      if (clienteCurp) {
        return res.status(409).json({ error: 'El CURP ya está registrado' });
      }
    }

    // ✅ VALIDAR QUE NO EXISTA CLIENTE CON MISMO RFC
    if (rfc) {
      const clienteRfc = await Customer.findOne({ 'datosDePerfil.rfc': rfc.toUpperCase() });
      if (clienteRfc) {
        return res.status(409).json({ error: 'El RFC ya está registrado' });
      }
    }

    // 🔐 ENCRIPTAR CONTRASEÑA
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 🏗️ CREAR NUEVO CLIENTE
    const nuevoCliente = new Customer({
      email: email.toLowerCase(),
      datosDePerfil: {
        ...datosDePerfil,
        email: email.toLowerCase(),
        password: passwordEncriptada, // Guardar contraseña encriptada
        curp: curp?.toUpperCase(),
        rfc: rfc?.toUpperCase()
      },
      cuentasBancarias: cuentasBancarias.map(cuenta => ({
        titular: cuenta.titular || false,
        nombreBanco: cuenta.nombreBanco,
        claveBanco: cuenta.claveBanco,
        tipoCuenta: cuenta.tipoCuenta,
        numeroDeCuenta: cuenta.numeroDeCuenta,
        estadoDeCuenta: cuenta.estadoDeCuenta || 'Activo'
      })),
      dispositivos: dispositivos.map(dispositivo => ({
        dispositivoId: dispositivo.dispositivoId,
        marca: dispositivo.marca,
        modelo: dispositivo.modelo,
        esEmulador: dispositivo.esEmulador || false,
        idApp: dispositivo.idApp,
        versionApp: dispositivo.versionApp,
        tokenPush: dispositivo.tokenPush,
        fechaPrimeraSesion: dispositivo.fechaPrimeraSesion || new Date(),
        fechaUltimaSesion: dispositivo.fechaUltimaSesion || new Date()
      })),
      estado: 'Activo',
      verificado: false
    });

    // 💾 GUARDAR EN BD
    const clienteGuardado = await nuevoCliente.save();

    // Preparar datos de respuesta sin password
    const datosPerfil = clienteGuardado.datosDePerfil.toObject();
    delete datosPerfil.password; // No enviar password en respuesta

    // ✅ RESPUESTA EXITOSA (sin enviar la contraseña)
    res.status(201).json({
      mensaje: '✅ Cliente registrado con éxito 🎉',
      cliente: {
        id: clienteGuardado._id,
        email: clienteGuardado.email,
        nombres: clienteGuardado.datosDePerfil.nombres,
        apellidos: clienteGuardado.datosDePerfil.apellidos,
        telefono: clienteGuardado.datosDePerfil.numeroDeTelefonoMovil,
        curp: clienteGuardado.datosDePerfil.curp,
        rfc: clienteGuardado.datosDePerfil.rfc,
        cuentasBancarias: clienteGuardado.cuentasBancarias.length,
        dispositivos: clienteGuardado.dispositivos.length,
        estado: clienteGuardado.estado,
        fechaRegistro: clienteGuardado.createdAt
      }
    });

  } catch (error) {
    console.error('Error en registerCustomer:', error);
    res.status(500).json({ error: 'Error al registrar cliente: ' + error.message });
  }
};

// ✅ FUNCIÓN AUXILIAR: Preparar cliente sin password
const prepararClienteSinPassword = (cliente) => {
  const clienteData = cliente.toObject ? cliente.toObject() : cliente;
  if (clienteData.datosDePerfil) {
    delete clienteData.datosDePerfil.password;
  }
  return clienteData;
};

// 2️⃣ OBTENER PROFILE DEL CLIENTE (por ID)
const getCustomerProfile = async (req, res) => {
  try {
    const cliente = await Customer.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const clienteSinPassword = prepararClienteSinPassword(cliente);

    res.status(200).json({
      mensaje: '✅ Perfil del cliente obtenido ✨',
      cliente: clienteSinPassword
    });
  } catch (error) {
    console.error('Error en getCustomerProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil: ' + error.message });
  }
};

// 3️⃣ ACTUALIZAR PERFIL DEL CLIENTE
const updateCustomerProfile = async (req, res) => {
  try {
    const { datosDePerfil, cuentasBancarias, dispositivos } = req.body;

    const cliente = await Customer.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si viene password en datosDePerfil, encriptarlo
    if (datosDePerfil && datosDePerfil.password) {
      if (datosDePerfil.password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordEncriptada = await bcrypt.hash(datosDePerfil.password, salt);
      datosDePerfil.password = passwordEncriptada;
    }

    // Actualizar los datos
    const clienteActualizado = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        datosDePerfil: { ...cliente.datosDePerfil.toObject(), ...datosDePerfil },
        cuentasBancarias: cuentasBancarias || cliente.cuentasBancarias,
        dispositivos: dispositivos || cliente.dispositivos,
        fechaUltimaActividad: new Date()
      },
      { new: true, runValidators: true }
    );

    const clienteSinPassword = prepararClienteSinPassword(clienteActualizado);

    res.status(200).json({
      mensaje: '✅ Perfil actualizado con éxito 🔄',
      cliente: clienteSinPassword
    });
  } catch (error) {
    console.error('Error en updateCustomerProfile:', error);
    res.status(400).json({ error: 'Error al actualizar perfil: ' + error.message });
  }
};

// 4️⃣ AGREGAR CUENTA BANCARIA AL CLIENTE
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
            estadoDeCuenta: estadoDeCuenta || 'Activo'
          }
        }
      },
      { new: true }
    );

    const clienteSinPassword = prepararClienteSinPassword(cliente);

    res.status(200).json({
      mensaje: '✅ Cuenta bancaria agregada ✨',
      cliente: clienteSinPassword
    });
  } catch (error) {
    console.error('Error en addCuentaBancaria:', error);
    res.status(400).json({ error: 'Error al agregar cuenta: ' + error.message });
  }
};

// 6️⃣ LOGIN DE CUSTOMER (Autenticación)
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }

    // Buscar cliente por email
    const cliente = await Customer.findOne({ email: email.toLowerCase() });
    if (!cliente) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Validar contraseña
    const passwordValida = await bcrypt.compare(password, cliente.datosDePerfil.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar JWT (usar el mismo token que en usuarios)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { email: cliente.email, id: cliente._id },
      process.env.JWT_SECRET || 'clave_secreta_super_segura_de_desarrollo',
      { expiresIn: '8h' }
    );

    // Preparar datos de perfil sin password
    const datosPerfil = cliente.datosDePerfil.toObject();
    delete datosPerfil.password;

    res.status(200).json({
      mensaje: '✅ Login exitoso 🎉',
      token: token,
      cliente: {
        id: cliente._id,
        email: cliente.email,
        datosDePerfil: datosPerfil,
        cuentasBancarias: cliente.cuentasBancarias,
        dispositivos: cliente.dispositivos,
        estado: cliente.estado,
        verificado: cliente.verificado,
        createdAt: cliente.createdAt
      }
    });
  } catch (error) {
    console.error('Error en loginCustomer:', error);
    res.status(500).json({ error: 'Error en login: ' + error.message });
  }
};

// 5️⃣ OBTENER TODOS LOS CLIENTES (Admin)
const getAllCustomers = async (req, res) => {
  try {
    const clientes = await Customer.find();
    
    // Preparar todos los clientes sin password
    const clientesSinPassword = clientes.map(prepararClienteSinPassword);

    res.status(200).json({
      mensaje: '✅ Clientes obtenidos 📋',
      total: clientesSinPassword.length,
      clientes: clientesSinPassword
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
  loginCustomer
};
