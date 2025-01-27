<template>
  <v-card
    class="product-card d-flex flex-column"
    :elevation="2"
  >
    <!-- Imagen del Producto -->
    <div class="product-image-container">
      <v-img
        :src="product.imageUrl"
        height="250"
        cover
        class="align-end"
      >
        <div class="image-overlay d-flex flex-column justify-end">
          <v-card-title class="text-white pa-4 text-truncate">
            {{ product.name }}
          </v-card-title>
        </div>
      </v-img>
    </div>

    <!-- Contenido -->
    <v-card-text class="product-content flex-grow-1 d-flex flex-column">
      <!-- Precio -->
      <div class="text-h6 font-weight-bold primary--text mb-2">
        {{ formatPrice(product.price) }}
      </div>

      <!-- Categoría -->
      <div class="mt-auto">
        <v-chip
          color="primary"
          label
          size="small"
          variant="flat"
          class="mb-2"
        >
          <template v-slot:prepend>
            <v-icon start icon="mdi-cube-outline" size="x-small"></v-icon>
          </template>
          {{ product.category }}
        </v-chip>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Acciones -->
    <v-card-actions class="pa-4">
      <v-row no-gutters>
        <v-col :cols="isAuthenticated ? 8 : 12">
          <v-btn
            block
            color="primary"
            variant="flat"
            :to="{ name: 'ProductDetail', params: { id: product._id }}"
          >
            Ver Detalles
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
        <v-col v-if="isAuthenticated" cols="4" class="pl-2">
          <v-btn
            block
            color="success"
            variant="flat"
            @click="handleAddToCart"
            :loading="loading"
            :disabled="loading || product.stock <= 0"
          >
            <v-icon>mdi-cart-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>

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
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      showMessage: false,
      message: {
        text: '',
        color: 'success'
      }
    };
  },
  computed: {
    ...mapState(['isAuthenticated'])
  },
  methods: {
    ...mapActions(['addToCart']),
    formatPrice(price) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    },
    async handleAddToCart() {
      if (this.product.stock <= 0) {
        this.message = {
          text: 'Producto sin stock disponible',
          color: 'error'
        };
        this.showMessage = true;
        return;
      }

      this.loading = true;
      try {
        await this.addToCart({
          product: this.product,
          quantity: 1
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
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.product-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.product-image-container {
  position: relative;
  overflow: hidden;
}

.image-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0) 100%
  );
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 30%;
}

.product-content {
  padding: 20px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  height: 48px;
}

.v-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.v-chip {
  font-size: 0.875rem;
}

.pl-2 {
  padding-left: 8px;
}
</style> 