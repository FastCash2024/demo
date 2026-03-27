// src/api/controllers/loansController.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');
const Customer = require('../../infrastructure/database/models/Customer');

const normalizarEmail = (email) => {
  if (typeof email !== 'string') return undefined;
  const normalizado = email.trim().toLowerCase();
  return normalizado || undefined;
};

const normalizarTelefono = (telefono) => {
  if (typeof telefono !== 'string') return undefined;
  const normalizado = telefono.trim();
  return normalizado || undefined;
};

const normalizarDocumento = (valor) => {
  if (typeof valor !== 'string') return undefined;
  const normalizado = valor.trim().toUpperCase();
  return normalizado || undefined;
};

const construirFiltroPrestamosPorCliente = (customer, email, telefono, curp, rfc) => {
  const emailActual = normalizarEmail(customer?.email);
  const telefonoActual = normalizarTelefono(customer?.datosDePerfil?.numeroDeTelefonoMovil);
  const curpActual = normalizarDocumento(customer?.datosDePerfil?.curp);
  const rfcActual = normalizarDocumento(customer?.datosDePerfil?.rfc);
  const valoresEmail = [...new Set([email, emailActual].filter(Boolean))];
  const valoresTelefono = [...new Set([telefono, telefonoActual].filter(Boolean))];
  const valoresCurp = [...new Set([curp, curpActual].filter(Boolean))];
  const valoresRfc = [...new Set([rfc, rfcActual].filter(Boolean))];
  const condiciones = [];

  for (const valorEmail of valoresEmail) {
    condiciones.push({ 'solicitud.cliente.email': valorEmail });
  }

  for (const valorTelefono of valoresTelefono) {
    condiciones.push({ 'solicitud.cliente.numeroDeTelefonoMovil': valorTelefono });
  }

  for (const valorCurp of valoresCurp) {
    condiciones.push({ 'solicitud.cliente.curp': valorCurp });
  }

  for (const valorRfc of valoresRfc) {
    condiciones.push({ 'solicitud.cliente.rfc': valorRfc });
  }

  if (condiciones.length === 0) {
    return {};
  }

  if (condiciones.length === 1) {
    return condiciones[0];
  }

  return { $or: condiciones };
};

