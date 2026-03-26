// src/application/usecases/createPrestamo.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');

const execute = async (prestamoData) => {
  // 1. Validación básica: Asegurarnos de que venga el número de préstamo
  if (!prestamoData.numeroDePrestamo) {
    throw new Error('El numeroDePrestamo es obligatorio para crear el registro');
  }

  // 2. Regla de Negocio: Verificar que no exista ya ese préstamo en la BD
  const prestamoExistente = await Prestamo.findOne({ numeroDePrestamo: prestamoData.numeroDePrestamo });
  if (prestamoExistente) {
    throw new Error('Ya existe un préstamo registrado con ese número');
  }

  // 3. Creamos el registro en la base de datos
  const nuevoPrestamo = new Prestamo(prestamoData);
  await nuevoPrestamo.save();

  return nuevoPrestamo;
};

module.exports = { execute };