<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-4 rounded-lg">
          <!-- Header -->
          <v-card-title class="text-center pa-4 bg-primary">
            <h2 class="text-h4 font-weight-bold text-white mb-2">
              Iniciar Sesión
            </h2>
            <p class="text-body-1 text-white mb-0">
              Ingresa a tu cuenta para comprar
            </p>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="credentials.email"
                label="Correo electrónico"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                :rules="[rules.required, rules.email]"
                class="mb-4"
                required
              ></v-text-field>

              <v-text-field
                v-model="credentials.password"
                label="Contraseña"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :rules="[rules.required]"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                class="mb-6"
                required
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

              <!-- Success Alert -->
              <v-alert
                v-if="showRegisteredMessage"
                type="success"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="showRegisteredMessage = false"
              >
                ¡Registro exitoso! Por favor, inicia sesión con tus credenciales.
              </v-alert>

              <!-- Login Button -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-4"
              >
                Iniciar Sesión
              </v-btn>

              <!-- Register Button -->
              <v-btn
                to="/register"
                color="primary"
                variant="outlined"
                size="large"
                block
              >
                Crear una cuenta
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'LoginView',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      showPassword: false,
      showRegisteredMessage: false,
      rules: {
        required: v => !!v || 'Este campo es requerido',
        email: v => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido'
      }
    };
  },
  computed: {
    ...mapState(['loading', 'error'])
  },
  methods: {
    ...mapActions(['login', 'clearErrors']),
    async handleLogin() {
      if (!this.$refs.form.validate()) return;
      
      try {
        await this.login(this.credentials);
        const redirect = this.$route.query.redirect || '/';
        this.$router.push(redirect);
      } catch (error) {
        // El error ya se maneja en el store
      }
    },
    created() {
      // Mostrar mensaje si viene de registro exitoso
      this.showRegisteredMessage = this.$route.query.registered === 'true';
    }
  }
};
</script> 