<template>
  <v-container class="pa-0">
    <!-- Grid de Productos -->
    <v-row v-if="products && products.length" justify="center" align="stretch">
      <v-col
        v-for="product in products"
        :key="product._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex align-stretch"
      >
        <product-card
          :product="product"
          @view-details="$emit('view-details', product._id)"
          class="w-100"
        />
      </v-col>
    </v-row>

    <!-- Loading Skeleton -->
    <v-row v-if="loading" justify="center" align="stretch">
      <v-col
        v-for="n in 8"
        :key="n"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <v-card class="w-100" height="400">
          <v-skeleton-loader
            type="image, article, actions"
            height="100%"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- No Products Message -->
    <v-row v-if="!loading && (!products || products.length === 0)" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-card class="pa-6" variant="outlined">
          <v-icon
            icon="mdi-package-variant"
            size="64"
            color="grey-lighten-1"
            class="mb-4"
          ></v-icon>
          <h3 class="text-h5 mb-2">No hay productos disponibles</h3>
          <p class="text-body-1 text-medium-emphasis">
            En este momento no hay productos para mostrar.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ProductCard from './ProductCard.vue'

export default {
  name: 'ProductList',
  components: {
    ProductCard
  },
  props: {
    products: {
      type: Array,
      required: true,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view-details']
}
</script>

<style scoped>
.v-row {
  margin: 0 -12px;
}

.v-col {
  padding: 12px;
}

.w-100 {
  width: 100%;
}
</style> 