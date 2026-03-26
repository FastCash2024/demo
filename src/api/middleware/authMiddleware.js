// src/api/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // 1. Buscamos el token en las cabeceras (headers) de la petición
  const authHeader = req.header('Authorization');

  // Si no hay cabecera o no empieza con la palabra "Bearer " (estándar de la industria)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
  }

  // 2. Extraemos solo el token (quitamos la palabra "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verificamos que el token sea auténtico y no haya expirado
    const secret = process.env.JWT_SECRET || 'clave_secreta_super_segura_de_desarrollo';
    const decoded = jwt.verify(token, secret);

    // 4. Si es válido, guardamos los datos del usuario en la petición (req.user)
    // para que el controlador que siga pueda saber quién hizo la petición.
    req.user = decoded;

    // 5. ¡Le abrimos la puerta! Pasa al siguiente controlador.
    next();
  } catch (error) {
    // Si el token es falso, fue modificado o ya caducó (pasaron las 8 horas)
    res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
  }
};

module.exports = verificarToken;