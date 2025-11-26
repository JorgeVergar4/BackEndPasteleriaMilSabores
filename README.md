# 🍰 Backend API - Pastelería Mil Sabores

Backend REST API para Pastelería Mil Sabores con Node.js, Express y Supabase.

## 🚀 Inicio Rápido

```bash
npm install
# Configura .env con tus credenciales de Supabase
npm run test-connection
npm start
```

## ⚙️ Configuración

### Variables de entorno (.env)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
JWT_SECRET=secreto_super_seguro_minimo_32_caracteres
PORT=3000
NODE_ENV=development
```

### Base de datos

Ejecuta `SUPABASE_RESET_COMPLETO.sql` en Supabase SQL Editor.

## 📡 Endpoints

### Autenticación
- POST `/api/auth/register` - Registrar
- POST `/api/auth/login` - Login  
- GET `/api/auth/me` - Perfil (requiere token)

### Productos
- GET `/api/products` - Listar
- GET `/api/products/:id` - Por ID
- GET `/api/products/codigo/:codigo` - Por código
- GET `/api/products/ofertas` - En oferta
- POST `/api/products` - Crear (admin)
- PUT `/api/products/:id` - Actualizar (admin)
- DELETE `/api/products/:id` - Eliminar (admin)

### Categorías
- GET `/api/categories` - Listar
- GET `/api/categories/:id` - Por ID
- GET `/api/categories/:id/products` - Productos

### Pedidos
- GET `/api/orders` - Mis pedidos
- POST `/api/orders` - Crear pedido
- GET `/api/orders/:id` - Detalle
- PUT `/api/orders/:id` - Actualizar

### Usuarios
- GET `/api/users/me` - Mi perfil
- PUT `/api/users/me` - Actualizar perfil
- GET `/api/users` - Listar (admin)

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura variables de entorno:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - JWT_SECRET
   - NODE_ENV=production
   - ALLOWED_ORIGINS=https://tu-frontend.vercel.app
3. Deploy!

## 📁 Estructura

```
api/index.js - Servidor Express
config/supabase.js - Cliente Supabase
controllers/ - Lógica de negocio
middleware/ - Auth JWT
routes/ - Definición de rutas
```

## 🔐 Seguridad

- Passwords hasheados con bcryptjs
- Autenticación JWT
- CORS configurado para producción
- Variables de entorno nunca en Git
