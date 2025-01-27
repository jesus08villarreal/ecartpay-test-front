import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',   // Azul principal
          secondary: '#2E7D32', // Verde secundario
          accent: '#82B1FF',    // Azul claro para acentos
          success: '#4CAF50',   // Verde para éxito
          info: '#2196F3',      // Azul para información
          warning: '#FB8C00',   // Naranja para advertencias
          error: '#FF5252',     // Rojo para errores
          background: '#F5F5F5' // Fondo gris claro
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VBtn: {
      variant: 'flat',
      height: 44,
      rounded: 'lg',
      fontWeight: 500
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VAlert: {
      variant: 'tonal',
      rounded: 'lg'
    }
  }
}); 