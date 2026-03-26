// src/api/controllers/prestamoDetalleController.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');

// Obtener préstamo COMPLETO por ID para /perfil-cliente
const getPrestamoDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el préstamo completo sin transformación
    const prestamo = await Prestamo.findById(id);

    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    // Devolver TODOS los datos del préstamo
    res.status(200).json({
      mensaje: '✅ Detalle del préstamo obtenido',
      prestamo: prestamo
    });
  } catch (error) {
    console.error('Error en getPrestamoDetalle:', error);
    res.status(500).json({ error: 'Error al obtener detalle del préstamo: ' + error.message });
  }
};

// Obtener préstamos por email del cliente
const getPrestamosPorEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    // Buscar todos los préstamos de ese cliente
    const prestamos = await Prestamo.find({
      'solicitud.cliente.email': email.toLowerCase()
    });

    res.status(200).json({
      mensaje: '✅ Préstamos del cliente obtenidos',
      total: prestamos.length,
      prestamos: prestamos
    });
  } catch (error) {
    console.error('Error en getPrestamosPorEmail:', error);
    res.status(500).json({ error: 'Error al obtener préstamos: ' + error.message });
  }
};

module.exports = {
  getPrestamoDetalle,
  getPrestamosPorEmail
};
