const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrderStatus,
  getOrderStatistics
} = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/orders/estadisticas - Obtener estadísticas (solo admin)
router.get('/estadisticas', verifyToken, checkRole('admin'), getOrderStatistics);

// GET /api/orders - Listar todas las órdenes (admin ve todas, usuarios solo las suyas)
router.get('/', verifyToken, getAllOrders);

// GET /api/orders/:id - Obtener orden por ID
router.get('/:id', verifyToken, getOrderById);

// GET /api/orders/usuario/:usuarioId - Obtener órdenes de un usuario
router.get('/usuario/:usuarioId', verifyToken, getOrdersByUser);

// POST /api/orders - Crear nueva orden
router.post('/', verifyToken, createOrder);

// PUT /api/orders/:id - Actualizar estado de orden (solo admin)
router.put('/:id', verifyToken, checkRole('admin'), updateOrderStatus);

module.exports = router;
