const Customer = require('../../infrastructure/database/models/Customer');
const buildCustomerAuthResponse = require('./buildCustomerAuthResponse');

const validarCURP = (curp) => {
  if (!curp) return true;
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
  return regex.test(curp.toUpperCase());
};

const validarRFC = (rfc) => {
  if (!rfc) return true;
  const regex = /^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/;
  return regex.test(rfc.toUpperCase());
};

const normalizarStringOpcional = (value) => {
  if (typeof value !== 'string') return value;
  const normalizado = value.trim();
  return normalizado || undefined;
};

const execute = async (payload) => {
  const {
    datosDePerfil,
    cuentasBancarias = [],
    dispositivos = [],
  } = payload || {};

  if (!datosDePerfil) {
    throw new Error('Campo requerido: datosDePerfil');
  }

  const {
    nombres,
    apellidos,
    email,
    curp,
    rfc,
  } = datosDePerfil;

  if (!nombres || !apellidos || !email) {
    throw new Error('Campos requeridos en datosDePerfil: nombres, apellidos, email');
  }

  const emailNormalizado = email.toLowerCase();

  if (curp && !validarCURP(curp)) {
    throw new Error('CURP invalido');
  }

  if (rfc && !validarRFC(rfc)) {
    throw new Error('RFC invalido');
  }

  const clienteExistente = await Customer.findOne({ email: emailNormalizado });
  if (clienteExistente) {
    throw new Error('El email ya esta registrado');
  }

  if (curp) {
    const clienteCurp = await Customer.findOne({ 'datosDePerfil.curp': curp.toUpperCase() });
    if (clienteCurp) {
      throw new Error('El CURP ya esta registrado');
    }
  }

  if (rfc) {
    const clienteRfc = await Customer.findOne({ 'datosDePerfil.rfc': rfc.toUpperCase() });
    if (clienteRfc) {
      throw new Error('El RFC ya esta registrado');
    }
  }

  const nuevoCliente = new Customer({
    email: emailNormalizado,
    datosDePerfil: {
      ...datosDePerfil,
      email: emailNormalizado,
      curp: curp?.toUpperCase(),
      rfc: rfc?.toUpperCase(),
      contactosExportadosUrl: normalizarStringOpcional(datosDePerfil.contactosExportadosUrl),
    },
    cuentasBancarias: cuentasBancarias.map((cuenta) => ({
      titular: cuenta.titular || false,
      nombreBanco: cuenta.nombreBanco,
      claveBanco: cuenta.claveBanco,
      tipoCuenta: cuenta.tipoCuenta,
      numeroDeCuenta: cuenta.numeroDeCuenta,
      estadoDeCuenta: cuenta.estadoDeCuenta || 'Activo',
    })),
    dispositivos: dispositivos.map((dispositivo) => ({
      dispositivoId: dispositivo.dispositivoId,
      marca: dispositivo.marca,
      modelo: dispositivo.modelo,
      esEmulador: dispositivo.esEmulador || false,
      idApp: dispositivo.idApp,
      versionApp: dispositivo.versionApp,
      tokenPush: dispositivo.tokenPush,
      fechaPrimeraSesion: dispositivo.fechaPrimeraSesion || new Date(),
      fechaUltimaSesion: dispositivo.fechaUltimaSesion || new Date(),
    })),
    estado: 'Activo',
    verificado: false,
  });

  const clienteGuardado = await nuevoCliente.save();

  return buildCustomerAuthResponse(clienteGuardado);
};

module.exports = { execute };
