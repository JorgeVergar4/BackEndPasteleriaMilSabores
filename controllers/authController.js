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
      rol: user.rol || user.role
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
      apellidos,
      email,
      password,
      telefono,
      fechaNacimiento,
      region,
      rol
    } = req.body;

    // Logs para debugging
    console.log('📝 Intento de registro:', { nombre, apellidos, email, telefono, region });

    if (!email || !password || !nombre || !apellidos) {
      return res.status(400).json({ 
        error: 'Nombre, apellidos, email y contraseña son obligatorios',
        details: { nombre: !!nombre, apellidos: !!apellidos, email: !!email, password: !!password }
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el email ya existe
    console.log('🔍 Verificando si email existe:', email);
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (existingError) {
      console.error('❌ Error al verificar email existente:', existingError);
      throw existingError;
    }

    if (existing && existing.length > 0) {
      console.log('⚠️ Email ya registrado:', email);
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    console.log('🔐 Hasheando password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Calcular edad si se proporciona fecha de nacimiento
    let edad = null;
    let descuentoSenior = false;
    if (fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      descuentoSenior = edad >= 50;
      console.log('📅 Edad calculada:', edad, 'Descuento senior:', descuentoSenior);
    }

    // Verificar si es estudiante DUOC
    const esEstudianteDuoc = email.endsWith('@duocuc.cl');
    if (esEstudianteDuoc) {
      console.log('🎓 Usuario identificado como estudiante DUOC');
    }

    // Role por defecto: "cliente"
    const userRole = rol && ['admin', 'cliente'].includes(rol) ? rol : 'cliente';

    const userData = {
      nombre,
      apellidos,
      email,
      password_hash: passwordHash,
      telefono: telefono || null,
      fecha_nacimiento: fechaNacimiento || null,
      region: region || null,
      edad,
      es_estudiante_duoc: esEstudianteDuoc,
      descuento_senior: descuentoSenior,
      rol: userRole
    };

    console.log('💾 Insertando usuario en Supabase...', { email, nombre, rol: userRole });

    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert(userData)
      .select('id, nombre, apellidos, email, telefono, fecha_nacimiento, region, edad, es_estudiante_duoc, descuento_senior, rol, created_at')
      .single();

    if (insertError) {
      console.error('❌ Error al insertar usuario:', insertError);
      console.error('Detalles del error:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      
      // Enviar error más descriptivo
      return res.status(500).json({
        error: 'Error al crear usuario en la base de datos',
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    }

    if (!createdUser) {
      console.error('❌ Usuario no fue creado (data es null)');
      return res.status(500).json({
        error: 'Error al crear usuario',
        message: 'No se recibieron datos del usuario creado'
      });
    }

    console.log('✅ Usuario creado exitosamente:', createdUser.id);

    const token = generateToken(createdUser);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: createdUser,
      token
    });
  } catch (err) {
    console.error('❌ Error general en register:', err);
    console.error('Stack trace:', err.stack);
    
    // Enviar error detallado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        error: 'Error en el registro',
        message: err.message,
        stack: err.stack
      });
    }
    
    return res.status(500).json({
      error: 'Error en el registro',
      message: err.message
    });
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
