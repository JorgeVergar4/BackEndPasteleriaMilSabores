const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

// Cambia los imports si 'routes' está en la raíz de tu proyecto
const authRoutes = require('../routes/auth');
const categoryRoutes = require('../routes/categories');
const productRoutes = require('../routes/products');
const userRoutes = require('../routes/users');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'API Pastelería Mil Sabores OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error global:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

const isVercel = !!process.env.VERCEL;
const PORT = process.env.PORT || 3001;

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`✅ API escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
