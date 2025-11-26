const { supabase } = require('../config/supabase');

const getAllOrders = async (req, res, next) => {
  try {
    const { estado, usuarioId } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        users (
          id,
          nombre,
          apellidos,
          email
        )
      `);

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo órdenes:', err);
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          id,
          nombre,
          apellidos,
          email,
          telefono
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (error) throw error;

    // Verificar permisos: admin o dueño de la orden
    if (req.user.rol !== 'admin' && data.usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta orden' });
    }

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo orden por id:', err);
    next(err);
  }
};

const getOrdersByUser = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;

    // Solo el usuario mismo o admin pueden ver sus órdenes
    if (req.user.id !== usuarioId && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para ver estas órdenes' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error obteniendo órdenes del usuario:', err);
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const {
      productos,
      subtotal,
      descuentos,
      iva,
      total,
      datosEnvio,
      metodoPago
    } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'La orden debe tener al menos un producto' });
    }

    if (!datosEnvio || !metodoPago) {
      return res.status(400).json({ error: 'Datos de envío y método de pago son obligatorios' });
    }

    // Validar datos de envío
    const { nombre, apellidos, email, telefono, direccion, comuna, region } = datosEnvio;
    if (!nombre || !apellidos || !email || !direccion || !comuna || !region) {
      return res.status(400).json({ error: 'Todos los datos de envío son obligatorios' });
    }

    // Generar número de orden único
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const numeroOrden = `ORD-${timestamp}-${random}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        numero_orden: numeroOrden,
        usuario_id: req.user?.id || null,
        productos,
        subtotal,
        descuentos: descuentos || 0,
        iva,
        total,
        datos_envio: datosEnvio,
        metodo_pago: metodoPago,
        estado: 'pendiente'
      })
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      id: data.id,
      numeroOrden: data.numero_orden,
      orden: data
    });
  } catch (err) {
    console.error('Error creando orden:', err);
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Solo admin puede cambiar estados
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar el estado de la orden' });
    }

    const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'listo', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ estado })
      .eq('id', id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error actualizando estado de orden:', err);
    next(err);
  }
};

const getOrderStatistics = async (req, res, next) => {
  try {
    // Solo admin puede ver estadísticas
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para ver estadísticas' });
    }

    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*');

    if (error) throw error;

    const totalOrdenes = allOrders.length;
    const totalVentas = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordenesPendientes = allOrders.filter(o => o.estado === 'pendiente').length;
    const ordenesConfirmadas = allOrders.filter(o => o.estado === 'confirmado').length;
    const ordenesPreparando = allOrders.filter(o => o.estado === 'preparando').length;
    const ordenesListas = allOrders.filter(o => o.estado === 'listo').length;
    const ordenesEnviadas = allOrders.filter(o => o.estado === 'enviado').length;
    const ordenesEntregadas = allOrders.filter(o => o.estado === 'entregado').length;
    const ordenesCanceladas = allOrders.filter(o => o.estado === 'cancelado').length;

    const promedioVenta = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;

    return res.json({
      totalOrdenes,
      totalVentas,
      promedioVenta,
      porEstado: {
        pendiente: ordenesPendientes,
        confirmado: ordenesConfirmadas,
        preparando: ordenesPreparando,
        listo: ordenesListas,
        enviado: ordenesEnviadas,
        entregado: ordenesEntregadas,
        cancelado: ordenesCanceladas
      }
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    next(err);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrderStatus,
  getOrderStatistics
};
