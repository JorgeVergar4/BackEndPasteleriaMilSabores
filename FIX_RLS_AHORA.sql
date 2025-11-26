-- ═══════════════════════════════════════════════════════════
-- SOLUCIÓN RÁPIDA - DESHABILITAR RLS
-- Ejecuta esto en Supabase SQL Editor AHORA
-- ═══════════════════════════════════════════════════════════

-- Deshabilitar Row Level Security en todas las tablas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó correctamente
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 HABILITADO (MAL)'
    ELSE '✅ DESHABILITADO (CORRECTO)'
  END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'categories', 'products', 'orders', 'order_items')
ORDER BY tablename;

-- ✅ Si ves "✅ DESHABILITADO" en todos, ¡LISTO!
-- ✅ Vuelve a intentar el registro en Postman
