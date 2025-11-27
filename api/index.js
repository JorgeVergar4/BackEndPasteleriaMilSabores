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

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://pasteleria-mil-sabores-react-three.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin Origin (por ejemplo, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('Origen no permitido por CORS:', origin);
      return callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));


// Importar rutas
const authRoutes = require('../routes/auth');
const categoryRoutes = require('../routes/categories');
const productRoutes = require('../routes/products');
const userRoutes = require('../routes/users');
const orderRoutes = require('../routes/orders');

const app = express();

// CORS - Configuración para Vercel y desarrollo local
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // En producción, permitir solo orígenes específicos
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    // En desarrollo, permitir cualquier origen
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

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
      users: '/api/users',
      orders: '/api/orders'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

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
