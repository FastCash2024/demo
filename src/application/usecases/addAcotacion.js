// src/application/usecases/addAcotacion.js
const Prestamo = require('../../infrastructure/database/models/Prestamo');

const execute = async (prestamoId, acotacionData, datosAsesor) => {
  // 1. Buscamos el préstamo por su ID
  const prestamo = await Prestamo.findById(prestamoId);
  if (!prestamo) {
    throw new Error('Préstamo no encontrado en el sistema');
  }

  // 2. Armamos la nueva acotación
  const nuevaAcotacion = {
    tipo: acotacionData.tipo || 'cobranza',
    acotacion: acotacionData.acotacion,
    estadoDeComunicacion: acotacionData.estadoDeComunicacion,
    // Verificamos si datosAsesor existe, si no, ponemos un genérico (por si el token falló)
    asesor: datosAsesor ? datosAsesor.email : 'asesor@cleancash.com', 
    fechaDeAcotacion: new Date()
  };

  // 3. Metemos la nota al historial
  prestamo.operacion.acotaciones.push(nuevaAcotacion);

  // 4. Actualizamos la "foto" rápida de la última gestión
  if (nuevaAcotacion.tipo === 'cobranza') {
    prestamo.operacion.ultimaAcotacionCobranza = {
      tipo: nuevaAcotacion.tipo,
      acotacion: nuevaAcotacion.acotacion,
      nombreAsesor: nuevaAcotacion.asesor,
      fecha: nuevaAcotacion.fechaDeAcotacion
    };
  }

  // 5. Guardamos en la base de datos
  await prestamo.save();

  return prestamo;
};

// 👇 ESTA ES LA LÍNEA CLAVE QUE FALTABA O ESTABA MAL
module.exports = { execute };