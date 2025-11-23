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

// GET /api/products/:id
router.get('/:id', getProductById);

// Protegido: productos del usuario autenticado
// GET /api/products/my/products
router.get('/my/products', verifyToken, getMyProducts);

// Protegido: solo admins para crear/editar/eliminar
// POST /api/products
router.post('/', verifyToken, checkRole('admin'), createProduct);

// PUT /api/products/:id
router.put('/:id', verifyToken, checkRole('admin'), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', verifyToken, checkRole('admin'), deleteProduct);

module.exports = router;
