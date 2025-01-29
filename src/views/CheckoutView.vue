<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 mb-6">Checkout</h1>
        
        <!-- Resumen del Carrito -->
        <v-card class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            Resumen de la Orden
            </v-card-title>
            <v-card-text>
              <v-list>
              <template v-for="item in cartItems" :key="item.product._id">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar size="48" rounded>
                      <v-img :src="item.product.imageUrl" cover></v-img>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.product.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Cantidad: {{ item.quantity }} × {{ formatPrice(item.product.price) }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <div class="text-right">
                      <div class="text-body-1 font-weight-bold">
                        {{ formatPrice(item.subtotal) }}
                      </div>
                    </div>
                  </template>
                </v-list-item>
                <v-divider v-if="cartItems.indexOf(item) < cartItems.length - 1"></v-divider>
                  </template>
              </v-list>
            <v-divider class="my-4"></v-divider>
            <div class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Subtotal</span>
              <span class="text-subtitle-1">{{ formatPrice(cartTotal) }}</span>
            </div>
            <div v-if="shippingCost" class="d-flex justify-space-between align-center mt-2">
              <span class="text-subtitle-1">Costo de Envío</span>
              <span class="text-subtitle-1">{{ formatPrice(shippingCost) }}</span>
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6">Total</span>
              <span class="text-h6 primary--text">{{ formatPrice(total) }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Cálculo de Envío -->
        <v-card class="mb-6">
          <v-card-title class="bg-grey-lighten-4">
            Información de Envío
          </v-card-title>
          <v-card-text>
            <v-form ref="shippingForm" v-model="isFormValid">
              <!-- Datos de Contacto -->
              <v-card-subtitle class="px-0">Datos de Contacto</v-card-subtitle>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="shippingData.name"
                    label="Nombre completo*"
                    :rules="[v => !!v || 'El nombre es requerido']"
                    hint="Nombre de quien recibirá el paquete"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="shippingData.phone"
                    label="Teléfono*"
                    :rules="[
                      v => !!v || 'El teléfono es requerido',
                      v => /^\d{10}$/.test(v) || 'Debe ser un número de 10 dígitos'
                    ]"
                    hint="Teléfono de contacto para la entrega"
                    persistent-hint
                    maxlength="10"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="shippingData.email"
                    label="Correo electrónico*"
                    :rules="[
                      v => !!v || 'El correo es requerido',
                      v => /.+@.+\..+/.test(v) || 'Debe ser un correo válido'
                    ]"
                    hint="Para notificaciones de envío"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Dirección de Envío -->
              <v-card-subtitle class="px-0 mt-4">Dirección de Envío</v-card-subtitle>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="shippingData.postalCode"
                    label="Código Postal*"
                    :rules="[
                      v => !!v || 'El código postal es requerido',
                      v => /^\d{5}$/.test(v) || 'Debe ser un código postal válido'
                    ]"
                    @input="handlePostalCodeChange"
                    maxlength="5"
                    hint="Al ingresar el CP se autocompletarán algunos campos"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="shippingData.state"
                    label="Estado*"
                    :rules="[v => !!v || 'El estado es requerido']"
                    readonly
                    hint="Se obtiene automáticamente del código postal"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="shippingData.city"
                    label="Ciudad/Municipio*"
                    :rules="[v => !!v || 'La ciudad es requerida']"
                    readonly
                    hint="Se obtiene automáticamente del código postal"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="shippingData.district"
                    :items="addressInfo?.suburbs || []"
                    label="Colonia*"
                    :rules="[v => !!v || 'La colonia es requerida']"
                    :disabled="!addressInfo?.suburbs?.length"
                    :loading="loading"
                    hint="Selecciona tu colonia de la lista"
                    persistent-hint
                    :error-messages="!addressInfo?.suburbs?.length && shippingData.postalCode ? ['Ingresa un código postal válido'] : []"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="shippingData.street"
                    label="Calle*"
                    :rules="[v => !!v || 'La calle es requerida']"
                    hint="Nombre completo de la calle"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="shippingData.number"
                    label="Número exterior*"
                    :rules="[v => !!v || 'El número exterior es requerido']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="shippingData.interiorNumber"
                    label="Número interior"
                    hint="Si aplica"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="shippingData.reference"
                    label="Referencias"
                    hint="Color de casa, entre calles, puntos de referencia"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Opciones de Envío -->
        <v-card v-if="shippingRates.length > 0">
          <v-card-title>Opciones de Envío</v-card-title>
          <v-card-text>
            <v-radio-group v-model="selectedRate" :rules="[v => !!v || 'Selecciona un método de envío']">
              <v-radio
                v-for="rate in shippingRates"
                :key="rate.rateId"
                :value="rate"
              >
                <template v-slot:label>
                  <div>
                    <strong>{{ rate.carrier.toUpperCase() }} - {{ rate.description }}</strong>
                    <div class="text-subtitle-2">
                      Entrega estimada: {{ rate.deliveryEstimate }}
                    </div>
                    <div class="text-subtitle-2">
                      ${{ rate.amount.toFixed(2) }} {{ rate.currency }}
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Formulario de Pago -->
        <v-card>
          <v-card-title class="bg-grey-lighten-4">
            Información de Pago
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.cardNumber"
                    label="Número de Tarjeta*"
                    :rules="[v => !!v || 'El número de tarjeta es requerido']"
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    @update:model-value="formatCardNumber"
                    hint="Ingresa los 16 dígitos de tu tarjeta"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.expiryDate"
                    label="Fecha de Expiración*"
                    :rules="[v => !!v || 'La fecha de expiración es requerida']"
                    placeholder="MM/YY"
                    maxlength="5"
                    @update:model-value="formatExpiryDate"
                    hint="Mes/Año"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.cvv"
                    label="CVV*"
                    :rules="[
                      v => !!v || 'El CVV es requerido',
                      v => /^\d{3,4}$/.test(v) || 'CVV inválido'
                    ]"
                    placeholder="123"
                    maxlength="4"
                    type="password"
                    hint="3 o 4 dígitos en el reverso de tu tarjeta"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.cardHolder"
                    label="Nombre en la Tarjeta*"
                    :rules="[v => !!v || 'El nombre es requerido']"
                    placeholder="Como aparece en la tarjeta"
                    hint="Nombre completo como aparece en la tarjeta"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn
                color="primary"
                size="large"
                block
                type="submit"
                :loading="loading"
                :disabled="!valid || !selectedRate || loading"
              >
                Pagar {{ formatPricePlusDelivery(total, selectedRate) }}
                <v-icon end>mdi-credit-card</v-icon>
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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

    <!-- Diálogo de confirmación -->
    <v-dialog
      v-model="showConfirmationDialog"
      max-width="700px"
      persistent
    >
      <v-card>
        <v-card-title class="bg-primary text-white">
          ¡Envío Generado Exitosamente!
          <v-icon color="white" class="ml-2">mdi-check-circle</v-icon>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <h3 class="text-h6 mb-2">Detalles del Envío</h3>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-truck-delivery</v-icon>
                  </template>
                  <v-list-item-title>Paquetería</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ shipmentDetails?.carrier?.toUpperCase() }} - {{ shipmentDetails?.service }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-barcode</v-icon>
                  </template>
                  <v-list-item-title>Número de Rastreo</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ shipmentDetails?.trackingNumber }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title>Costo del Envío</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatPrice(shipmentDetails?.totalPrice) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ID del Envío</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ shipmentDetails?.shipmentId }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-4"></v-divider>

              <h3 class="text-h6 mb-2">Enlaces Importantes</h3>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-map-marker-path</v-icon>
                  </template>
                  <v-list-item-title>
                    <v-btn
                      color="primary"
                      variant="text"
                      :href="shipmentDetails?.trackUrl"
                      target="_blank"
                    >
                      Rastrear Envío
                      <v-icon end>mdi-open-in-new</v-icon>
                    </v-btn>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-file-pdf-box</v-icon>
                  </template>
                  <v-list-item-title>
                    <v-btn
                      color="primary"
                      variant="text"
                      :href="shipmentDetails?.label"
                      target="_blank"
                    >
                      Descargar Guía
                      <v-icon end>mdi-download</v-icon>
                    </v-btn>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="shipmentDetails?.additionalFiles?.length">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-file-multiple</v-icon>
                  </template>
                  <v-list-item-title class="d-flex flex-wrap gap-2">
                    <v-btn
                      v-for="(file, index) in shipmentDetails.additionalFiles"
                      :key="index"
                      color="primary"
                      variant="text"
                      :href="file"
                      target="_blank"
                    >
                      Archivo Adicional {{ index + 1 }}
                      <v-icon end>mdi-download</v-icon>
                    </v-btn>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="confirmAndContinue"
            :loading="loading"
          >
            Finalizar Compra
            <v-icon end>mdi-check</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { calculateShipping, createShipment, validateAddress } from '@/services/enviaService';

