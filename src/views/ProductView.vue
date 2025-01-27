<template>
  <v-container class="py-8">
    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" md="6">
        <v-skeleton-loader type="image" height="400"></v-skeleton-loader>
      </v-col>
      <v-col cols="12" md="6">
        <v-skeleton-loader type="article" height="400"></v-skeleton-loader>
      </v-col>
    </v-row>

    <!-- Product Details -->
    <template v-else-if="product">
      <v-row>
        <!-- Imagen del Producto -->
        <v-col cols="12" md="6">
          <v-img
            :src="product.imageUrl || '/placeholder-image.png'"
            height="500"
            :aspect-ratio="1"
            cover
            class="rounded-lg bg-grey-lighten-2"
            :lazy-src="'/placeholder-image.png'"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  :size="70"
                  :width="7"
                  color="primary"
                  indeterminate
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-col>

        <!-- Detalles del Producto -->
        <v-col cols="12" md="6">
          <div class="d-flex flex-column h-100">
            <!-- Encabezado -->
            <div class="mb-6">
              <h1 class="text-h3 font-weight-bold mb-2">{{ product.name }}</h1>
              <v-chip
                color="primary"
                label
                class="mb-4"
              >
                <v-icon start>mdi-cube-outline</v-icon>
                {{ product.category }}
              </v-chip>
            </div>

            <v-divider class="mb-6"></v-divider>

            <!-- Precio y Stock -->
            <div class="mb-6">
              <div class="text-h4 primary--text font-weight-bold mb-2">
                {{ formatPrice(product.price) }}
              </div>
              <v-chip
                :color="product.stock > 0 ? 'success' : 'error'"
                label
              >
                <v-icon start>{{ product.stock > 0 ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
                {{ formatStock(product.stock) }}
              </v-chip>
            </div>

            <!-- Descripción -->
            <div class="mb-6">
              <h3 class="text-h6 font-weight-bold mb-2">Descripción</h3>
              <p class="text-body-1">{{ product.description }}</p>
            </div>

            <!-- Detalles Adicionales -->
            <v-list class="mb-6 bg-grey-lighten-4 rounded-lg">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">Fecha de creación</v-list-item-title>
                <v-list-item-subtitle class="mt-1">
                  {{ formatDate(product.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider class="mx-4"></v-divider>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary" class="mr-2">mdi-update</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">Última actualización</v-list-item-title>
                <v-list-item-subtitle class="mt-1">
                  {{ formatDate(product.updatedAt) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <!-- Acciones -->
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                size="x-large"
                block
                @click="handleAddToCart"
                :disabled="!isAuthenticated || product.stock <= 0"
                class="flex-grow-1"
              >
                <v-icon start>mdi-cart-plus</v-icon>
                {{ getAddToCartButtonText }}
              </v-btn>

              <v-btn
                color="primary"
                size="x-large"
                variant="outlined"
                @click="showShippingForm = true"
                :disabled="product.stock <= 0"
              >
                <v-icon>mdi-truck-delivery</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Diálogo del formulario de envío -->
      <v-dialog v-model="showShippingForm" max-width="600px">
        <v-card>
          <v-toolbar color="primary" title="Información de Envío">
            <v-btn icon @click="showShippingForm = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class="pa-6">
            <shipping-form
              :product="product"
              @close="handleShippingClose"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
    >
      <template v-slot:prepend>
        <v-icon size="28">mdi-alert-circle</v-icon>
      </template>
      {{ error }}
    </v-alert>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="showMessage"
      :color="message.color"
      :timeout="3000"
      location="top"
    >
      {{ message.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showMessage = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import ShippingForm from '@/components/shipping/ShippingForm.vue';

export default {
  name: 'ProductView',
  components: {
    ShippingForm
  },
  data() {
    return {
      product: null,
      showShippingForm: false,
      quantity: 1,
      showMessage: false,
      message: {
        text: '',
        color: 'success'
      }
    };
  },
  computed: {
    ...mapState(['loading', 'error', 'isAuthenticated']),
    ...mapGetters(['getFullProductData', 'isProductInCart', 'getCartItemQuantity']),
    getAddToCartButtonText() {
      if (!this.isAuthenticated) {
        return 'Inicia sesión para comprar';
      }
      if (this.product.stock <= 0) {
        return 'Producto sin stock';
      }
      if (this.isProductInCart(this.product._id)) {
        return 'Actualizar Carrito';
      }
      return 'Agregar al Carrito';
    }
  },
  methods: {
    ...mapActions(['updateCartItemQuantity', 'addToCart']),
    async fetchProduct() {
      try {
        const response = await this.$store.dispatch('fetchProduct', this.$route.params.id);
        if (response.data) {
          this.product = {
            ...this.getFullProductData(response.data),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
          };
          // Actualizar el título con el nombre del producto
          document.title = `${this.product.name} - EcartPay`;
        }
      } catch (error) {
        // El error se maneja en el store
      }
    },
    async handleAddToCart() {
      try {
        await this.addToCart({
          product: this.product,
          quantity: this.quantity
        });
        this.message = {
          text: 'Producto agregado al carrito',
          color: 'success'
        };
        this.showMessage = true;
      } catch (error) {
        this.message = {
          text: error.message || 'Error al agregar al carrito',
          color: 'error'
        };
        this.showMessage = true;
      }
    },
    handleShippingClose() {
      this.showShippingForm = false;
    },
    formatPrice(price) {
      if (!price && price !== 0) return 'N/A';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    },
    formatStock(stock) {
      if (!stock && stock !== 0) return 'Sin stock';
      return stock === 1 ? '1 unidad disponible' : `${stock.toLocaleString('es-MX')} unidades disponibles`;
    },
    formatDate(date) {
      if (!date) return 'Fecha no disponible';
      try {
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        };
        return new Date(date).toLocaleString('es-MX', options);
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Fecha no válida';
      }
    }
  },
  created() {
    this.fetchProduct();
  }
};
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.v-list {
  background-color: rgba(0, 0, 0, 0.03) !important;
}

.v-list-item {
  min-height: 64px;
}
</style> 