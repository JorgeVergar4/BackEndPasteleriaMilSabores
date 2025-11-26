-- ====================================
-- RESET COMPLETO DE BASE DE DATOS
-- Pastelería Mil Sabores
-- ====================================
-- ADVERTENCIA: Este script eliminará TODAS las tablas y datos
-- Ejecutar con precaución
-- ====================================

-- Deshabilitar triggers temporalmente
SET session_replication_role = 'replica';

-- ====================================
-- 1. ELIMINAR VISTAS
-- ====================================
DROP VIEW IF EXISTS products_with_category CASCADE;
DROP VIEW IF EXISTS orders_with_user CASCADE;

-- ====================================
-- 2. ELIMINAR FUNCIONES
-- ====================================
DROP FUNCTION IF EXISTS calculate_order_total(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ====================================
-- 3. ELIMINAR TABLAS (en orden correcto por dependencias)
-- ====================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Habilitar triggers nuevamente
SET session_replication_role = 'origin';

-- ====================================
-- 4. CREAR TODAS LAS TABLAS
-- ====================================

-- Tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  region VARCHAR(100),
  edad INTEGER,
  es_estudiante_duoc BOOLEAN DEFAULT false,
  descuento_senior BOOLEAN DEFAULT false,
  rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);

-- Tabla de categorías
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_nombre ON categories(nombre);

-- Tabla de productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  imagen TEXT,
  categoria_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  precio_original DECIMAL(10,2) CHECK (precio_original >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  en_oferta BOOLEAN DEFAULT false,
  tamaño VARCHAR(50),
  ingredientes TEXT[],
  personalizable BOOLEAN DEFAULT false,
  especial VARCHAR(100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_codigo ON products(codigo);
CREATE INDEX idx_products_categoria ON products(categoria_id);
CREATE INDEX idx_products_en_oferta ON products(en_oferta);
CREATE INDEX idx_products_nombre ON products(nombre);

-- Tabla de pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'completado', 'cancelado')),
  metodo_pago VARCHAR(50),
  direccion_entrega TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Tabla de detalles de pedidos
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  personalizacion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ====================================
-- 5. FUNCIÓN PARA ACTUALIZAR updated_at
-- ====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================
-- 6. TRIGGERS
-- ====================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 7. INSERTAR CATEGORÍAS
-- ====================================
INSERT INTO categories (nombre, descripcion) VALUES
  ('Tortas', 'Tortas artesanales de diferentes sabores y tamaños'),
  ('Postres', 'Postres individuales y familiares para todas las ocasiones'),
  ('Galletas', 'Galletas caseras, decoradas y personalizadas'),
  ('Bebidas', 'Bebidas frías y calientes para acompañar tus dulces'),
  ('Especiales', 'Productos especiales para fechas y celebraciones');

-- ====================================
-- 8. INSERTAR PRODUCTOS DE EJEMPLO
-- ====================================
DO $$
DECLARE
  cat_tortas_id UUID;
  cat_postres_id UUID;
  cat_galletas_id UUID;
  cat_bebidas_id UUID;
  cat_especiales_id UUID;
