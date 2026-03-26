// src/api/controllers/loansController.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');

// 🔄 FUNCIÓN AUXILIAR: Transformar loan de BD a formato respuesta
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
    
    // Cliente
    cliente: loan?.solicitud?.cliente?.nombreDelCliente || 'Desconocido',
    telefono: loan?.solicitud?.cliente?.numeroDeTelefonoMovil || 'Sin teléfono',
    clienteNuevo: loan?.solicitud?.cliente?.clienteNuevo || false,
    email: loan?.solicitud?.cliente?.email,
    curp: loan?.solicitud?.cliente?.curp,
    rfc: loan?.solicitud?.cliente?.rfc,
    
    // Contactos y evidencia
    contactos: loan?.solicitud?.evidencia?.contactos || [],
    sms: loan?.solicitud?.evidencia?.sms || [],
    
    // Dispositivo
    dispositivo: loan?.solicitud?.dispositivo || {},
    
    // Producto
    producto: loan?.solicitud?.producto?.nombreDelProducto || 'N/A',
    
    // Montos (convertidos de centavos)
    valorDispersado: (loan?.solicitud?.montos?.valorDispersadoCentavos || 0) / 100,
    valorAdeudado: (loan?.solicitud?.montos?.valorAdeudadoCentavos || 0) / 100,
    valorExtension: (loan?.solicitud?.montos?.valorExtencionCentavos || 0) / 100,
    valorOperativo: (loan?.solicitud?.montos?.valorOperativoCentavos || 0) / 100,
    valorLiquidacion: (loan?.cicloDeVida?.valorLiquidacionCentavos || 0) / 100,
    interesPorcentaje: loan?.solicitud?.montos?.interesPorcentaje,
    interesDiario: loan?.solicitud?.montos?.interesDiarioPorcentaje,
    interesTotal: loan?.solicitud?.montos?.interesTotal,
    nivelDePrestamo: loan?.solicitud?.montos?.nivelDePrestamo,
    
    // Ciclo de vida
    estadoDeCredito: loan?.cicloDeVida?.estadoDeCredito || 'Desconocido',
    fechaDispersion: loan?.cicloDeVida?.fechas?.fechaDeDispersion,
    fechaCobro: loan?.cicloDeVida?.fechas?.fechaDeCobro,
    fechaReembolso: loan?.cicloDeVida?.fechas?.fechaReembolso,
    diasMora: diasMora,
    
    // Operación - Verificación
    asesorVerificador: loan?.operacion?.verificacion?.asesorVerificador,
    emailVerificador: loan?.operacion?.verificacion?.emailAsesorVerificador,
    cuentaVerificador: loan?.operacion?.verificacion?.cuentaVerificador,
    fechaTramitacionVerificacion: loan?.operacion?.verificacion?.fechaDeTramitacionDelCaso,
    empresaVerificacion: loan?.operacion?.verificacion?.nombreDeLaEmpresa,
    
    // Operación - Cobranza
    asesorCobrador: loan?.operacion?.cobranza?.asesorCobrador,
    emailCobrador: loan?.operacion?.cobranza?.emailAsesorCobrador,
    cuentaCobrador: loan?.operacion?.cobranza?.cuentaCobrador,
    fechaTramitacionCobranza: loan?.operacion?.cobranza?.fechaDeTramitacionDeCobro,
    empresaCobranza: loan?.operacion?.cobranza?.nombreDeLaEmpresa,
    estadoComunicacion: loan?.operacion?.cobranza?.estadoDeComunicacion,
    fechaRegistroComunicacion: loan?.operacion?.cobranza?.fechaRegistroComunicacion,
    
    // Operación - Auditoría
    asesorAuditor: loan?.operacion?.auditoria?.asesorAuditor,
    emailAuditor: loan?.operacion?.auditoria?.emailAsesorAuditor,
    cuentaAuditor: loan?.operacion?.auditoria?.cuentaAuditor,
    empresaAuditoria: loan?.operacion?.auditoria?.nombreDeLaEmpresa,
    
    // Acotaciones
    acotaciones: loan?.operacion?.acotaciones || [],
    ultimaAcotacionVerificacion: loan?.operacion?.ultimaAcotacionVerificacion,
    ultimaAcotacionCobranza: loan?.operacion?.ultimaAcotacionCobranza,
    ultimaAcotacionAuditoria: loan?.operacion?.ultimaAcotacionAuditoria,
    historialAsesores: loan?.operacion?.historialDeAsesores || [],
    
    // Integraciones
    claveRastreoDispersion: loan?.integraciones?.stp?.claveRastreoDispersionSTP,
    claveRastreoAbono: loan?.integraciones?.stp?.claveRastreoAbonoSTP,
    ordenDispersion: loan?.integraciones?.stp?.ordenDeDispersion,
    
    // Pagos
    cuentaClabeParaCobro: loan?.pagos?.cuentaClabeParaCobro,
    
    // Metadata
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt
  };
};

// 1️⃣ GET: Obtener todos los loans
const getLoans = async (req, res) => {
  try {
    const loans = await Prestamo.find().lean(); // .lean() es más rápido
    
    const loansTransformados = loans.map(transformarLoan);

    res.status(200).json({
      mensaje: '✅ Loans obtenidos con éxito 📋',
      total: loansTransformados.length,
      loans: loansTransformados
    });
  } catch (error) {
    console.error('Error en getLoans:', error);
    res.status(500).json({ error: 'Error al obtener los loans: ' + error.message });
  }
};

