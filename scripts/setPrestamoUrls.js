const mongoose = require('mongoose');
require('dotenv').config();
const Prestamo = require('../src/infrastructure/database/models/Prestamo');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado');

    const prestamo = await Prestamo.findOne({});
    if (!prestamo) {
      console.log('No se encontró préstamo');
      return;
    }

    const datos = {
      'solicitud.cliente.urlCurpFrontal': 'https://via.placeholder.com/400x250?text=CURP+Frontal',
      'solicitud.cliente.urlCurpReverso': 'https://via.placeholder.com/400x250?text=CURP+Reverso',
      'solicitud.cliente.urlSelfie': 'https://via.placeholder.com/400x250?text=Selfie'
    };

    await Prestamo.updateOne({_id: prestamo._id}, {$set: datos});
    const updated = await Prestamo.findById(prestamo._id).lean();
    console.log('Actualizado:', updated.solicitud.cliente);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
})();