const transformarLoan = (loan) => {
  if (!loan) return null;

  let diasMora = 0;
  if (loan?.cicloDeVida?.fechas?.fechaDeCobro) {
    const fechaCobro = new Date(loan.cicloDeVida.fechas.fechaDeCobro);
    const hoy = new Date();
    if (hoy > fechaCobro) {
      diasMora = Math.floor((hoy - fechaCobro) / (1000 * 60 * 60 * 24));
    }
  }

  return {
    id: loan._id,
    numeroDePrestamo: loan.numeroDePrestamo,
    idDeSubFactura: loan.idDeSubFactura,
    cliente: loan?.solicitud?.cliente?.nombreDelCliente || 'Desconocido',
    telefono: loan?.solicitud?.cliente?.numeroDeTelefonoMovil || 'Sin telefono',
    clienteNuevo: loan?.solicitud?.cliente?.clienteNuevo || false,
    email: loan?.solicitud?.cliente?.email,
    curp: loan?.solicitud?.cliente?.curp,
    rfc: loan?.solicitud?.cliente?.rfc,
    urlCurpFrontal: loan?.solicitud?.cliente?.urlCurpFrontal,
    urlCurpReverso: loan?.solicitud?.cliente?.urlCurpReverso,
    urlSelfie: loan?.solicitud?.cliente?.urlSelfie,
    contactosExportadosUrl: loan?.solicitud?.cliente?.contactosExportadosUrl,
    contactos: loan?.solicitud?.evidencia?.contactos || [],
    sms: loan?.solicitud?.evidencia?.sms || [],
    dispositivo: loan?.solicitud?.dispositivo || {},
    producto: loan?.solicitud?.producto?.nombreDelProducto || 'N/A',
    valorDispersado: (loan?.solicitud?.montos?.valorDispersadoCentavos || 0) / 100,
    valorAdeudado: (loan?.solicitud?.montos?.valorAdeudadoCentavos || 0) / 100,
    valorExtension: (loan?.solicitud?.montos?.valorExtencionCentavos || 0) / 100,
    valorOperativo: (loan?.solicitud?.montos?.valorOperativoCentavos || 0) / 100,
    valorLiquidacion: (loan?.cicloDeVida?.valorLiquidacionCentavos || 0) / 100,
    interesPorcentaje: loan?.solicitud?.montos?.interesPorcentaje,
    interesDiario: loan?.solicitud?.montos?.interesDiarioPorcentaje,
    interesTotal: loan?.solicitud?.montos?.interesTotal,
    nivelDePrestamo: loan?.solicitud?.montos?.nivelDePrestamo,
    estadoDeCredito: loan?.cicloDeVida?.estadoDeCredito || 'Desconocido',
    fechaDispersion: loan?.cicloDeVida?.fechas?.fechaDeDispersion,
    fechaCobro: loan?.cicloDeVida?.fechas?.fechaDeCobro,
    fechaReembolso: loan?.cicloDeVida?.fechas?.fechaReembolso,
    diasMora,
    asesorVerificador: loan?.operacion?.verificacion?.asesorVerificador,
    emailVerificador: loan?.operacion?.verificacion?.emailAsesorVerificador,
    cuentaVerificador: loan?.operacion?.verificacion?.cuentaVerificador,
    fechaTramitacionVerificacion: loan?.operacion?.verificacion?.fechaDeTramitacionDelCaso,
    empresaVerificacion: loan?.operacion?.verificacion?.nombreDeLaEmpresa,
    asesorCobrador: loan?.operacion?.cobranza?.asesorCobrador,
    emailCobrador: loan?.operacion?.cobranza?.emailAsesorCobrador,
    cuentaCobrador: loan?.operacion?.cobranza?.cuentaCobrador,
    fechaTramitacionCobranza: loan?.operacion?.cobranza?.fechaDeTramitacionDeCobro,
    empresaCobranza: loan?.operacion?.cobranza?.nombreDeLaEmpresa,
    estadoComunicacion: loan?.operacion?.cobranza?.estadoDeComunicacion,
    fechaRegistroComunicacion: loan?.operacion?.cobranza?.fechaRegistroComunicacion,
    asesorAuditor: loan?.operacion?.auditoria?.asesorAuditor,
    emailAuditor: loan?.operacion?.auditoria?.emailAsesorAuditor,
    cuentaAuditor: loan?.operacion?.auditoria?.cuentaAuditor,
    empresaAuditoria: loan?.operacion?.auditoria?.nombreDeLaEmpresa,
    acotaciones: loan?.operacion?.acotaciones || [],
    ultimaAcotacionVerificacion: loan?.operacion?.ultimaAcotacionVerificacion,
    ultimaAcotacionCobranza: loan?.operacion?.ultimaAcotacionCobranza,
    ultimaAcotacionAuditoria: loan?.operacion?.ultimaAcotacionAuditoria,
    historialAsesores: loan?.operacion?.historialDeAsesores || [],
    claveRastreoDispersion: loan?.integraciones?.stp?.claveRastreoDispersionSTP,
    claveRastreoAbono: loan?.integraciones?.stp?.claveRastreoAbonoSTP,
    ordenDispersion: loan?.integraciones?.stp?.ordenDeDispersion,
    cuentaClabeParaCobro: loan?.pagos?.cuentaClabeParaCobro,
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };
};

