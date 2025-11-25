const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Public
// GET /api/products
router.get('/', getAllProducts);

// Protegido: productos del usuario autenticado (debe ir antes de /:id)
// GET /api/products/my/products
router.get('/my/products', verifyToken, getMyProducts);

// GET /api/products/:id (debe ir después de rutas específicas)
router.get('/:id', getProductById);

// Protegido: solo admins para crear/editar/eliminar
// POST /api/products
router.post('/', verifyToken, checkRole('admin'), createProduct);

// PUT /api/products/:id
router.put('/:id', verifyToken, checkRole('admin'), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', verifyToken, checkRole('admin'), deleteProduct);

module.exports = router;
