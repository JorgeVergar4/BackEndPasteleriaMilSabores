# 🧪 Guía de Pruebas con Postman - Vercel

## 📋 Configuración Inicial

### 1. Obtener la URL de tu API en Vercel

Tu API en Vercel tendrá una URL como:
```
https://tu-proyecto.vercel.app
```

Para encontrarla:
1. Ve a tu proyecto en Vercel
2. En la página principal verás: **Domains**
3. Copia la URL (ejemplo: `https://back-end-pasteleria-mil-sabores.vercel.app`)

---

## 🚀 Pruebas en Postman

### **TEST 1: Verificar que el servidor está funcionando**

**Endpoint:** GET Health Check
```
GET https://tu-proyecto.vercel.app/
```

**Headers:** (ninguno necesario)

**Respuesta esperada:**
```json
{
  "message": "API de Pastelería Mil Sabores funcionando correctamente",
  "version": "1.0.0"
}
```

---

### **TEST 2: Listar Categorías**

**Endpoint:** GET Categorías
```
GET https://tu-proyecto.vercel.app/api/categories
```

**Headers:** (ninguno necesario - endpoint público)

**Respuesta esperada:**
```json
[
  {
    "id": "uuid-aqui",
    "nombre": "Tortas Cuadradas",
    "descripcion": "Tortas cuadradas personalizables...",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

---

### **TEST 3: Listar Productos**

**Endpoint:** GET Productos
```
GET https://tu-proyecto.vercel.app/api/products
```

**Headers:** (ninguno necesario)

**Query Params (opcionales):**
- `categoria` - Filtrar por ID de categoría
- `search` - Buscar por nombre
- `enOferta=true` - Solo productos en oferta

**Ejemplo con filtros:**
```
GET https://tu-proyecto.vercel.app/api/products?enOferta=true
```

**Respuesta esperada:**
```json
[
  {
    "id": "uuid",
    "codigo": "TC001",
    "nombre": "Torta Cuadrada de Chocolate",
    "descripcion": "Deliciosa torta...",
    "precio": 45000,
    "stock": 8,
    "categoria_id": "uuid",
    "imagen": "/assets/images/productos/TC001.jpg",
    "personalizable": true,
    "en_oferta": false
  },
  ...
]
```

---

### **TEST 4: Registrar Usuario**

**Endpoint:** POST Registro
```
POST https://tu-proyecto.vercel.app/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan.perez@example.com",
  "password": "MiPassword123",
  "telefono": "912345678",
  "region": "Santiago"
}
```

**Campos opcionales:**
```json
{
  "fechaNacimiento": "1990-05-15",
  "rol": "cliente"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid-generado",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan.perez@example.com",
    "telefono": "912345678",
    "region": "Santiago",
    "rol": "cliente",
    "es_estudiante_duoc": false,
    "descuento_senior": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Guarda el token!** Lo necesitarás para los siguientes tests.

**Errores posibles:**
```json
// 400 - Email ya existe
{
  "error": "El email ya está registrado"
}

// 400 - Datos faltantes
{
  "error": "Nombre, apellidos, email y contraseña son obligatorios"
}

// 500 - Error de servidor/base de datos
{
  "error": "Error al crear usuario en la base de datos",
  "message": "...",
  "details": "..."
}
```

---

### **TEST 5: Iniciar Sesión**

**Endpoint:** POST Login
```
POST https://tu-proyecto.vercel.app/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "juan.perez@example.com",
  "password": "MiPassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "uuid",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan.perez@example.com",
    "rol": "cliente",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Copia el token para los siguientes pasos!**

---

### **TEST 6: Obtener Mi Perfil (Requiere Autenticación)**

**Endpoint:** GET Mi Perfil
```
GET https://tu-proyecto.vercel.app/api/auth/me
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Cómo agregar el token en Postman:**
1. Ve a la pestaña **Headers**
2. Agrega un header:
   - **Key:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   
   **⚠️ Importante:** Debe tener la palabra `Bearer` seguida de un espacio y luego el token.

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan.perez@example.com",
  "rol": "cliente",
  "telefono": "912345678",
  "region": "Santiago",
  ...
}
```

**Errores posibles:**
```json
// 401 - Sin token o token inválido
{
  "error": "No se proporcionó token de autenticación"
}

// 401 - Token expirado
{
  "error": "Token inválido o expirado"
}
```

---

### **TEST 7: Crear Pedido (Requiere Autenticación)**

**Endpoint:** POST Crear Pedido
```
POST https://tu-proyecto.vercel.app/api/orders
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body (raw JSON):**
```json
{
  "items": [
    {
      "product_id": "uuid-del-producto",
      "cantidad": 2,
      "personalizacion": "Feliz Cumpleaños María"
    },
    {
      "product_id": "otro-uuid-producto",
      "cantidad": 1
    }
  ],
  "direccion_entrega": "Av. Providencia 123, Santiago",
  "metodo_pago": "transferencia",
  "notas": "Por favor llamar antes de entregar"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Pedido creado exitosamente",
  "order": {
    "id": "uuid-pedido",
    "user_id": "uuid-usuario",
    "total": 95000,
    "estado": "pendiente",
    "direccion_entrega": "Av. Providencia 123, Santiago",
    "metodo_pago": "transferencia",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "items": [...]
}
```

