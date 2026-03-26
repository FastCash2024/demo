// backend/server.js
const express = require('express');
const cors = require('cors'); 
require('dotenv').config();

// 1. Importamos la función de conexión a la BD (¡Con tu ruta correcta!)
const connectDB = require('./src/infrastructure/database/connection');

// 2. Importamos TODAS las rutas que construimos en la carpeta api/routes
// Al apuntar a la carpeta, Node.js automáticamente lee el archivo index.js
const apiRoutes = require('./src/api/routes'); 

const app = express();

// Middlewares Globales
app.use(cors()); // <-- ¡El portero que dejará pasar a React!
app.use(express.json());

// ==========================================
// INICIALIZACIÓN DE BASE DE DATOS Y SERVIDOR
// ==========================================
const startServer = async () => {
  try {
    // Primero conectamos la base de datos
    await connectDB();

    // Ruta raíz (para saber que el servidor está vivo si entras desde el navegador)
    app.get('/', (req, res) => {
      res.send('🚀 API de Clean Cash CRM funcionando correctamente bajo Clean Architecture');
    });

    // 👇 AQUÍ SUCEDE LA MAGIA 👇
    // Conectamos todas las rutas de usuarios y préstamos a la ruta base '/api'
    app.use('/api', apiRoutes);

    // Levantamos el servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al arrancar el servidor:', error);
    process.exit(1);
  }
};

// ¡Arrancamos los motores!
startServer();