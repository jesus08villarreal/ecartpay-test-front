<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background"></div>
      <v-container>
        <v-row justify="center" align="center" class="text-center py-16">
          <v-col cols="12" md="8">
            <div class="hero-content">
              <v-icon
                icon="mdi-store"
                size="64"
                color="white"
                class="mb-6 hero-icon"
              ></v-icon>
              <h1 class="text-h2 font-weight-bold mb-6 hero-title">
                Nuestros Productos
              </h1>
              <p class="text-h6 hero-subtitle mb-8">
                Explora nuestra selección de productos de alta calidad
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <v-container class="main-content py-8">
      <!-- Search Section -->
      <v-row v-if="hasProducts" justify="center" class="mb-8">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card
            elevation="0"
            class="search-card pa-2"
            color="white"
          >
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar productos"
              variant="solo"
              density="comfortable"
              hide-details
              clearable
              @input="filterProducts"
              class="search-field"
            ></v-text-field>
          </v-card>
        </v-col>
      </v-row>

      <!-- Error Alert -->
      <v-row v-if="error" justify="center" class="mb-8">
        <v-col cols="12" sm="10" md="8">
          <v-alert
            type="error"
            variant="tonal"
            closable
            elevation="2"
            @click:close="clearErrors"
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-alert-circle" size="28"></v-icon>
            </template>
            <div class="d-flex flex-column">
              <span class="text-subtitle-1 font-weight-medium">{{ error }}</span>
              <template v-if="lastApiError && lastApiError.code !== 404">
                <v-btn
                  color="error"
                  variant="text"
                  class="mt-2 px-0"
                  prepend-icon="mdi-refresh"
                  @click="retryFetch"
                >
                  Reintentar
                </v-btn>
              </template>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- No Products Message -->
      <v-row v-if="!loading && !error && !hasProducts" justify="center" class="mb-8">
        <v-col cols="12" sm="10" md="8">
          <v-alert
            type="info"
            variant="tonal"
            elevation="2"
            class="d-flex align-center"
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-information" size="28"></v-icon>
            </template>
            <div class="d-flex align-center justify-space-between flex-grow-1">
              <span class="text-subtitle-1 font-weight-medium">
                No hay productos disponibles en este momento.
              </span>
              <v-btn
                color="info"
                variant="text"
                prepend-icon="mdi-refresh"
                @click="retryFetch"
              >
                Actualizar
              </v-btn>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Products Grid -->
      <v-row v-if="!error">
        <v-col cols="12">
          <product-list
            :products="displayProducts"
            :loading="loading"
            @view-details="navigateToProduct"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Login Prompt -->
    <v-snackbar
      v-model="showLoginPrompt"
      color="primary"
      timeout="5000"
      location="top"
      elevation="4"
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-login" class="mr-3"></v-icon>
        <span class="text-subtitle-1">Inicia sesión para poder comprar productos</span>
      </div>
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="$router.push('/login')"
        >
          Iniciar Sesión
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Retry Dialog -->
    <v-dialog v-model="showRetryDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-error text-white">
          <v-icon icon="mdi-wifi-off" class="mr-2"></v-icon>
          Error de Conexión
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1">
            No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.
          </p>
          <v-alert
            type="warning"
            variant="tonal"
            class="mt-4"
            density="comfortable"
          >
            <div class="d-flex align-center">
              <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
              <span>Intentos realizados: {{ retryCount }}/3</span>
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-refresh"
            @click="retryFetch"
            :loading="loading"
            :disabled="retryCount >= 3"
          >
            Reintentar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import ProductList from '@/components/products/ProductList.vue';

export default {
  name: 'HomePage',
  components: {
    ProductList
  },
  data() {
    return {
      searchQuery: '',
      showLoginPrompt: false,
      filteredProducts: {
        success: true,
        data: []
      },
      showRetryDialog: false,
      retryCount: 0
    };
  },
  computed: {
    ...mapState(['products', 'loading', 'error', 'isAuthenticated', 'lastApiError']),
    ...mapGetters(['hasProducts', 'getListProductData']),
    displayProducts() {
      const source = this.searchQuery ? this.filteredProducts : this.products;
      return source?.data || [];
    }
  },
  methods: {
    ...mapActions(['fetchProducts', 'clearErrors']),
    
    filterProducts() {
      if (!this.searchQuery) {
        this.filteredProducts = { ...this.products };
        this.clearErrors();
        return;
      }
      
      const query = this.searchQuery.toLowerCase();
      const productsArray = this.products?.data || [];
      
      const filteredData = productsArray
        .filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        )
        .map(this.getListProductData)
        .filter(Boolean);

      this.filteredProducts = {
        success: true,
        data: filteredData
      };

      if (filteredData.length === 0) {
        this.error = 'No se encontraron productos que coincidan con tu búsqueda';
      } else {
        this.clearErrors();
      }
    },
    
    navigateToProduct(productId) {
      if (!this.isAuthenticated) {
        this.showLoginPrompt = true;
      } else {
        this.$router.push({ name: 'ProductDetail', params: { id: productId }});
      }
    },

    async retryFetch() {
      this.retryCount++;
      try {
        await this.fetchProducts();
        this.showRetryDialog = false;
        this.retryCount = 0;
        this.filterProducts();
      } catch (error) {
        if (this.retryCount >= 3) {
          this.showRetryDialog = true;
        }
      }
    }
  },
  async created() {
    try {
      await this.fetchProducts();
      this.filterProducts();
    } catch (error) {
      if (error.message === 'Network Error') {
        this.showRetryDialog = true;
      }
    }
  },
  watch: {
    products: {
      handler() {
        this.filterProducts();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.home-page {
  background-color: #f5f5f5;
  min-height: 100%;
}

.hero-section {
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 500px;
  display: flex;
  align-items: center;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1976D2 0%, #64B5F6 50%, #2196F3 100%);
  z-index: 0;
}

.hero-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%),
              radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  height: 100px;
  background: #f5f5f5;
  transform: skewY(-3deg);
}

.hero-content {
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease-out;
}

.hero-icon {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  transform: scale(1);
  transition: transform 0.3s ease;
}

.hero-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.hero-title {
  font-size: 4rem !important;
  line-height: 1.2;
  text-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: linear-gradient(to right, #ffffff, #E3F2FD);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-weight: 300;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-button {
  transition: all 0.3s ease;
  border: 2px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.1) !important;
}

.hero-button:hover {
  background: rgba(255,255,255,0.2) !important;
  transform: translateY(-2px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-content {
  position: relative;
  z-index: 1;
}

.search-card {
  border-radius: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.search-field :deep(.v-field__input) {
  padding-inline-start: 12px !important;
}

.v-alert {
  border-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .hero-title {
    font-size: 2.5rem !important;
  }
  
  .hero-subtitle {
    font-size: 1.1rem !important;
  }
  
  .hero-section {
    min-height: 400px;
  }
}
</style> 