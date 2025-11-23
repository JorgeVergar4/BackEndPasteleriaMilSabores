const { supabase } = require('../config/supabase');

const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, email, telefono, fecha_nacimiento, region, role, created_at')
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
      .select('id, nombre, apellido, email, telefono, fecha_nacimiento, region, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    next(err);
  }
};

module.exports = {
  getMe,
  getAllUsers
};
