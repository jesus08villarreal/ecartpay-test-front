<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-4 rounded-lg">
          <!-- Header -->
          <v-card-title class="text-center pa-4 bg-primary">
            <h2 class="text-h4 font-weight-bold text-white mb-2">
              Crear Cuenta
            </h2>
            <p class="text-body-1 text-white mb-0">
              Regístrate para comenzar a comprar
            </p>
          </v-card-title>

          <!-- Formulario -->
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleSubmit" ref="form">
              <!-- Email -->
              <v-text-field
                v-model="formData.email"
                label="Correo electrónico"
                type="email"
                :rules="[rules.required, rules.email]"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <!-- Password -->
              <v-text-field
                v-model="formData.password"
                label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                :rules="[rules.required, rules.password]"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <!-- Confirm Password -->
              <v-text-field
                v-model="formData.confirmPassword"
                label="Confirmar contraseña"
                :type="showPassword ? 'text' : 'password'"
                :rules="[rules.required, rules.confirmPassword]"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
                class="mb-6"
              ></v-text-field>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="clearErrors"
              >
                {{ error }}
              </v-alert>

              <!-- Submit Button -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
              >
                Registrarse
              </v-btn>
            </v-form>
          </v-card-text>

          <!-- Footer -->
          <v-card-text class="text-center pa-4 bg-grey-lighten-4">
            ¿Ya tienes una cuenta?
            <router-link to="/login" class="text-primary font-weight-medium">
              Iniciar Sesión
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'RegisterView',
  data() {
    return {
      formData: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      rules: {
        required: v => !!v || 'Este campo es requerido',
        email: v => /.+@.+\..+/.test(v) || 'Ingresa un correo electrónico válido',
        password: v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
        confirmPassword: v => v === this.formData.password || 'Las contraseñas no coinciden'
      }
    };
  },
  computed: {
    ...mapState(['loading', 'error'])
  },
  methods: {
    ...mapActions(['register', 'clearErrors']),
    async handleSubmit() {
      try {
        const isValid = await this.$refs.form.validate();
        if (!isValid) return;

        await this.register({
          email: this.formData.email,
          password: this.formData.password
        });

        // Redirigir al login después del registro exitoso
        this.$router.push({
          path: '/login',
          query: { registered: 'true' }
        });
      } catch (error) {
        // El error se maneja en el store
      }
    }
  }
};
</script>

<style scoped>
.v-card-title {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.v-card-text:last-child {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style> 