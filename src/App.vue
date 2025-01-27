<template>
  <v-app>
    <v-app-bar
      color="primary"
      elevation="2"
    >
      <v-app-bar-title class="font-weight-bold">
        <router-link to="/" class="text-white text-decoration-none">
          <v-icon icon="mdi-store" class="mr-2" />
          EcartPay
        </router-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <template v-if="isAuthenticated">
        <v-btn
          icon
          class="mr-2"
          @click="showCart = true"
        >
          <v-badge
            :content="cartItemCount"
            :model-value="cartItemCount > 0"
            color="error"
          >
            <v-icon>mdi-cart</v-icon>
          </v-badge>
        </v-btn>

        <v-menu location="bottom end" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              class="text-none"
              variant="text"
              v-bind="props"
            >
              <v-icon start>mdi-account-circle</v-icon>
              {{ user?.email }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list width="200">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-email</v-icon>
              </template>
              <v-list-item-title class="text-caption text-medium-emphasis">
                {{ user?.email }}
              </v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item
              @click="handleLogout"
              color="error"
            >
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>Cerrar Sesión</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <v-btn
        v-else
        to="/login"
        variant="text"
        class="text-white"
      >
        <v-icon start>mdi-login</v-icon>
        Iniciar Sesión
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>

    <cart-drawer
      v-model="showCart"
    />

    <v-footer
      class="bg-primary text-center d-flex flex-column"
    >
      <div class="text-white">
        {{ new Date().getFullYear() }} — <strong>EcartPay Store</strong>
      </div>
      <div class="text-white text-caption mt-1">
        Todos los derechos reservados
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import CartDrawer from '@/components/cart/CartDrawer.vue';

export default {
  name: 'App',
  components: {
    CartDrawer
  },
  data() {
    return {
      showCart: false
    };
  },
  computed: {
    ...mapState(['isAuthenticated', 'user']),
    ...mapGetters(['cartItemCount'])
  },
  methods: {
    ...mapActions(['logout', 'initializeCart', 'initializeAuth']),
    handleLogout() {
      this.logout();
      this.$router.push('/login');
    }
  },
  created() {
    this.initializeAuth();
    this.initializeCart();
  }
};
</script>

<style>
:root {
  --primary-color: #1976D2;
  --secondary-color: #2E7D32;
}

.v-application {
  font-family: 'Roboto', sans-serif !important;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-btn {
  text-transform: none !important;
  letter-spacing: 0.5px !important;
}

.text-decoration-none {
  text-decoration: none;
}

.text-none {
  text-transform: none !important;
}
</style>
