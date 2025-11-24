const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const register = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      fecha_nacimiento,
      region,
      role
    } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    // Verificar si el email ya existe
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Role por defecto: "client"
    const userRole = role && ['admin', 'client'].includes(role) ? role : 'client';

    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert({
        nombre,
        apellido,
        email,
        password_hash: passwordHash,
        telefono,
        fecha_nacimiento,
        region,
        role: userRole
      })
      .select('id, nombre, apellido, email, role, created_at')
      .single();

    if (insertError) throw insertError;

    const token = generateToken(createdUser);

    return res.status(201).json({
      user: createdUser,
      token
    });
  } catch (err) {
    console.error('Error en register:', err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (error) throw error;

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    // No devolvemos password_hash
    const { password_hash, ...userSafe } = user;

    return res.json({
      user: userSafe,
      token
    });
  } catch (err) {
    console.error('Error en login:', err);
    next(err);
  }
};

module.exports = {
  register,
  login
};
