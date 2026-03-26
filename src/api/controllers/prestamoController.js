// src/api/controllers/prestamoController.js
const CreatePrestamoUseCase = require('../../application/usecases/createPrestamo');
const GetPrestamosUseCase = require('../../application/usecases/getPrestamos');
const AddAcotacionUseCase = require('../../application/usecases/addAcotacion'); 
const GetPrestamoByIdUseCase = require('../../application/usecases/getPrestamoById'); // <-- 1. Importamos la Lupa

// 1. FUNCIÓN POST: Crear préstamo
const createPrestamo = async (req, res) => {
  try {
    const prestamoCreado = await CreatePrestamoUseCase.execute(req.body);
    res.status(201).json({
      mensaje: '💸 Préstamo registrado con éxito en el CRM',
      prestamo: prestamoCreado
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. FUNCIÓN GET: Obtener todos los préstamos
const getPrestamos = async (req, res) => {
  try {
    const prestamos = await GetPrestamosUseCase.execute();
    res.status(200).json({
      mensaje: 'Lista de préstamos obtenida con éxito 📋',
      total: prestamos.length,
      prestamos: prestamos
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al obtener los préstamos' });
  }
};

// 3. FUNCIÓN PATCH: Agregar una acotación (nota)
const addAcotacion = async (req, res) => {
  try {
    const prestamoActualizado = await AddAcotacionUseCase.execute(
      req.params.id, 
      req.body, 
      req.user 
    );
    
    res.status(200).json({
      mensaje: '📝 Acotación registrada exitosamente',
      prestamo: prestamoActualizado
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 👇 4. NUEVA FUNCIÓN GET: Obtener un solo préstamo por su ID (La Lupa)
const getPrestamoById = async (req, res) => {
  try {
    const prestamo = await GetPrestamoByIdUseCase.execute(req.params.id);
    res.status(200).json({
      mensaje: 'Expediente recuperado con éxito 📂',
      prestamo: prestamo
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// EXPORTAMOS LAS 4 FUNCIONES JUNTAS
module.exports = {
  createPrestamo,
  getPrestamos,
  addAcotacion,
  getPrestamoById // <-- 2. Exportamos la nueva función
};