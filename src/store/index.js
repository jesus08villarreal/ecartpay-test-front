import { createStore } from 'vuex';
import api from '@/services/api';
import axios from 'axios';

// Configuración de axios para los productos
const productsApi = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'X-API-KEY': process.env.VUE_APP_PRODUCTS_API_KEY,
    'Content-Type': 'application/json',
  }
});

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    products: {
      success: false,
      data: []
    },
    cart: {
      items: [],
      total: 0
    },
    loading: false,
    error: null,
    lastApiError: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    },
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_API_ERROR(state, error) {
      state.lastApiError = {
        message: error.message || 'Error desconocido',
        code: error.response?.status || 500,
        details: error.response?.data || {},
        timestamp: new Date().toISOString()
      };
    },
    CLEAR_ERROR(state) {
      state.error = null;
      state.lastApiError = null;
    },
    ADD_TO_CART(state, { product, quantity = 1 }) {
      const existingItem = state.cart.items.find(item => item.product._id === product._id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= product.stock) {
          existingItem.quantity = newQuantity;
          existingItem.subtotal = product.price * newQuantity;
        }
      } else {
        if (quantity <= product.stock) {
          state.cart.items.push({
            product,
            quantity,
            subtotal: product.price * quantity
          });
        }
      }
      
      this.commit('UPDATE_CART_TOTAL');
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    UPDATE_CART_ITEM_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.items.find(item => item.product._id === productId);
      if (item && quantity <= item.product.stock && quantity > 0) {
        item.quantity = quantity;
        item.subtotal = item.product.price * quantity;
        this.commit('UPDATE_CART_TOTAL');
        localStorage.setItem('cart', JSON.stringify(state.cart));
      }
    },
    REMOVE_FROM_CART(state, productId) {
      state.cart.items = state.cart.items.filter(item => item.product._id !== productId);
      this.commit('UPDATE_CART_TOTAL');
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    UPDATE_CART_TOTAL(state) {
      state.cart.total = state.cart.items.reduce((total, item) => total + item.subtotal, 0);
    },
    CLEAR_CART(state) {
      state.cart = {
        items: [],
        total: 0
      };
      localStorage.removeItem('cart');
    },
    INIT_CART_FROM_STORAGE(state) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        state.cart = JSON.parse(savedCart);
      }
    }
  },
  actions: {
    initializeAuth({ commit }) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        commit('SET_USER', JSON.parse(user));
      } else {
        commit('SET_USER', null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    initializeCart({ commit }) {
      commit('INIT_CART_FROM_STORAGE');
    },
    addToCart({ commit, state }, { product, quantity }) {
      if (!state.isAuthenticated) {
        throw new Error('Debe iniciar sesión para agregar productos al carrito');
      }
      commit('ADD_TO_CART', { product, quantity });
    },
    updateCartItemQuantity({ commit }, { productId, quantity }) {
      commit('UPDATE_CART_ITEM_QUANTITY', { productId, quantity });
    },
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
    },
    clearCart({ commit }) {
      commit('CLEAR_CART');
    },
    async login({ commit }, credentials) {
      try {
        commit('CLEAR_ERROR');
        commit('SET_LOADING', true);
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          // Configurar el token en el header para futuras peticiones
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          commit('SET_USER', user);
        } else {
          throw new Error(response.data.message || 'Error al iniciar sesión');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
        commit('SET_ERROR', errorMessage);
        commit('SET_API_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async register({ commit }, userData) {
      try {
        commit('CLEAR_ERROR');
        commit('SET_LOADING', true);
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          // Configurar el token en el header para futuras peticiones
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          commit('SET_USER', user);
        } else {
          throw new Error(response.data.message || 'Error al registrar usuario');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al registrar usuario';
        commit('SET_ERROR', errorMessage);
        commit('SET_API_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchProducts({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await productsApi.get('/products');
        commit('SET_PRODUCTS', response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al cargar los productos';
        commit('SET_ERROR', errorMessage);
        commit('SET_API_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchProduct({ commit }, id) {
      try {
        commit('CLEAR_ERROR');
        commit('SET_LOADING', true);
        const response = await productsApi.get(`/products/${id}`);
        
        if (!response.data) {
          throw new Error('Producto no encontrado');
        }

        return response.data;
      } catch (error) {
        const errorMessage = error.response?.status === 404 
          ? 'Producto no encontrado'
          : error.response?.data?.message || 'Error al obtener el producto';
        commit('SET_ERROR', errorMessage);
        commit('SET_API_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    logout({ commit }) {
      // Limpiar headers de autenticación
      delete api.defaults.headers.common['Authorization'];
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Limpiar state
      commit('SET_USER', null);
      commit('CLEAR_CART');
      commit('CLEAR_ERROR');
    },
    clearErrors({ commit }) {
      commit('CLEAR_ERROR');
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    products: state => state.products,
    cart: state => state.cart,
    loading: state => state.loading,
    error: state => state.error,
    hasProducts: state => {
      return state.products?.data && Array.isArray(state.products.data) && state.products.data.length > 0;
    },
    lastApiError: state => state.lastApiError,
    // Getter para la lista de productos (información básica)
    getListProductData: () => product => {
      if (!product) return null;
      return {
        _id: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        category: product.category
      };
    },
    // Getter para detalles completos del producto
    getFullProductData: () => product => {
      if (!product) return null;
      return {
        _id: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    },
    cartItemCount: state => {
      return state.cart.items.reduce((count, item) => count + item.quantity, 0);
    },
    cartTotal: state => {
      return state.cart.total;
    },
    cartItems: state => {
      return state.cart.items;
    },
    isProductInCart: state => productId => {
      return state.cart.items.some(item => item.product._id === productId);
    },
    getCartItemQuantity: state => productId => {
      const item = state.cart.items.find(item => item.product._id === productId);
      return item ? item.quantity : 0;
    }
  }
}); 