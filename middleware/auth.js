const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Validar que JWT_SECRET esté configurado
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET no configurado');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol }
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

    const userRole = req.user.rol || req.user.role; // Compatibilidad con ambos nombres

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};
