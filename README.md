# 🍰 Backend API - Pastelería Mil Sabores

Backend REST API para Pastelería Mil Sabores con Node.js, Express y Supabase.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Verificar conexión a Supabase
npm run test-connection

# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

## ⚙️ Configuración

### Variables de entorno (.env)

Copia `.env.example` y configura las siguientes variables:

```env
SUPABASE_URL=https://awojuezdvxcfkfrxpyhb.supabase.co/
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
JWT_SECRET=secreto_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Variables requeridas:**
- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `JWT_SECRET` - Secreto para firmar tokens JWT (mínimo 32 caracteres)
- `JWT_EXPIRES_IN` - Tiempo de expiración del token (default: 7d)
- `PORT` - Puerto del servidor (default: 3001)
- `NODE_ENV` - Entorno de ejecución (development/production)
- `ALLOWED_ORIGINS` - Orígenes permitidos para CORS (separados por comas)

### Base de datos Supabase

1. **Configuración inicial:** Ejecuta `SUPABASE_RESET_COMPLETO.sql` en Supabase SQL Editor
   - Crea todas las tablas necesarias
   - Deshabilita RLS (Row Level Security) para compatibilidad con la API
   - Inserta datos de ejemplo

2. **Verificación:** Ejecuta `VERIFICAR_RLS.sql` para verificar el estado de RLS

3. **Fix de emergencia:** Si tienes problemas con permisos, ejecuta `FIX_RLS_AHORA.sql`

## 🛠️ Scripts disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon (auto-reload)
- `npm start` - Inicia el servidor en modo producción
- `npm run test-connection` - Verifica la conexión con Supabase

## 📡 Endpoints de la API

### Health Check
- `GET /` - Estado de la API
- `GET /api` - Información de la API y endpoints disponibles

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil del usuario autenticado (requiere token)

### Productos (`/api/products`)
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/codigo/:codigo` - Buscar producto por código
- `GET /api/products/ofertas` - Listar productos en oferta
- `POST /api/products` - Crear nuevo producto (requiere rol admin)
- `PUT /api/products/:id` - Actualizar producto (requiere rol admin)
- `DELETE /api/products/:id` - Eliminar producto (requiere rol admin)

### Categorías (`/api/categories`)
- `GET /api/categories` - Listar todas las categorías
- `GET /api/categories/:id` - Obtener categoría por ID
- `GET /api/categories/:id/products` - Obtener productos de una categoría

### Pedidos (`/api/orders`)
- `GET /api/orders` - Listar pedidos del usuario autenticado
- `POST /api/orders` - Crear nuevo pedido
- `GET /api/orders/:id` - Obtener detalle de un pedido
- `PUT /api/orders/:id` - Actualizar estado de pedido

### Usuarios (`/api/users`)
- `GET /api/users/me` - Obtener perfil del usuario autenticado
- `PUT /api/users/me` - Actualizar perfil del usuario
- `GET /api/users` - Listar todos los usuarios (requiere rol admin)

## 🚀 Despliegue en Vercel

El proyecto está configurado para despliegue automático en Vercel.

### Configuración de variables de entorno en Vercel:

```env
SUPABASE_URL=https://awojuezdvxcfkfrxpyhb.supabase.co/
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://pasteleria-mil-sabores-react-three.vercel.app
```

### Pasos para el despliegue:

1. Conecta tu repositorio GitHub a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Vercel detectará automáticamente `vercel.json` y configurará el build
4. Deploy automático en cada push a `main`

**Frontend configurado:** `https://pasteleria-mil-sabores-react-three.vercel.app`

## 📁 Estructura del proyecto

```
BackEndPasteleriaMilSabores/
├── api/
│   └── index.js              # Servidor Express principal
├── config/
│   └── supabase.js          # Cliente de Supabase
├── controllers/
│   ├── authController.js    # Lógica de autenticación
│   ├── categoryController.js # Lógica de categorías
│   ├── orderController.js   # Lógica de pedidos
│   ├── productController.js # Lógica de productos
│   └── userController.js    # Lógica de usuarios
├── middleware/
│   └── auth.js              # Middleware de autenticación JWT
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── categories.js        # Rutas de categorías
│   ├── orders.js            # Rutas de pedidos
│   ├── products.js          # Rutas de productos
│   └── users.js             # Rutas de usuarios
├── .env.example             # Plantilla de variables de entorno
├── .gitignore
├── FIX_RLS_AHORA.sql        # Script de emergencia para RLS
├── FRONTEND_INTEGRATION_GUIDE.md # Guía de integración frontend
├── package.json
├── POSTMAN_TESTING.md       # Documentación para testing
├── SUPABASE_RESET_COMPLETO.sql # Script de setup de BD
├── test-connection.js       # Script de prueba de conexión
├── vercel.json              # Configuración de Vercel
└── VERIFICAR_RLS.sql        # Script de verificación RLS
```

## 🔐 Seguridad

### Autenticación
- Contraseñas hasheadas con `bcryptjs` (salt rounds: 10)
- Autenticación basada en JWT (JSON Web Tokens)
- Tokens con expiración configurable (default: 7 días)
- Middleware de autenticación en rutas protegidas
- Verificación de roles (admin/user)

### CORS
- Configuración dual: desarrollo y producción
- En desarrollo: permite cualquier origen
- En producción: solo orígenes específicos configurados en `ALLOWED_ORIGINS`
- Headers permitidos: Origin, X-Requested-With, Content-Type, Accept, Authorization
- Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS

### Base de datos
- RLS (Row Level Security) deshabilitado para compatibilidad con API
- Validación de datos en controladores
- Manejo de errores de Supabase

### Buenas prácticas
- Variables de entorno nunca en Git (`.gitignore` configurado)
- Validación de variables requeridas al inicio
- Logging solo en desarrollo
- Manejo global de errores
- No expone stack traces en producción

## 🛠️ Tecnologías utilizadas

### Core
- **Node.js** - Runtime de JavaScript
- **Express** v4.19.0 - Framework web
- **Supabase** v2.48.0 - Backend as a Service (PostgreSQL)

### Autenticación y seguridad
- **jsonwebtoken** v9.0.2 - Generación y validación de JWT
- **bcryptjs** v2.4.3 - Hash de contraseñas
- **cors** v2.8.5 - Configuración de CORS
- **dotenv** v16.4.5 - Manejo de variables de entorno

### Utilidades
- **morgan** v1.10.0 - Logger HTTP
- **nodemon** v3.1.0 (dev) - Auto-reload en desarrollo

## 📚 Documentación adicional

- `FRONTEND_INTEGRATION_GUIDE.md` - Guía completa de integración con frontend
- `POSTMAN_TESTING.md` - Guía de testing con Postman

## 🔄 Estado actual

### Funcionalidades implementadas
- Sistema completo de autenticación (registro, login, perfil)
- CRUD de productos con búsqueda y filtros
- Sistema de categorías
- Gestión de pedidos
- Panel de administración (usuarios admin)
- CORS configurado para desarrollo y producción
- Despliegue en Vercel funcionando

### Últimas actualizaciones (main branch)
- `10bf129` - fix: ordenar inicialización de app y CORS
- `13db7a9` - chore: logs CORS y configuración allowedOrigins
- `03876d9` - feat: configurar CORS para frontend
- `5763094` - auth/me fix
- `641e489` - fix: Script urgente para deshabilitar RLS en Supabase