BEGIN
  SELECT id INTO cat_tortas_id FROM categories WHERE nombre = 'Tortas';
  SELECT id INTO cat_postres_id FROM categories WHERE nombre = 'Postres';
  SELECT id INTO cat_galletas_id FROM categories WHERE nombre = 'Galletas';
  SELECT id INTO cat_bebidas_id FROM categories WHERE nombre = 'Bebidas';
  SELECT id INTO cat_especiales_id FROM categories WHERE nombre = 'Especiales';

  -- Crear categorías nuevas
  INSERT INTO categories (nombre, descripcion) VALUES
    ('Tortas Cuadradas', 'Tortas cuadradas personalizables para todas tus celebraciones'),
    ('Tortas Circulares', 'Clásicas tortas redondas tradicionales y elegantes'),
    ('Postres Individuales', 'Delicias individuales perfectas para compartir'),
    ('Productos Sin Azúcar', 'Opciones saludables sin sacrificar el sabor'),
    ('Pastelería Tradicional', 'Recetas tradicionales de generación en generación'),
    ('Productos Sin Gluten', 'Aptos para celíacos sin comprometer el sabor'),
    ('Productos Veganos', '100% plant-based y delicioso'),
    ('Tortas Especiales', 'Diseños únicos para eventos inolvidables')
  ON CONFLICT (nombre) DO NOTHING;

  -- Obtener IDs de categorías nuevas
  SELECT id INTO cat_tortas_id FROM categories WHERE nombre = 'Tortas Cuadradas';
  SELECT id INTO cat_postres_id FROM categories WHERE nombre = 'Postres Individuales';
  SELECT id INTO cat_galletas_id FROM categories WHERE nombre = 'Tortas Circulares';
  SELECT id INTO cat_bebidas_id FROM categories WHERE nombre = 'Productos Sin Azúcar';
  SELECT id INTO cat_especiales_id FROM categories WHERE nombre = 'Tortas Especiales';

  -- TORTAS CUADRADAS
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, stock, personalizable, imagen, ingredientes) VALUES
    ('TC001', 'Torta Cuadrada de Chocolate', 
     'Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales.', 
     cat_tortas_id, 45000, 8, true, 
     '/assets/images/productos/TC001.jpg',
     ARRAY['Chocolate', 'Ganache', 'Avellanas', 'Harina', 'Huevos']),
    
    ('TC002', 'Torta Cuadrada de Frutas', 
     'Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones.', 
     cat_tortas_id, 50000, 6, true, 
     '/assets/images/productos/TC002.jpg',
     ARRAY['Frutas frescas', 'Crema chantilly', 'Bizcocho de vainilla']);

  -- TORTAS CIRCULARES
  SELECT id INTO cat_tortas_id FROM categories WHERE nombre = 'Tortas Circulares';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, stock, personalizable, imagen, ingredientes) VALUES
    ('TT001', 'Torta Circular de Vainilla', 
     'Bizcocho de vainilla clásico relleno con crema pastelera y cubierto con un glaseado dulce, perfecto para cualquier ocasión.', 
     cat_tortas_id, 40000, 10, true, 
     '/assets/images/productos/TT001.jpg',
     ARRAY['Vainilla', 'Crema pastelera', 'Glaseado']),
    
    ('TT002', 'Torta Circular de Manjar', 
     'Torta tradicional chilena con manjar y nueces, un deleite para los amantes de los sabores dulces y clásicos.', 
     cat_tortas_id, 42000, 9, true, 
     '/assets/images/productos/TT002.jpg',
     ARRAY['Manjar', 'Nueces', 'Bizcocho']);

  -- POSTRES INDIVIDUALES
  SELECT id INTO cat_postres_id FROM categories WHERE nombre = 'Postres Individuales';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, precio_original, stock, en_oferta, personalizable, imagen, ingredientes) VALUES
    ('PI001', 'Mousse de Chocolate', 
     'Postre individual cremoso y suave, hecho con chocolate de alta calidad, ideal para los amantes del chocolate.', 
     cat_postres_id, 5000, 6000, 25, true, false, 
     '/assets/images/productos/PI001.jpg',
     ARRAY['Chocolate premium', 'Crema', 'Azúcar']),
    
    ('PI002', 'Tiramisú Clásico', 
     'Un postre italiano individual con capas de café, mascarpone y cacao, perfecto para finalizar cualquier comida.', 
     cat_postres_id, 5500, NULL, 20, false, false, 
     '/assets/images/productos/PI002.jpg',
     ARRAY['Café', 'Mascarpone', 'Cacao', 'Bizcochos']);

  -- PRODUCTOS SIN AZÚCAR
  SELECT id INTO cat_bebidas_id FROM categories WHERE nombre = 'Productos Sin Azúcar';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, precio_original, stock, en_oferta, personalizable, especial, imagen, ingredientes) VALUES
    ('PSA001', 'Torta Sin Azúcar de Naranja', 
     'Torta ligera y deliciosa, endulzada naturalmente, ideal para quienes buscan opciones más saludables.', 
     cat_bebidas_id, 48000, NULL, 5, false, true, 
     'Sin azúcar',
     '/assets/images/productos/PSA001.jpg',
     ARRAY['Naranja', 'Edulcorante natural', 'Harina integral']),
    
    ('PSA002', 'Cheesecake Sin Azúcar', 
     'Suave y cremoso, este cheesecake es una opción perfecta para disfrutar sin culpa.', 
     cat_bebidas_id, 47000, 52000, 4, true, false, 
     'Sin azúcar',
     '/assets/images/productos/PSA002.jpg',
     ARRAY['Queso crema', 'Edulcorante natural', 'Base de galleta']);

  -- PASTELERÍA TRADICIONAL
  SELECT id INTO cat_galletas_id FROM categories WHERE nombre = 'Pastelería Tradicional';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, stock, personalizable, imagen, ingredientes) VALUES
    ('PT001', 'Empanada de Manzana', 
     'Pastelería tradicional rellena de manzanas especiadas, perfecta para un dulce desayuno o merienda.', 
     cat_galletas_id, 3000, 40, false, 
     '/assets/images/productos/PT001.jpg',
     ARRAY['Manzana', 'Canela', 'Masa hojaldrada']),
    
    ('PT002', 'Tarta de Santiago', 
     'Tradicional tarta española hecha con almendras, azúcar, y huevos, una delicia para los amantes de los postres clásicos.', 
     cat_galletas_id, 6000, 15, false, 
     '/assets/images/productos/PT002.jpg',
     ARRAY['Almendras', 'Azúcar', 'Huevos', 'Limón']);

  -- PRODUCTOS SIN GLUTEN
  SELECT id INTO cat_tortas_id FROM categories WHERE nombre = 'Productos Sin Gluten';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, stock, personalizable, especial, imagen, ingredientes) VALUES
    ('PG001', 'Brownie Sin Gluten', 
     'Rico y denso, este brownie es perfecto para quienes necesitan evitar el gluten sin sacrificar el sabor.', 
     cat_tortas_id, 4000, 18, false, 
     'Sin gluten',
     '/assets/images/productos/PG001.jpg',
     ARRAY['Chocolate', 'Harina sin gluten', 'Nueces']),
    
    ('PG002', 'Pan Sin Gluten', 
     'Suave y esponjoso, ideal para sándwiches o para acompañar cualquier comida.', 
     cat_tortas_id, 3500, 22, false, 
     'Sin gluten',
     '/assets/images/productos/PG002.jpg',
     ARRAY['Harina sin gluten', 'Levadura', 'Semillas']);

  -- PRODUCTOS VEGANOS
  SELECT id INTO cat_tortas_id FROM categories WHERE nombre = 'Productos Veganos';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, precio_original, stock, en_oferta, personalizable, especial, imagen, ingredientes) VALUES
    ('PV001', 'Torta Vegana de Chocolate', 
     'Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal, perfecta para veganos.', 
     cat_tortas_id, 50000, NULL, 7, false, true, 
     'Vegano',
     '/assets/images/productos/PV001.jpg',
     ARRAY['Chocolate vegano', 'Leche de almendras', 'Harina', 'Aceite de coco']),
    
    ('PV002', 'Galletas Veganas de Avena', 
     'Crujientes y sabrosas, estas galletas son una excelente opción para un snack saludable y vegano.', 
     cat_tortas_id, 4500, 5500, 30, true, false, 
     'Vegano',
     '/assets/images/productos/PV002.jpg',
     ARRAY['Avena', 'Aceite de coco', 'Jarabe de maple', 'Chispas de chocolate vegano']);

  -- TORTAS ESPECIALES
  SELECT id INTO cat_especiales_id FROM categories WHERE nombre = 'Tortas Especiales';
  INSERT INTO products (codigo, nombre, descripcion, categoria_id, precio, stock, personalizable, especial, imagen, ingredientes) VALUES
    ('TE001', 'Torta Especial de Cumpleaños', 
     'Diseñada especialmente para celebraciones, personalizable con decoraciones y mensajes únicos.', 
     cat_especiales_id, 55000, 5, true, 
     'Personalizable 100%',
     '/assets/images/productos/TE001.jpg',
     ARRAY['A elección', 'Decoraciones premium', 'Mensaje personalizado']),
    
    ('TE002', 'Torta Especial de Boda', 
     'Elegante y deliciosa, esta torta está diseñada para ser el centro de atención en cualquier boda.', 
     cat_especiales_id, 60000, 3, true, 
     'Premium - Bodas',
     '/assets/images/productos/TE002.jpg',
     ARRAY['Múltiples capas', 'Decoración elegante', 'Sabores a elección']);

END $$;

-- ====================================
-- 9. CREAR VISTAS
-- ====================================
CREATE VIEW products_with_category AS
SELECT 
  p.*,
  c.nombre as categoria_nombre,
  c.descripcion as categoria_descripcion
FROM products p
LEFT JOIN categories c ON p.categoria_id = c.id;

CREATE VIEW orders_with_user AS
SELECT 
  o.*,
  u.nombre as user_nombre,
  u.apellidos as user_apellidos,
  u.email as user_email,
  u.telefono as user_telefono
FROM orders o
LEFT JOIN users u ON o.user_id = u.id;

-- ====================================
-- 10. FUNCIÓN CALCULAR TOTAL
-- ====================================
CREATE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_amount DECIMAL;
BEGIN
  SELECT COALESCE(SUM(subtotal), 0)
  INTO total_amount
  FROM order_items
  WHERE order_id = order_uuid;
  
  RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- VERIFICACIÓN FINAL
-- ====================================
SELECT 'Base de datos reiniciada exitosamente!' as mensaje;
SELECT 'Categorías creadas:', COUNT(*) FROM categories;
SELECT 'Productos cargados:', COUNT(*) FROM products;
