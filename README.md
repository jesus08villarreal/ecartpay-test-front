# EcartPay - test - Frontend

Frontend de la aplicación EcartPay, una plataforma de comercio electrónico desarrollada con Vue.js y Vuetify.

## Características

- 🛍️ Catálogo de productos
- 🛒 Carrito de compras
- 🚚 Integración con API de envíos
- 👤 Autenticación de usuarios
- 💳 Proceso de checkout
- �� Diseño responsive
- 🌐 Soporte multicarrier para envíos
- 🔒 Manejo seguro de datos sensibles
- 📱 Interfaz adaptativa con Vuetify 3

## Datos de Prueba Envia.com

Los siguientes datos están hardcodeados para las pruebas con la API de Envia.com:

### Dirección de Origen (Remitente)
```json
# Start of Selection
{
  "name": "Nombre de la Tienda",
  "company": "Nombre de la Empresa",
  "email": "correo@tienda.com",
  "phone": "1234567890",
  "street": "Calle Principal",
  "number": "123",
  "district": "",
  "city": "Monterrey",
  "state": "NL",
  "country": "MX",
  "postalCode": "64000",
  "reference": ""
}
```

### Configuración del Paquete
```json
### Estos datos estan hardcodeados para pruebas.
{
  "content": "Mercancía en general",
  "amount": 1,
  "type": "box",
  "weight": 1,
  "insurance": 0,
  "declaredValue": 0,
  "weightUnit": "kg",
  "lengthUnit": "cm",
  "dimensions": {
    "length": 30,
    "width": 30,
    "height": 30
  }
}
```

### Carriers Disponibles
- Estafeta
- FedEx
- DHL
- UPS
- Redpack

## Requisitos Previos

- Node.js (v18 o superior)
- NPM (v8 o superior)
- Vue CLI instalado globalmente (`npm install -g @vue/cli`)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/ecartpay-test-front.git
cd ecartpay-test-front
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env.development` para desarrollo
   - Actualiza las variables según tu entorno

## Scripts Disponibles

### Desarrollo
```bash
npm run serve
```
Inicia el servidor de desarrollo en `http://localhost:8080`

### Producción
```bash
npm run build
```
Genera los archivos de producción en la carpeta `dist`

### Linting
```bash
npm run lint
```
Ejecuta el linter y corrige errores automáticamente

## Variables de Entorno

Crea los archivos `.env.development` y `.env` según corresponda:

```env
VUE_APP_API_URL=http://localhost:5000/api/v1
VUE_APP_ENVIA_API_URL=https://api.envia.com
VUE_APP_ENVIA_TOKEN=8af188fb1b693a0f30ca40a2634208be6753d79e36e48bf5351cce83c324e9c0
VUE_APP_GEOCODES_API_URL=https://geocodes.envia.com
VUE_APP_PRODUCTS_API_KEY=RANDOM_API_KEY_123456

# Datos de la tienda
VUE_APP_STORE_NAME=Nombre de la Tienda
VUE_APP_STORE_COMPANY=Nombre de la Empresa
VUE_APP_STORE_EMAIL=correo@tienda.com
VUE_APP_STORE_PHONE=1234567890
VUE_APP_STORE_STREET=Calle Principal
VUE_APP_STORE_NUMBER=123
VUE_APP_STORE_POSTAL_CODE=64000
VUE_APP_STORE_CITY=Monterrey
VUE_APP_STORE_STATE=NL

```

## Tecnologías Principales

- Vue.js 3 (Composition API)
- Vuex 4 (manejo de estado)
- Vue Router 4
- Vuetify 3
- Axios
- WebFontLoader

## Estructura Detallada del Proyecto

```
src/
├── assets/           # Recursos estáticos
│   ├── images/       # Imágenes
│   └── styles/       # Estilos globales
├── components/       # Componentes Vue
│   ├── cart/         # Componentes relacionados al carrito
│   ├── shipping/     # Componentes de envío
│   ├── product/      # Componentes de productos
│   └── shared/       # Componentes compartidos
├── plugins/          # Plugins Vue (Vuetify, etc)
├── router/           # Configuración de rutas
├── services/         # Servicios y APIs
│   ├── api.js        # Configuración base de Axios
│   └── enviaService.js # Servicio de envíos
├── store/            # Estado global (Vuex)
│   ├── modules/      # Módulos Vuex
│   └── index.js      # Configuración principal
├── views/            # Vistas principales
└── App.vue           # Componente raíz
```

## Guías de Contribución

1. Crea una rama para tu feature: `feature/nombre-feature`
2. Sigue el estilo de código establecido
3. Asegúrate de que el linter no muestre errores
4. Crea un Pull Request con una descripción clara

## Configuración de Desarrollo

### Editor Recomendado: VSCode

Extensiones recomendadas:
- Volar (Vue 3)
- ESLint
- Prettier
- Vuetify Intellisense

### Configuración de Vuetify

El proyecto usa Vuetify 3 con el tema personalizado en `src/plugins/vuetify.js`

### Manejo de Rutas

Las rutas están protegidas según el rol del usuario. Revisa `src/router/index.js` para más detalles.

## Despliegue

El proyecto está configurado para desplegarse en Vercel:

1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno en el dashboard
3. Cada push a `main` generará un nuevo despliegue

## Mantenimiento

- Actualiza regularmente las dependencias con `npm update`
- Revisa las actualizaciones de seguridad con `npm audit`
- Mantén actualizadas las variables de entorno

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
