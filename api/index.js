const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('../routes/auth');
const categoryRoutes = require('../routes/categories');
const productRoutes = require('../routes/products');
const userRoutes = require('../routes/users');

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'API Pastelería Mil Sabores OK' });
});

// Prefijo /api (como usa tu frontend: REACT_APP_API_URL=http://localhost:3001/api)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Servidor local (desarrollo)
// En Vercel se usa como serverless function, no se hace app.listen
const isVercel = !!process.env.VERCEL;
const PORT = process.env.PORT || 3001;

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`✅ API escuchando en http://localhost:${PORT}`);
  });
}

// Exportar app para Vercel
module.exports = app;
