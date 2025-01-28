<template>
  <v-navigation-drawer
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    location="right"
    temporary
    width="400"
  >
    <v-card class="d-flex flex-column h-100">
      <!-- Header -->
      <v-toolbar color="primary" class="px-4">
        <v-toolbar-title class="text-white">
          <v-icon start>mdi-cart</v-icon>
          Carrito de Compras
        </v-toolbar-title>
        <template v-slot:append>
          <v-btn icon @click="$emit('update:modelValue', false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-toolbar>

      <!-- Content -->
      <v-card-text class="flex-grow-1 overflow-y-auto pa-0">
        <div v-if="loading" class="pa-4">
          <v-skeleton-loader
            v-for="n in 3"
            :key="n"
            type="list-item-avatar-two-line"
            class="mb-3"
          ></v-skeleton-loader>
        </div>

        <template v-else>
          <!-- Empty Cart -->
          <div v-if="!cartItems.length" class="pa-4 text-center">
            <v-icon
              icon="mdi-cart-off"
              size="64"
              color="grey-lighten-1"
              class="mb-4"
            ></v-icon>
            <h3 class="text-h6 mb-2">Tu carrito está vacío</h3>
            <p class="text-body-2 text-medium-emphasis">
              Agrega productos para comenzar tu compra
            </p>
          </div>

          <!-- Cart Items -->
          <v-list v-else class="pa-0">
            <template v-for="item in cartItems" :key="item.product._id">
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar rounded="lg" size="80" class="mr-4">
                    <v-img
                      :src="item.product.imageUrl"
                      :alt="item.product.name"
                      cover
                    ></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-subtitle-1 font-weight-medium mb-1">
                  {{ item.product.name }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  <div class="d-flex align-center justify-space-between mt-2">
                    <div class="quantity-controls">
                      <v-btn
                        density="comfortable"
                        icon="mdi-minus"
                        size="small"
                        variant="text"
                        @click="updateQuantity(item.product._id, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                      ></v-btn>
                      <span class="mx-2">{{ item.quantity }}</span>
                      <v-btn
                        density="comfortable"
                        icon="mdi-plus"
                        size="small"
                        variant="text"
                        @click="updateQuantity(item.product._id, item.quantity + 1)"
                        :disabled="item.quantity >= item.product.stock"
                      ></v-btn>
                    </div>
                    <div class="text-right">
                      <div class="text-body-2 text-medium-emphasis">
                        {{ formatPrice(item.product.price) }} c/u
                      </div>
                      <div class="text-subtitle-1 font-weight-bold primary--text">
                        {{ formatPrice(item.subtotal) }}
                      </div>
                    </div>
                  </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeItem(item.product._id)"
                  ></v-btn>
                </template>
              </v-list-item>
              <v-divider></v-divider>
            </template>
          </v-list>
        </template>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions v-if="cartItems.length" class="pa-4 bg-grey-lighten-4">
        <div class="w-100">
          <!-- Cálculo de Envío -->
          <v-expand-transition>
            <div v-if="showShippingCalc" class="mb-4">
              <v-form ref="shippingForm" v-model="shippingValid">
                <v-text-field
                  v-model="shippingData.postalCode"
                  label="Código Postal"
                  :rules="[v => !!v || 'Requerido', v => /^\d{5}$/.test(v) || 'Código postal inválido']"
                  placeholder="12345"
                  maxlength="5"
                  density="compact"
                  class="mb-2"
                  hide-details
                ></v-text-field>
                <v-btn
                  color="primary"
                  block
                  :loading="calculatingShipping"
                  :disabled="!shippingValid || calculatingShipping"
                  @click="calculateShipping"
                >
                  Calcular Costo de Envío
                  <v-icon end>mdi-truck-delivery</v-icon>
                </v-btn>
              </v-form>

              <!-- Tarifas de Envío -->
              <v-expand-transition>
                <div v-if="shippingRates.length" class="mt-4">
                  <div class="text-subtitle-1 mb-2">Opciones de Envío:</div>
                  <v-radio-group
                    v-model="selectedRate"
                    @update:modelValue="selectRate"
                    density="compact"
                  >
                    <v-radio
                      v-for="rate in shippingRates"
                      :key="rate.carrier + rate.service"
                      :value="rate"
                    >
                      <template v-slot:label>
                        <div>
                          <strong>{{ rate.carrier.toUpperCase() }} - {{ rate.description }}</strong>
                          <div class="text-subtitle-2">
                            Entrega estimada: {{ rate.deliveryEstimate }}
                          </div>
                          <div class="text-subtitle-2">
                            {{ formatPrice(rate.amount) }} {{ rate.currency }}
                          </div>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
              </v-expand-transition>
            </div>
          </v-expand-transition>

          <!-- Resumen -->
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-1">Subtotal</span>
            <span class="text-subtitle-1">{{ formatPrice(cartTotal) }}</span>
          </div>
          <div v-if="shippingCost" class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-1">
              Envío 
              <span v-if="selectedRate" class="text-caption">
                ({{ selectedRate.carrier.toUpperCase() }} - {{ selectedRate.service }})
              </span>
            </span>
            <span class="text-subtitle-1">{{ formatPrice(shippingCost) }}</span>
          </div>
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-h6">Total</span>
            <span class="text-h6 primary--text">{{ formatPrice(total) }}</span>
          </div>

          <!-- Botones -->
          <v-btn
            color="primary"
            variant="text"
            block
            class="mb-2"
            @click="showShippingCalc = !showShippingCalc"
          >
            {{ showShippingCalc ? 'Ocultar Cálculo de Envío' : 'Calcular Envío' }}
            <v-icon end>{{ showShippingCalc ? 'mdi-chevron-up' : 'mdi-truck-delivery' }}</v-icon>
          </v-btn>
          <v-btn
            color="success"
            block
            size="large"
            class="mb-2"
            @click="proceedToCheckout"
          >
            Proceder al Pago
            <v-icon end>mdi-cash-register</v-icon>
          </v-btn>
          <v-btn
            color="primary"
            block
            size="large"
            variant="outlined"
            @click="$emit('update:modelValue', false)"
          >
            Seguir Comprando
            <v-icon end>mdi-cart-outline</v-icon>
          </v-btn>
        </div>
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
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { calculateShipping } from '@/services/enviaService';

export default {
  name: 'CartDrawer',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showShippingCalc: false,
      shippingValid: false,
      calculatingShipping: false,
      shippingCost: 0,
      shippingRates: [],
      selectedRate: null,
      shippingData: {
        postalCode: ''
      },
      showMessage: false,
      message: {
        text: '',
        color: 'success'
      }
    };
  },
  computed: {
    ...mapState(['loading']),
    ...mapGetters(['cartItems', 'cartTotal']),
    total() {
      return this.cartTotal + this.shippingCost;
    }
  },
  methods: {
    ...mapActions(['updateCartItemQuantity', 'removeFromCart']),
    formatPrice(price) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    },
    updateQuantity(productId, quantity) {
      this.updateCartItemQuantity({ productId, quantity });
    },
    removeItem(productId) {
      this.removeFromCart(productId);
    },
    async calculateShipping() {
      if (!this.$refs.shippingForm.validate()) return;

      this.calculatingShipping = true;
      try {
        const result = await calculateShipping({
          postalCode: this.shippingData.postalCode,
          products: this.cartItems
        });

        if (result.success && result.rates.length > 0) {
          this.shippingRates = result.rates;
          this.selectedRate = result.rates[0]; // Seleccionamos la tarifa más económica por defecto
          this.shippingCost = this.selectedRate.amount;

          this.message = {
            text: 'Tarifas de envío calculadas exitosamente',
            color: 'success'
          };
        } else {
          throw new Error('No se encontraron tarifas disponibles');
        }
      } catch (error) {
        this.message = {
          text: error.message || 'Error al calcular el costo de envío',
          color: 'error'
        };
        this.shippingRates = [];
        this.selectedRate = null;
        this.shippingCost = 0;
      } finally {
        this.showMessage = true;
        this.calculatingShipping = false;
      }
    },
    selectRate(rate) {
      this.selectedRate = rate;
      this.shippingCost = rate.amount;
    },
    proceedToCheckout() {
      const route = {
        name: 'Checkout'
      };

      if (this.shippingRates.length > 0 && this.selectedRate) {
        route.query = {
          shippingCost: this.shippingCost.toString(),
          postalCode: this.shippingData.postalCode,
          selectedRate: JSON.stringify(this.selectedRate),
          shippingRates: JSON.stringify(this.shippingRates)
        };
      }

      this.$router.push(route);
      this.$emit('update:modelValue', false);
    }
  }
};
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.w-100 {
  width: 100%;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 2px;
}

.v-list-item {
  padding: 16px;
}

.v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.overflow-y-auto {
  overflow-y: auto;
}
</style> 