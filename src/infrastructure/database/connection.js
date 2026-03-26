// src/infrastructure/database/connection.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Tomamos la URI del archivo .env, o usamos la de desarrollo por defecto
        const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clean_cash_crm';
        
        await mongoose.connect(dbURI);
        console.log('✅ Base de datos conectada exitosamente (Clean Cash CRM)');
    } catch (error) {
        console.error('❌ Error crítico al conectar a la base de datos:');
        console.error(error.message);
        // Si la base de datos no conecta, matamos el proceso del servidor. 
        // No tiene sentido que el CRM arranque si no hay dónde guardar datos.
        process.exit(1); 
    }
};

module.exports = connectDB;