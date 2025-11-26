const { supabase } = require('../config/supabase');

const getAllCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo categorías:', err);
    next(err);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    // categoryName será el nombre o id de la categoría
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, nombre, descripcion')
      .or(`nombre.ilike.%${categoryName}%,id.eq.${categoryName}`)
      .single();

    if (catError && catError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    if (catError) throw catError;

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('categoria_id', category.id)
      .order('nombre', { ascending: true });

    if (prodError) throw prodError;

    return res.json({
      category,
      products
    });
  } catch (err) {
    console.error('Error obteniendo productos por categoría:', err);
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getProductsByCategory
};
