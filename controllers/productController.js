const { supabase } = require('../config/supabase');

const getAllProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

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
      .select('*')
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
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      is_active
    } = req.body;

    if (!name || price == null || !category_id) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        stock: stock ?? 0,
        category_id,
        image_url,
        is_active: is_active ?? true,
        created_by: req.user.id
      })
      .select('*')
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
