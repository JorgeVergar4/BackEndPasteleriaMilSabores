const express = require('express');
const router = express.Router();
const { getMe, getAllUsers, getUserById, updateUser, deleteUser, changePassword } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/users/me - Obtener perfil del usuario autenticado
router.get('/me', verifyToken, getMe);

// GET /api/users - Listar todos los usuarios (solo admin)
router.get('/', verifyToken, checkRole('admin'), getAllUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', verifyToken, getUserById);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', verifyToken, updateUser);

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', verifyToken, deleteUser);

// PUT /api/users/:id/password - Cambiar contraseña
router.put('/:id/password', verifyToken, changePassword);

module.exports = router;