// 2️⃣ POST: Crear un nuevo loan (usando modelo Prestamo completo)
const createLoan = async (req, res) => {
  try {
    const {
      // Cliente requerido
      nombreDelCliente,
      numeroDeTelefonoMovil,
      
      // Montos
      valorAdeudadoCentavos,
      valorDispersadoCentavos,
      interesPorcentaje,
      
      // Ciclo de vida
      estadoDeCredito = 'En Mora',
      fechaDeCobro,
      fechaDeDispersion,
      
      // Operación (Opcional)
      asesorVerificador,
      asesorCobrador,
      
      // Acotación
      acotacion,
      tipoAcotacion = 'cobranza'
    } = req.body;

    // ✅ VALIDACIÓN
    if (!nombreDelCliente || !numeroDeTelefonoMovil || !valorAdeudadoCentavos) {
      return res.status(400).json({
        error: 'Campos requeridos: nombreDelCliente, numeroDeTelefonoMovil, valorAdeudadoCentavos'
      });
    }

    // 🏗️ CONSTRUIR DOCUMENTO COMPLETO
    // Generar número de préstamo aleatorio de 6 dígitos
    const numeroDePrestamo = String(Math.floor(100000 + Math.random() * 900000));
    
    const nuevoLoan = new Prestamo({
      numeroDePrestamo: numeroDePrestamo,
      
      solicitud: {
        versionSchema: 1,
        cliente: {
          nombreDelCliente,
          numeroDeTelefonoMovil,
          clienteNuevo: req.body.clienteNuevo || 'Sí',
          curp: req.body.curp,
          rfc: req.body.rfc,
          email: req.body.email
        },
        evidencia: {
          contactos: req.body.contactos || [],
          sms: req.body.sms || []
        },
        dispositivo: {
          dispositivoId: req.body.dispositivoId,
          marca: req.body.marca,
          modelo: req.body.modelo,
          esEmulador: req.body.esEmulador || false,
          idApp: req.body.idApp,
          versionApp: req.body.versionApp
        },
        producto: {
          nombreDelProducto: req.body.producto || 'Préstamo General',
          icon: req.body.icon
        },
        cuentaBancariaId: req.body.cuentaBancariaId,
        montos: {
          valorAdeudadoCentavos: Math.round(valorAdeudadoCentavos),
          valorDispersadoCentavos: Math.round(valorDispersadoCentavos || 0),
          interesPorcentaje: interesPorcentaje || '0',
          interesDiarioPorcentaje: req.body.interesDiarioPorcentaje || '0'
        },
        fechaDeCreacionDeLaTarea: new Date()
      },
      
      cicloDeVida: {
        estadoDeCredito,
        fechas: {
          fechaDeDispersion: fechaDeDispersion ? new Date(fechaDeDispersion) : new Date(),
          fechaDeCobro: fechaDeCobro ? new Date(fechaDeCobro) : null,
          fechaDeReembolso: null
        }
      },
      
      operacion: {
        verificacion: {
          asesorVerificador: asesorVerificador || 'Pendiente',
          fechaDeTramitacionDelCaso: new Date()
        },
        cobranza: {
          asesorCobrador: asesorCobrador || 'Pendiente',
          estadoDeComunicacion: 'Pendiente',
          fechaRegistroComunicacion: new Date()
        },
        acotaciones: acotacion ? [{
          tipo: tipoAcotacion,
          estadoDeCredito,
          acotacion,
          asesor: req.user?.email || 'Sistema',
          emailAsesor: req.user?.email,
          fechaDeAcotacion: new Date()
        }] : [],
        historialDeAsesores: asesorVerificador ? [{
          nombreAsesor: asesorVerificador,
          fechaDeAsignacion: new Date()
        }] : []
      },
      
      integraciones: {
        stp: {
          claveRastreoDispersionSTP: req.body.claveRastreo || null
        }
      }
    });

    // 💾 GUARDAR EN BD
    const loanGuardado = await nuevoLoan.save();
    const loanTransformado = transformarLoan(loanGuardado);

    res.status(201).json({
      mensaje: '✅ Loan registrado con éxito 💸',
      loan: loanTransformado
    });
  } catch (error) {
    console.error('Error en createLoan:', error);
    res.status(400).json({ error: 'Error al crear el loan: ' + error.message });
  }
};

// 3️⃣ GET: Obtener un loan específico por ID
const getLoanById = async (req, res) => {
  try {
    const loan = await Prestamo.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    const loanTransformado = transformarLoan(loan);

    res.status(200).json({
      mensaje: '✅ Loan obtenido con éxito 📂',
      loan: loanTransformado
    });
  } catch (error) {
    console.error('Error en getLoanById:', error);
    res.status(500).json({ error: 'Error al obtener el loan: ' + error.message });
  }
};

// 4️⃣ PUT: Actualizar un loan (opcional)
const updateLoan = async (req, res) => {
  try {
    const loan = await Prestamo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    const loanTransformado = transformarLoan(loan);

    res.status(200).json({
      mensaje: '✅ Loan actualizado con éxito 🔄',
      loan: loanTransformado
    });
  } catch (error) {
    console.error('Error en updateLoan:', error);
    res.status(400).json({ error: 'Error al actualizar el loan: ' + error.message });
  }
};

// 5️⃣ DELETE: Eliminar un loan (opcional)
const deleteLoan = async (req, res) => {
  try {
    const loan = await Prestamo.findByIdAndDelete(req.params.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    res.status(200).json({
      mensaje: '✅ Loan eliminado con éxito 🗑️',
      loanEliminado: loan._id
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
  deleteLoan
};
