// src/application/usecases/getPrestamoById.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');

const execute = async (id) => {
  // Buscamos el préstamo por su ID único de MongoDB
  const prestamo = await Prestamo.findById(id);
  
  // Si alguien manda un ID falso o borrado, lanzamos un error
  if (!prestamo) {
    throw new Error('Préstamo no encontrado en la base de datos');
  }
  
  return prestamo;
};

module.exports = { execute };