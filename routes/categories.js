const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getProductsByCategory
} = require('../controllers/categoryController');

// GET /api/categories
router.get('/', getAllCategories);

// GET /api/categories/:categoryName/products
router.get('/:categoryName/products', getProductsByCategory);

module.exports = router;
