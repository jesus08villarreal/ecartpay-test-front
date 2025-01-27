import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Vuetify
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

// Estilos globales
import './styles/main.css'

loadFonts()

// Crear la aplicación
const app = createApp(App)

// Usar plugins
app.use(router)
app.use(store)
app.use(vuetify)

// Montar la aplicación
app.mount('#app')
