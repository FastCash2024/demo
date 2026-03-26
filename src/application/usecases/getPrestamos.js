// src/application/usecases/getPrestamos.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');

const execute = async () => {
  // .find() sin filtros trae TODOS los documentos de la colección
  // .sort({ createdAt: -1 }) los ordena del más reciente al más antiguo
  const prestamos = await Prestamo.find().sort({ createdAt: -1 });
  
  return prestamos;
};

module.exports = { execute };