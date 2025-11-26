const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Validar que JWT_SECRET esté configurado
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET no configurado');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  // Intentar obtener token desde Authorization header
  let token;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
  }

  // Si no viene en header, intentar desde cookie (req.cookies gracias a cookie-parser)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    console.error('Error verificando token:', err);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};
