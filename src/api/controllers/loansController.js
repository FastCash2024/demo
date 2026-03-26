// src/api/controllers/loansController.js
const CreatePrestamoUseCase = require('../../application/usecases/createPrestamo');
const GetPrestamosUseCase = require('../../application/usecases/getPrestamos');
const Prestamo = require('../../infrastructure/database/models/Prestamo');

// 1. FUNCIÓN GET: Obtener todos los loans (préstamos) con datos de la tabla
const getLoans = async (req, res) => {
  try {
    const loans = await Prestamo.find();
    
    // Transformamos los datos al formato de la tabla
    const loansTransformados = loans.map(loan => {
      const diasMora = loan?.cicloDeVida?.fechas?.fechaDeCobro
        ? Math.max(0, Math.floor((new Date() - new Date(loan.cicloDeVida.fechas.fechaDeCobro)) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: loan._id,
        contactos: loan?.solicitud?.evidencia?.contactos || [],
        cliente: loan?.solicitud?.cliente?.nombreDelCliente || 'Desconocido',
        telefono: loan?.solicitud?.cliente?.numeroDeTelefonoMovil || 'Sin teléfono',
        valorAdeudado: (loan?.solicitud?.montos?.valorAdeudadoCentavos || 0) / 100,
        fechaLimite: loan?.cicloDeVida?.fechas?.fechaDeCobro || 'Sin fecha',
        diasMora: diasMora,
        estado: loan?.cicloDeVida?.estadoDeCredito || 'Desconocido',
        acotaciones: loan?.operacion?.acotaciones || []
      };
    });

    res.status(200).json({
      mensaje: '✅ Loans obtenidos con éxito 📋',
      total: loansTransformados.length,
      loans: loansTransformados
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los loans: ' + error.message });
  }
};

// 2. FUNCIÓN POST: Crear un nuevo loan (préstamo)
const createLoan = async (req, res) => {
  try {
    const {
      cliente,
      telefono,
      valorAdeudado,
      fechaLimite,
      estado,
      acotacion
    } = req.body;

    // Validación básica
    if (!cliente || !telefono || !valorAdeudado) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: cliente, telefono, valorAdeudado'
      });
    }

    // Crear estructura de prestamo con los datos recibidos
    const datosNuevoPrestamo = {
      numeroDePrestamo: `LOAN-${Date.now()}`,
      solicitud: {
        cliente: {
          nombreDelCliente: cliente,
          numeroDeTelefonoMovil: telefono
        },
        montos: {
          valorAdeudadoCentavos: Math.round(valorAdeudado * 100)
        }
      },
      cicloDeVida: {
        estadoDeCredito: estado || 'En Mora',
        fechas: {
          fechaDeCobro: fechaLimite ? new Date(fechaLimite) : null
        }
      },
      operacion: {
        acotaciones: acotacion ? [{
          tipo: 'Creación',
          estadoDeCredito: estado || 'En Mora',
          acotacion: acotacion,
          fecha: new Date()
        }] : []
      }
    };

    // Usar el caso de uso para crear el préstamo
    const loanCreado = await CreatePrestamoUseCase.execute(datosNuevoPrestamo);

    // Transformar respuesta
    const diasMora = fechaLimite
      ? Math.max(0, Math.floor((new Date() - new Date(fechaLimite)) / (1000 * 60 * 60 * 24)))
      : 0;

    res.status(201).json({
      mensaje: '✅ Loan registrado con éxito 💸',
      loan: {
        id: loanCreado._id,
        cliente: loanCreado?.solicitud?.cliente?.nombreDelCliente,
        telefono: loanCreado?.solicitud?.cliente?.numeroDeTelefonoMovil,
        valorAdeudado: (loanCreado?.solicitud?.montos?.valorAdeudadoCentavos || 0) / 100,
        fechaLimite: fechaLimite || 'Sin fecha',
        diasMora: diasMora,
        estado: estado || 'En Mora'
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el loan: ' + error.message });
  }
};

// 3. FUNCIÓN GET: Obtener un loan específico por ID
const getLoanById = async (req, res) => {
  try {
    const loan = await Prestamo.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan no encontrado' });
    }

    const diasMora = loan?.cicloDeVida?.fechas?.fechaDeCobro
      ? Math.max(0, Math.floor((new Date() - new Date(loan.cicloDeVida.fechas.fechaDeCobro)) / (1000 * 60 * 60 * 24)))
      : 0;

    const loanTransformado = {
      id: loan._id,
      contactos: loan?.solicitud?.evidencia?.contactos || [],
      cliente: loan?.solicitud?.cliente?.nombreDelCliente || 'Desconocido',
      telefono: loan?.solicitud?.cliente?.numeroDeTelefonoMovil || 'Sin teléfono',
      valorAdeudado: (loan?.solicitud?.montos?.valorAdeudadoCentavos || 0) / 100,
      fechaLimite: loan?.cicloDeVida?.fechas?.fechaDeCobro || 'Sin fecha',
      diasMora: diasMora,
      estado: loan?.cicloDeVida?.estadoDeCredito || 'Desconocido',
      acotaciones: loan?.operacion?.acotaciones || []
    };

    res.status(200).json({
      mensaje: '✅ Loan obtenido con éxito 📂',
      loan: loanTransformado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el loan: ' + error.message });
  }
};

module.exports = {
  getLoans,
  createLoan,
  getLoanById
};
