<template>
  <v-form ref="form">
    <v-card-text>
      <h3 class="text-h6 mb-4">Calcular Envío</h3>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.postalCode"
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
            v-model="formData.state"
            label="Estado*"
            readonly
            hint="Se obtiene automáticamente del código postal"
            persistent-hint
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.city"
            label="Ciudad/Municipio*"
            readonly
            hint="Se obtiene automáticamente del código postal"
            persistent-hint
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="formData.district"
            :items="addressInfo?.suburbs || []"
            label="Colonia*"
            :disabled="!addressInfo?.suburbs?.length"
            :loading="loading"
            hint="Selecciona tu colonia de la lista"
            persistent-hint
            :error-messages="!addressInfo?.suburbs?.length && formData.postalCode ? ['Ingresa un código postal válido'] : []"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Cotización -->
    <v-card-text v-if="shippingQuotes.length">
      <h3 class="text-h6 mb-4">Opciones de Envío</h3>
      <v-radio-group v-model="selectedQuote">
        <v-radio
          v-for="quote in shippingQuotes"
          :key="quote.rateId"
          :value="quote"
        >
          <template v-slot:label>
            <div>
              <strong>{{ quote.carrier.toUpperCase() }} - {{ quote.description }}</strong>
              <div class="text-subtitle-2">
                Entrega estimada: {{ quote.deliveryEstimate }}
              </div>
              <div class="text-subtitle-2">
                ${{ quote.amount.toFixed(2) }} {{ quote.currency }}
              </div>
            </div>
          </template>
        </v-radio>
      </v-radio-group>
    </v-card-text>

    <!-- Botones de acción -->
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="error"
        variant="text"
        @click="handleClose"
        :disabled="loading"
      >
        Cerrar
      </v-btn>
      <v-btn
        color="primary"
        @click="handleClose"
        :loading="loading"
        :disabled="loading"
      >
        Enterado
      </v-btn>
    </v-card-actions>

    <!-- Alerta de error -->
    <v-alert
      v-if="error"
      type="error"
      class="ma-3"
      closable
    >
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script>
import { calculateShipping, validateAddress } from '@/services/enviaService';

export default {
  name: 'ShippingForm',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  data() {
    return {
      formData: {
        postalCode: '',
        state: '',
        stateCode: '',
        city: '',
        district: ''
      },
      loading: false,
      error: null,
      shippingQuotes: [],
      selectedQuote: null,
      addressInfo: null
    };
  },
  methods: {
    handleClose() {
      this.formData = {
        postalCode: '',
        state: '',
        stateCode: '',
        city: '',
        district: ''
      };
      this.shippingQuotes = [];
      this.selectedQuote = null;
      this.addressInfo = null;
      this.error = null;
      
      this.$emit('close');
    },
    async handlePostalCodeChange() {
      if (!/^\d{5}$/.test(this.formData.postalCode)) {
        this.addressInfo = null;
        this.shippingQuotes = [];
        this.selectedQuote = null;
        this.formData.state = '';
        this.formData.city = '';
        this.formData.district = '';
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        // Calcular tarifas de envío
        const response = await calculateShipping({
          postalCode: this.formData.postalCode,
          products: [{ product: this.product, quantity: 1 }]
        });

        if (response.success) {
          this.shippingQuotes = response.rates;
          
          // Guardar la información completa de la dirección
          const addressInfo = await validateAddress({
            postalCode: this.formData.postalCode
          });

          if (addressInfo.success) {
            this.addressInfo = addressInfo.data;
            
            // Actualizar campos de la dirección
            this.formData.state = this.addressInfo.state.name;
            this.formData.stateCode = this.addressInfo.state.code['2digit'];
            this.formData.city = this.addressInfo.regions.region_2 || this.addressInfo.locality || '';
            
            // Limpiar la colonia seleccionada para que el usuario elija de la lista nueva
            this.formData.district = '';
          }
        }
      } catch (error) {
        this.error = error.message || 'Error al obtener información del código postal';
        this.shippingQuotes = [];
        this.selectedQuote = null;
        this.addressInfo = null;
      } finally {
        this.loading = false;
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
</style> 