const getLoans = async (req, res) => {
  try {
    const email = normalizarEmail(req.query.email);
    const telefono = normalizarTelefono(req.query.telefono);
    const curp = normalizarDocumento(req.query.curp);
    const rfc = normalizarDocumento(req.query.rfc);
    let filtroPrestamos = {};

    if (email || telefono || curp || rfc) {
      const filtroCustomer = {};

      if (email) {
        filtroCustomer.email = email;
      }

      if (telefono) {
        filtroCustomer['datosDePerfil.numeroDeTelefonoMovil'] = telefono;
      }

      if (curp) {
        filtroCustomer['datosDePerfil.curp'] = curp;
      }

      if (rfc) {
        filtroCustomer['datosDePerfil.rfc'] = rfc;
      }

      const customer = await Customer.findOne(filtroCustomer).lean();
      if (!customer) {
        return res.status(404).json({
          error: 'No se encontro un customer registrado con esos filtros',
        });
      }

      filtroPrestamos = construirFiltroPrestamosPorCliente(customer, email, telefono, curp, rfc);
    }

    const loans = await Prestamo.find(filtroPrestamos).lean();
    const loansTransformados = loans.map(transformarLoan);

    res.status(200).json({
      mensaje: email || telefono || curp || rfc
        ? 'Loans filtrados por customer obtenidos con exito'
        : 'Loans obtenidos con exito',
      total: loansTransformados.length,
      loans: loansTransformados,
    });
  } catch (error) {
    console.error('Error en getLoans:', error);
    res.status(500).json({ error: 'Error al obtener los loans: ' + error.message });
  }
};

const createLoan = async (req, res) => {
  try {
    const dispositivo = req.body.dispositivo || {};
    const {
      nombreDelCliente,
      numeroDeTelefonoMovil,
      valorAdeudadoCentavos,
      valorDispersadoCentavos,
      interesPorcentaje,
      estadoDeCredito = 'En Mora',
      fechaDeCobro,
      fechaDeDispersion,
      asesorVerificador,
      asesorCobrador,
      acotacion,
      tipoAcotacion = 'cobranza',
    } = req.body;

    if (!nombreDelCliente || !numeroDeTelefonoMovil || !valorAdeudadoCentavos) {
      return res.status(400).json({
        error: 'Campos requeridos: nombreDelCliente, numeroDeTelefonoMovil, valorAdeudadoCentavos',
      });
    }

    const numeroDePrestamo = String(Math.floor(100000 + Math.random() * 900000));
    const cuentaClabeOpciones = [
      '722969010412043271',
      '722969010014750221',
    ];
    const cuentaClabeParaCobro = cuentaClabeOpciones[Math.floor(Math.random() * cuentaClabeOpciones.length)];

    const nuevoLoan = new Prestamo({
      numeroDePrestamo,
      pagos: {
        cuentaClabeParaCobro,
      },
      solicitud: {
        versionSchema: 1,
        cliente: {
          nombreDelCliente,
          numeroDeTelefonoMovil,
          clienteNuevo: req.body.clienteNuevo || 'Si',
          curp: req.body.curp,
          rfc: req.body.rfc,
          email: req.body.email,
          urlCurpFrontal: req.body.urlCurpFrontal,
          urlCurpReverso: req.body.urlCurpReverso,
          urlSelfie: req.body.urlSelfie,
          contactosExportadosUrl: req.body.contactosExportadosUrl,
        },
        evidencia: {
          contactos: req.body.contactos || [],
          sms: req.body.sms || [],
        },
        dispositivo: {
          dispositivoId: dispositivo.dispositivoId || req.body.dispositivoId,
          marca: dispositivo.marca || req.body.marca,
          modelo: dispositivo.modelo || req.body.modelo,
          esEmulador: dispositivo.esEmulador ?? req.body.esEmulador ?? false,
          idApp: dispositivo.idApp || req.body.idApp,
          versionApp: dispositivo.versionApp || req.body.versionApp,
        },
        producto: {
          nombreDelProducto: req.body.producto || 'Prestamo General',
          icon: req.body.icon,
        },
        cuentaBancariaId: req.body.cuentaBancariaId,
        montos: {
          valorAdeudadoCentavos: Math.round(valorAdeudadoCentavos),
          valorDispersadoCentavos: Math.round(valorDispersadoCentavos || 0),
          valorPrestamoMenosInteresCentavos: Math.round(req.body.valorPrestamoMenosInteresCentavos || 0),
          valorExtencionCentavos: Math.round(req.body.valorExtencionCentavos || 0),
          valorOperativoCentavos: Math.round(req.body.valorOperativoCentavos || 0),
          interesPorcentaje: interesPorcentaje || '0',
          interesDiarioPorcentaje: req.body.interesDiarioPorcentaje || '0',
          nivelDePrestamo: req.body.nivelDePrestamo,
          interesTotal: req.body.interesTotal,
        },
        fechaDeCreacionDeLaTarea: new Date(),
      },
      cicloDeVida: {
        estadoDeCredito,
        fechas: {
          fechaDeDispersion: fechaDeDispersion ? new Date(fechaDeDispersion) : new Date(),
          fechaDeCobro: fechaDeCobro ? new Date(fechaDeCobro) : null,
          fechaDeReembolso: null,
        },
      },
      operacion: {
        verificacion: {
          asesorVerificador: asesorVerificador || 'Pendiente',
          fechaDeTramitacionDelCaso: new Date(),
        },
        cobranza: {
          asesorCobrador: asesorCobrador || 'Pendiente',
          estadoDeComunicacion: 'Pendiente',
          fechaRegistroComunicacion: new Date(),
        },
        acotaciones: acotacion ? [{
          tipo: tipoAcotacion,
          estadoDeCredito,
          acotacion,
          asesor: req.user?.email || 'Sistema',
          emailAsesor: req.user?.email,
          fechaDeAcotacion: new Date(),
        }] : [],
        historialDeAsesores: asesorVerificador ? [{
          nombreAsesor: asesorVerificador,
          fechaDeAsignacion: new Date(),
        }] : [],
      },
      integraciones: {
        stp: {
          claveRastreoDispersionSTP: req.body.claveRastreo || null,
        },
      },
    });

    const loanGuardado = await nuevoLoan.save();
    const loanTransformado = transformarLoan(loanGuardado);

    res.status(201).json({
      mensaje: 'Loan registrado con exito',
      loan: loanTransformado,
    });
  } catch (error) {
    console.error('Error en createLoan:', error);
    res.status(400).json({ error: 'Error al crear el loan: ' + error.message });
  }
};

