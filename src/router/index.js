import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: 'Inicio - EcartPay'
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductView.vue'),
    meta: {
      title: 'Producto - EcartPay'
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Checkout - EcartPay'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Iniciar Sesión - EcartPay'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Registro - EcartPay'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación para rutas protegidas
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // Actualizar el título de la página
  document.title = to.meta.title || 'EcartPay';
  
  // Rutas que requieren autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated || !user) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  }
  // Rutas que requieren NO estar autenticado (login, register)
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated && user) {
      next({ path: '/' });
    } else {
      next();
    }
  }
  else {
    next();
  }
});

export default router; 