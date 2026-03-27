const Prestamo = require('../../infrastructure/database/models/Prestamo');

const INTERVALO_MS = 5 * 60 * 1000;
let jobEnEjecucion = false;
let timerId = null;

const ejecutarAprobacionAutomatica = async () => {
  if (jobEnEjecucion) {
    return;
  }

  jobEnEjecucion = true;

  try {
    const resultado = await Prestamo.updateMany(
      { 'cicloDeVida.estadoDeCredito': { $ne: 'Aprobado' } },
      { $set: { 'cicloDeVida.estadoDeCredito': 'Aprobado' } }
    );

    if (resultado.modifiedCount > 0) {
      console.log(`[AutoApprovePrestamosJob] Prestamos aprobados: ${resultado.modifiedCount}`);
    }
  } catch (error) {
    console.error('[AutoApprovePrestamosJob] Error al aprobar prestamos automaticamente:', error.message);
  } finally {
    jobEnEjecucion = false;
  }
};

const startAutoApprovePrestamosJob = () => {
  if (timerId) {
    return timerId;
  }

  timerId = setInterval(ejecutarAprobacionAutomatica, INTERVALO_MS);
  console.log('[AutoApprovePrestamosJob] Programado para ejecutarse cada 5 minutos');

  return timerId;
};

module.exports = {
  startAutoApprovePrestamosJob,
};
