-- ====================================
-- VERIFICAR Y CORREGIR RLS
-- Row Level Security - Supabase
-- ====================================
-- Ejecuta este script si tienes problemas con inserts/updates

-- ====================================
-- 1. VERIFICAR ESTADO DE RLS
-- ====================================
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ====================================
-- 2. DESHABILITAR RLS EN TODAS LAS TABLAS
-- ====================================
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;

-- ====================================
-- 3. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- ====================================
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS categories_select_all ON categories;
DROP POLICY IF EXISTS products_select_all ON products;
DROP POLICY IF EXISTS products_insert ON products;
DROP POLICY IF EXISTS products_update ON products;
DROP POLICY IF EXISTS orders_select_own ON orders;
DROP POLICY IF EXISTS orders_insert_own ON orders;
DROP POLICY IF EXISTS order_items_select ON order_items;

-- ====================================
-- 4. VERIFICAR PERMISOS DE LA TABLA
-- ====================================
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- ====================================
-- 5. OTORGAR PERMISOS COMPLETOS (si es necesario)
-- ====================================
-- NOTA: Solo ejecuta esto si los permisos están restringidos

-- GRANT ALL ON users TO anon;
-- GRANT ALL ON users TO authenticated;
-- GRANT ALL ON categories TO anon;
-- GRANT ALL ON categories TO authenticated;
-- GRANT ALL ON products TO anon;
-- GRANT ALL ON products TO authenticated;
-- GRANT ALL ON orders TO anon;
-- GRANT ALL ON orders TO authenticated;
-- GRANT ALL ON order_items TO anon;
-- GRANT ALL ON order_items TO authenticated;

-- ====================================
-- 6. VERIFICACIÓN FINAL
-- ====================================
SELECT 
  'RLS Status' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN '🔒 HABILITADO' ELSE '✅ DESHABILITADO' END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'categories', 'products', 'orders', 'order_items')
ORDER BY tablename;

-- ====================================
-- 7. PROBAR INSERT DE USUARIO
-- ====================================
-- Prueba manual de insert (cambia los datos)

/*
INSERT INTO users (
  nombre, 
  apellidos, 
  email, 
  password_hash, 
  telefono, 
  rol
) VALUES (
  'Test',
  'Usuario',
  'test@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', -- Password hasheado
  '912345678',
  'cliente'
)
RETURNING *;
*/

-- Si el INSERT funciona, el problema era RLS
-- Si aún falla, verifica los logs de Supabase