---

### **TEST 8: Listar Mis Pedidos (Requiere Autenticación)**

**Endpoint:** GET Mis Pedidos
```
GET https://tu-proyecto.vercel.app/api/orders
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "uuid-pedido",
    "total": 95000,
    "estado": "pendiente",
    "direccion_entrega": "...",
    "created_at": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "product_id": "uuid",
        "cantidad": 2,
        "precio_unitario": 45000,
        "subtotal": 90000,
        "product": {
          "nombre": "Torta Cuadrada de Chocolate",
          "imagen": "..."
        }
      }
    ]
  }
]
```

---

## 📝 Crear una Colección en Postman

### Opción 1: Crear manualmente

1. **Nueva Colección:**
   - Clic en "New" → "Collection"
   - Nombre: "Pastelería Mil Sabores API"

2. **Agregar Variable de Colección:**
   - Clic en la colección → "Variables"
   - Agregar variable:
     - **Variable:** `baseUrl`
     - **Initial Value:** `https://tu-proyecto.vercel.app`
     - **Current Value:** `https://tu-proyecto.vercel.app`

3. **Usar la variable en las requests:**
   ```
   {{baseUrl}}/api/products
   {{baseUrl}}/api/auth/register
   ```

4. **Agregar variable para el token:**
   - **Variable:** `token`
   - **Initial Value:** (vacío)
   - **Current Value:** (pegar tu token después de login)

5. **En los headers:**
   ```
   Authorization: Bearer {{token}}
   ```

### Opción 2: Importar JSON

Crea un archivo `postman_collection.json`:

```json
{
  "info": {
    "name": "Pastelería Mil Sabores API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://tu-proyecto.vercel.app"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nombre\": \"Juan\",\n  \"apellidos\": \"Pérez\",\n  \"email\": \"juan@example.com\",\n  \"password\": \"123456\",\n  \"telefono\": \"912345678\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"juan@example.com\",\n  \"password\": \"123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/products",
              "host": ["{{baseUrl}}"],
              "path": ["api", "products"]
            }
          }
        }
      ]
    }
  ]
}
```

Luego importa en Postman: **Import** → Selecciona el archivo

---

## 🔍 Debugging de Errores

### Error 404 - Not Found
```
Cannot GET /api/products
```
**Solución:**
- Verifica que la URL sea correcta
- Asegúrate de que el backend esté desplegado en Vercel
- Verifica que `vercel.json` esté configurado correctamente

### Error 500 - Internal Server Error
```json
{
  "error": "Error al crear usuario en la base de datos",
  "message": "...",
  "details": "..."
}
```
**Solución:**
- Ve a Vercel → Logs → Function Logs
- Busca los logs con emojis (📝, 🔍, 💾, etc.)
- El error específico estará en los detalles

### Error de CORS
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solución:**
- Verifica que `ALLOWED_ORIGINS` en Vercel incluya tu dominio
- En desarrollo local, CORS debería estar abierto

### Token no funciona
```json
{
  "error": "Token inválido o expirado"
}
```
**Solución:**
- Verifica que el token esté en el formato: `Bearer token_aqui`
- Asegúrate de tener espacio después de "Bearer"
- El token expira en 7 días, genera uno nuevo con login

---

## ✅ Checklist de Pruebas

- [ ] GET `/` - Servidor funcionando
- [ ] GET `/api/categories` - Listar categorías
- [ ] GET `/api/products` - Listar productos
- [ ] POST `/api/auth/register` - Registrar usuario
- [ ] POST `/api/auth/login` - Iniciar sesión
- [ ] GET `/api/auth/me` - Mi perfil (con token)
- [ ] GET `/api/users/me` - Mi perfil alternativo
- [ ] POST `/api/orders` - Crear pedido (con token)
- [ ] GET `/api/orders` - Mis pedidos (con token)
- [ ] GET `/api/products/ofertas` - Productos en oferta

---

## 🎯 Pro Tips

1. **Guardar el token automáticamente:**
   En el test del login, puedes agregar un script:
   ```javascript
   // En Tests tab de Postman
   var jsonData = pm.response.json();
   pm.collectionVariables.set("token", jsonData.token);
   ```

2. **Pre-request Script para debugging:**
   ```javascript
   console.log("URL:", pm.request.url);
   console.log("Headers:", pm.request.headers);
   ```

3. **Verificar respuesta:**
   ```javascript
   pm.test("Status code is 200", function () {
     pm.response.to.have.status(200);
   });
   
   pm.test("Response has token", function () {
     var jsonData = pm.response.json();
     pm.expect(jsonData.token).to.exist;
   });
   ```

---

## 🚀 ¡Listo para probar!

Ahora tienes todo para testear tu API en Vercel con Postman.