const getLoanById = async (req, res) => {
  try {
    const loan = await Prestamo.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    const loanTransformado = transformarLoan(loan);

    res.status(200).json({
      mensaje: 'Loan obtenido con exito',
      loan: loanTransformado,
    });
  } catch (error) {
    console.error('Error en getLoanById:', error);
    res.status(500).json({ error: 'Error al obtener el loan: ' + error.message });
  }
};

const updateLoan = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, 'contactosExportadosUrl')) {
      updateData['solicitud.cliente.contactosExportadosUrl'] = updateData.contactosExportadosUrl;
      delete updateData.contactosExportadosUrl;
    }

    const loan = await Prestamo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    const loanTransformado = transformarLoan(loan);

    res.status(200).json({
      mensaje: 'Loan actualizado con exito',
      loan: loanTransformado,
    });
  } catch (error) {
    console.error('Error en updateLoan:', error);
    res.status(400).json({ error: 'Error al actualizar el loan: ' + error.message });
  }
};

const deleteLoan = async (req, res) => {
  try {
    const loan = await Prestamo.findByIdAndDelete(req.params.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Loan eliminado con exito',
      loanEliminado: loan._id,
    });
  } catch (error) {
    console.error('Error en deleteLoan:', error);
    res.status(400).json({ error: 'Error al eliminar el loan: ' + error.message });
  }
};

module.exports = {
  getLoans,
  createLoan,
  getLoanById,
  updateLoan,
  deleteLoan,
};
