# ⚛️ Guía Completa de Integración Frontend - Pastelería Mil Sabores

## 📋 Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- Backend desplegado en Vercel (o corriendo localmente)
- React 18+

---

## 🚀 PASO 1: Configuración Inicial

### 1.1 Instalar dependencias necesarias

```bash
cd D:\FRONT\PasteleriaMilSaboresReact

# Instalar Axios para peticiones HTTP
npm install axios

# Instalar React Router para navegación
npm install react-router-dom

# Opcional: Para formularios
npm install react-hook-form

# Opcional: Para notificaciones
npm install react-toastify
```

### 1.2 Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto React:

```env
# URL de tu backend (cambia según el ambiente)
REACT_APP_API_URL=http://localhost:3000

# Para producción:
# REACT_APP_API_URL=https://tu-backend.vercel.app
```

**⚠️ Importante:**
- Las variables DEBEN empezar con `REACT_APP_`
- Reinicia el servidor después de modificar `.env`

---

## 📁 PASO 2: Estructura de Carpetas

Crea la siguiente estructura en `src/`:

```
src/
├── services/           ✅ Ya creados
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   ├── categoryService.js
│   └── orderService.js
├── hooks/              📌 Crear
│   ├── useAuth.js
│   └── useCart.js
├── context/            📌 Crear
│   ├── AuthContext.js
│   └── CartContext.js
├── components/         📌 Crear/Actualizar
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   ├── Cart.jsx
│   └── ProtectedRoute.jsx
├── pages/              📌 Crear
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Checkout.jsx
│   └── Profile.jsx
└── App.js
```

---

## 🔐 PASO 3: Context y Hooks

### 3.1 Context de Autenticación

**`src/context/AuthContext.js`**

```javascript
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const savedUser = authService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 3.2 Hook de Autenticación

**`src/hooks/useAuth.js`**

```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
};
```

### 3.3 Context del Carrito

**`src/context/CartContext.js`**

```javascript
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, cantidad = 1, personalizacion = '') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && item.personalizacion === personalizacion
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.personalizacion === personalizacion
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }

      return [...prevCart, { ...product, cantidad, personalizacion }];
    });
  };

  const removeFromCart = (productId, personalizacion = '') => {
    setCart(prevCart =>
      prevCart.filter(item => 
        !(item.id === productId && item.personalizacion === personalizacion)
      )
    );
  };

  const updateQuantity = (productId, cantidad, personalizacion = '') => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId && item.personalizacion === personalizacion
          ? { ...item, cantidad }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
```

### 3.4 Hook del Carrito

**`src/hooks/useCart.js`**

```javascript
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  
  return context;
};
```

---

## 🛡️ PASO 4: Componentes de Protección

### 4.1 Ruta Protegida

**`src/components/ProtectedRoute.jsx`**

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 📄 PASO 5: Páginas Principales

### 5.1 Página de Login

**`src/pages/Login.jsx`**

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

### 5.2 Página de Registro

**`src/pages/Register.jsx`**

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    region: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Crear Cuenta</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="912345678"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="region">Región</label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
            >
              <option value="">Selecciona una región</option>
              <option value="Santiago">Santiago</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Concepción">Concepción</option>
              {/* Agregar más regiones */}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        
        <p className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

### 5.3 Página de Productos

**`src/pages/Products.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, search]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory) filters.categoria = selectedCategory;
      if (search) filters.search = search;
      
      const data = await productService.getAll(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-page">
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <div className="no-results">
          No se encontraron productos
        </div>
      )}
    </div>
  );
};

