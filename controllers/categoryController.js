const { supabase } = require('../config/supabase');

const getAllCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

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

    // categoryName será el slug de la categoría
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', categoryName)
      .single();

    if (catError && catError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    if (catError) throw catError;

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .order('name', { ascending: true });

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