export default {
  name: 'CheckoutView',
  data() {
    return {
      valid: false,
      isFormValid: false,
      loading: false,
      calculatingShipping: false,
      showMessage: false,
      message: {
        text: '',
        color: 'success'
      },
      showConfirmationDialog: false,
      shipmentDetails: null,
      shippingError: null,
      shippingCost: 0,
      shippingRates: [],
      selectedRate: null,
      shippingData: {
        name: '',
        email: '',
        phone: '',
        street: '',
        number: '',
        interiorNumber: '',
        district: '',
        city: '',
        state: '',
        stateCode: '',
        postalCode: '',
        reference: '',
        company: ''
      },
      formData: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
      },
      addressInfo: null
    };
  },
  computed: {
    ...mapGetters(['cartItems', 'cartTotal']),
    total() {
      return this.cartTotal + this.shippingCost;
    }
  },
  methods: {
    ...mapActions(['clearCart', 'createOrder']),
    formatPricePlusDelivery(price, rate) {
        if (!rate) return this.formatPrice(price);
        return this.formatPrice(price + rate?.amount);
    },
    formatPrice(price) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    },
    formatDate(dateString) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('es-MX', options);
    },
    formatCardNumber(value) {
      if (!value) return '';
      const val = value.toString().replace(/\D/g, '');
      const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
      this.formData.cardNumber = formatted.substring(0, 19);
    },
    formatExpiryDate(value) {
      if (!value) return '';
      const val = value.toString().replace(/\D/g, '');
      if (val.length >= 2) {
        const month = val.substring(0, 2);
        const year = val.substring(2);
        this.formData.expiryDate = `${month}/${year}`.substring(0, 5);
      } else {
        this.formData.expiryDate = val;
      }
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
          this.addressInfo = result.addressInfo;

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
    async handlePostalCodeChange() {
      if (!/^\d{5}$/.test(this.shippingData.postalCode)) {
        this.addressInfo = null;
        this.shippingRates = [];
        this.selectedRate = null;
        this.shippingData.state = '';
        this.shippingData.city = '';
        this.shippingData.district = '';
        return;
      }

      try {
        this.loading = true;
        // Calcular tarifas de envío
        const response = await calculateShipping({
          postalCode: this.shippingData.postalCode,
          products: this.cartItems
        });

        if (response.success) {
          this.shippingRates = response.rates;
          
          // Guardar la información completa de la dirección
          const addressInfo = await validateAddress({
            postalCode: this.shippingData.postalCode
          });

          if (addressInfo.success) {
            this.addressInfo = addressInfo.data;
            
            // Actualizar campos de la dirección
            this.shippingData.state = this.addressInfo.state.name; // Nombre del estado para mostrar
            this.shippingData.stateCode = this.addressInfo.state.code['2digit']; // Código del estado para el API
            this.shippingData.city = this.addressInfo.regions.region_2 || this.addressInfo.locality || '';
            
            // Limpiar la colonia seleccionada para que el usuario elija de la lista nueva
            this.shippingData.district = '';
          }
        }
      } catch (error) {
        this.showMessage({
          text: error.message || 'Error al obtener información del código postal',
          color: 'error'
        });
        this.shippingRates = [];
        this.selectedRate = null;
        this.addressInfo = null;
      } finally {
        this.loading = false;
      }
    },
    async handleSubmit() {
      if (!this.$refs.form.validate() || !this.selectedRate) return;

      this.loading = true;
      try {
        // Primero creamos el envío
        const shipmentResult = await createShipment({
          products: this.cartItems,
          selectedRate: this.selectedRate,
          shippingData: this.shippingData,
        });

        if (!shipmentResult.success) {
          throw new Error('Error al generar el envío');
        }

        // Guardamos los detalles del envío y mostramos el diálogo
        
        this.shipmentDetails = shipmentResult.shipment;
        this.showConfirmationDialog = true;

        // Aquí iría la lógica de procesamiento del pago
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación
        
        this.message = {
          text: '¡Pago procesado exitosamente!',
          color: 'success'
        };
        this.showMessage = true;
      } catch (error) {
        this.message = {
          text: error.message || 'Error al procesar el pago',
          color: 'error'
        };
        this.showMessage = true;
      } finally {
        this.loading = false;
      }
    },
    async confirmAndContinue() {
      // Limpiar carrito y redirigir
      await this.clearCart();
      this.$router.push('/');
    }
  },
  created() {
    // Recuperar datos de envío si vienen del carrito
    if (this.$route.query) {
      const { shippingCost, postalCode, selectedRate, shippingRates, shippingAddress } = this.$route.query;
      
      if (shippingCost) {
        this.shippingCost = Number(shippingCost);
      }
      
      if (postalCode) {
        this.shippingData.postalCode = postalCode;
      }

      // Cargar información de la dirección si existe
      if (shippingAddress) {
        try {
          const address = JSON.parse(shippingAddress);
          this.shippingData = {
            ...this.shippingData,
            state: address.state,
            stateCode: address.stateCode,
            city: address.city,
            district: address.district
          };
        } catch (error) {
          console.error('Error al parsear la información de la dirección:', error);
        }
      }
      
      if (shippingRates) {
        try {
          this.shippingRates = JSON.parse(shippingRates);
        } catch (error) {
          console.error('Error al parsear las tarifas de envío:', error);
          this.shippingRates = [];
        }
      }
      
      if (selectedRate) {
        try {
          this.selectedRate = JSON.parse(selectedRate);
          // Asegurarnos que el costo de envío se actualice
          this.shippingCost = this.selectedRate.amount;
        } catch (error) {
          console.error('Error al parsear la tarifa seleccionada:', error);
          this.selectedRate = null;
          this.shippingCost = 0;
        }
      }

      // Si tenemos código postal pero no tenemos la información completa de la dirección
      if (postalCode && !shippingAddress) {
        this.handlePostalCodeChange();
      }
    }
  }
};
</script> 

<style scoped>
.v-card-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.v-list-item {
  padding: 16px;
}

.shipping-rates {
  margin-top: 16px;
}

.shipping-rate-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.shipping-rate-card:hover {
  border-color: var(--v-primary-base);
  cursor: pointer;
}

.shipping-rate-card.selected {
  background-color: rgb(var(--v-theme-primary) / 0.05);
}

.shipping-rates-group :deep(.v-selection-control) {
  margin-right: 8px;
}
</style> 