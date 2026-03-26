// scripts/addTestUrls.js
// Script para agregar URLs de prueba a un Prestamo existente

const mongoose = require('mongoose');
require('dotenv').config();
const Prestamo = require('../src/infrastructure/database/models/Prestamo');

const urlsPrueba = {
  urlCurpFrontal: 'https://via.placeholder.com/400x250?text=CURP+Frontal',
  urlCurpReverso: 'https://via.placeholder.com/400x250?text=CURP+Reverso',
  urlSelfie: 'https://via.placeholder.com/400x250?text=Selfie+Verificacion'
};

async function addTestUrls() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Conectado a MongoDB');

    // Actualizar el PRIMEIRO préstamo con URLs de prueba
    const resultado = await Prestamo.findOneAndUpdate(
      {},
      {
        $set: {
          'solicitud.cliente.urlCurpFrontal': urlsPrueba.urlCurpFrontal,
          'solicitud.cliente.urlCurpReverso': urlsPrueba.urlCurpReverso,
          'solicitud.cliente.urlSelfie': urlsPrueba.urlSelfie
        }
      },
      { new: true }
    );

    if (resultado) {
      console.log('✅ Prestamo actualizado con URLs de prueba:');
      console.log('   ID:', resultado._id);
      console.log('   Cliente:', resultado.solicitud.cliente.nombreDelCliente);
      console.log('   URL CURP Frontal:', resultado.solicitud.cliente.urlCurpFrontal);
      console.log('   URL CURP Reverso:', resultado.solicitud.cliente.urlCurpReverso);
      console.log('   URL Selfie:', resultado.solicitud.cliente.urlSelfie);
    } else {
      console.log('❌ No se encontró ningún préstamo');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addTestUrls();
