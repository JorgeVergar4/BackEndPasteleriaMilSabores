const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, telefono, fecha_nacimiento, region, edad, es_estudiante_duoc, descuento_senior, rol, created_at')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error en getMe:', err);
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, telefono, fecha_nacimiento, region, edad, es_estudiante_duoc, descuento_senior, rol, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, telefono, fecha_nacimiento, region, edad, es_estudiante_duoc, descuento_senior, rol, created_at')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo usuario por ID:', err);
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, email, telefono, region, fechaNacimiento } = req.body;

    // Solo el usuario mismo o un admin pueden actualizar
    if (req.user.id !== id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este usuario' });
    }

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (apellidos) updates.apellidos = apellidos;
    if (email) updates.email = email;
    if (telefono) updates.telefono = telefono;
    if (region) updates.region = region;
    if (fechaNacimiento) {
      updates.fecha_nacimiento = fechaNacimiento;

      // Recalcular edad y descuento senior
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      updates.edad = edad;
      updates.descuento_senior = edad >= 50;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, nombre, apellidos, email, telefono, fecha_nacimiento, region, edad, es_estudiante_duoc, descuento_senior, rol, created_at')
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Solo admin puede eliminar usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios' });
    }

    // Verificar que el usuario a eliminar no sea admin
    const { data: userToDelete, error: fetchError } = await supabase
      .from('users')
      .select('rol')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (fetchError) throw fetchError;

    if (userToDelete.rol === 'admin') {
      return res.status(403).json({ error: 'No se puede eliminar un usuario administrador' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Solo el usuario mismo puede cambiar su contraseña
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'No tienes permisos para cambiar esta contraseña' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Se requiere la contraseña actual y la nueva' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener el hash actual
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', id);

    if (updateError) throw updateError;

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error cambiando contraseña:', err);
    next(err);
  }
};

module.exports = {
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
};