export default Products;
```

### 5.4 Componente ProductCard

**`src/components/ProductCard.jsx`**

```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    alert(`${product.nombre} agregado al carrito`);
    // O usa react-toastify para notificaciones mejores
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        {product.imagen && (
          <img 
            src={product.imagen} 
            alt={product.nombre}
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        )}
        
        {product.en_oferta && (
          <span className="badge-oferta">OFERTA</span>
        )}
        
        <div className="product-info">
          <h3>{product.nombre}</h3>
          <p className="description">{product.descripcion}</p>
          
          <div className="price-section">
            {product.en_oferta && product.precio_original && (
              <span className="original-price">
                {formatPrice(product.precio_original)}
              </span>
            )}
            <span className="current-price">
              {formatPrice(product.precio)}
            </span>
          </div>
          
          {product.personalizable && (
            <span className="badge-personalizable">
              Personalizable
            </span>
          )}
        </div>
      </Link>
      
      <button 
        onClick={handleAddToCart}
        className="btn-add-cart"
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
      </button>
    </div>
  );
};

export default ProductCard;
```

---

## 🛒 PASO 6: Carrito de Compras

**`src/components/Cart.jsx`**

```javascript
import React from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Carrito de Compras</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Tu carrito está vacío</p>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="cart-item">
                <img src={item.imagen} alt={item.nombre} />
                <div className="item-details">
                  <h4>{item.nombre}</h4>
                  {item.personalizacion && (
                    <p className="personalization">
                      {item.personalizacion}
                    </p>
                  )}
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1, item.personalizacion)}
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1, item.personalizacion)}
                    >
                      +
                    </button>
                  </div>
                  <p className="item-price">
                    {formatPrice(item.precio * item.cantidad)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.personalizacion)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total">
              <span>Total:</span>
              <span className="total-price">{formatPrice(getTotal())}</span>
            </div>
            <button onClick={handleCheckout} className="btn-checkout">
              Proceder al pago
            </button>
            <button onClick={clearCart} className="btn-clear">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
```

---

## 🔄 PASO 7: App.js Completo

**`src/App.js`**

```javascript
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Cart from './components/Cart';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Navbar onCartClick={() => setCartOpen(true)} />
            <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🎨 PASO 8: Estilos Básicos

Agrega estilos básicos en `src/App.css` o usa tu CSS preferido.

---

## ✅ Checklist de Integración

- [ ] Dependencias instaladas (axios, react-router-dom)
- [ ] Archivo `.env` creado con `REACT_APP_API_URL`
- [ ] Servicios API creados (✅ ya están)
- [ ] Context de Auth creado
- [ ] Context de Cart creado
- [ ] Hooks personalizados creados
- [ ] Componente ProtectedRoute creado
- [ ] Página de Login creada
- [ ] Página de Register creada
- [ ] Página de Products creada
- [ ] Componente ProductCard creado
- [ ] Componente Cart creado
- [ ] App.js configurado con rutas
- [ ] Backend corriendo o desplegado

---

## 🚀 Iniciar el Proyecto

```bash
npm start
```

El frontend se abrirá en `http://localhost:3000` (o el puerto disponible).

---

## 🐛 Solución de Problemas

### Error de CORS
Si ves errores de CORS:
1. Verifica que el backend esté corriendo
2. Verifica `REACT_APP_API_URL` en `.env`
3. En el backend, verifica que CORS esté habilitado

### Imágenes no cargan
Las rutas de imágenes son `/assets/images/productos/TC001.jpg`
Debes tener las imágenes en `public/assets/images/productos/`

### Token no persiste
Verifica que `authService` esté guardando en localStorage correctamente.

---

## 📚 Recursos Adicionales

- [React Router Docs](https://reactrouter.com/)
- [Axios Docs](https://axios-http.com/)
- [React Context API](https://react.dev/reference/react/useContext)

---

## 🎉 ¡Listo!

Tu frontend está completamente integrado con el backend. Ahora puedes:
- ✅ Registrar usuarios
- ✅ Iniciar sesión
- ✅ Ver productos
- ✅ Agregar al carrito
- ✅ Realizar pedidos
- ✅ Ver perfil y pedidos

¡Happy coding! 🚀
