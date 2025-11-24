const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

// Validar variables de entorno críticas al inicio
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  console.error('   Configura estas variables en tu archivo .env o en Vercel');
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
  }
}

// Importar rutas
const authRoutes = require('../routes/auth');
const categoryRoutes = require('../routes/categories');
const productRoutes = require('../routes/products');
const userRoutes = require('../routes/users');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Ruta de salud
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Pastelería Mil Sabores OK',
    version: '1.0.0',
    status: 'running'
  });
});

// Ruta de salud para /api
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Pastelería Mil Sabores OK',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      users: '/api/users'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Recurso no encontrado',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', err);
  
  // Error de validación de Supabase
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({
      error: 'Error en la base de datos',
      message: err.message
    });
  }
  
  // Error de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Solo iniciar servidor si no estamos en Vercel
const isVercel = !!process.env.VERCEL;
const PORT = process.env.PORT || 3001;

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`✅ API escuchando en http://localhost:${PORT}`);
    console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Exportar para Vercel
module.exports = app;
