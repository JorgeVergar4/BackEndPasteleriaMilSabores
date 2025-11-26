const { supabase } = require('../config/supabase');

const getAllProducts = async (req, res, next) => {
  try {
    const { categoria, enOferta, buscar } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          nombre
        )
      `);

    if (categoria) {
      query = query.eq('categoria_id', categoria);
    }

    if (enOferta === 'true') {
      query = query.eq('en_oferta', true);
    }

    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,descripcion.ilike.%${buscar}%,codigo.ilike.%${buscar}%`);
    }

    const { data, error } = await query.order('nombre', { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo producto por id:', err);
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      imagen,
      categoria_id,
      precio,
      precioOriginal,
      stock,
      enOferta,
      tamaño,
      ingredientes,
      personalizable,
      especial
    } = req.body;

    if (!nombre || precio == null || !categoria_id || !codigo) {
      return res.status(400).json({ error: 'Código, nombre, precio y categoría son obligatorios' });
    }

    // Verificar si el código ya existe
    const { data: existing, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('codigo', codigo);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'El código del producto ya existe' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        codigo,
        nombre,
        descripcion,
        imagen,
        categoria_id,
        precio,
        precio_original: precioOriginal || null,
        stock: stock ?? 0,
        en_oferta: enOferta ?? false,
        tamaño: tamaño || null,
        ingredientes: ingredientes || [],
        personalizable: personalizable ?? false,
        especial: especial || null,
        created_by: req.user.id
      })
      .select(`
        *,
        categories (
          id,
          nombre
        )
      `)
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (err) {
    console.error('Error creando producto:', err);
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Solo admin en este ejemplo (si quieres owner + admin, aquí se valida)
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error actualizando producto:', err);
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando producto:', err);
    next(err);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo productos del usuario:', err);
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
};
