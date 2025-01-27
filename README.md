# EcartPay - Frontend

Frontend de la aplicación EcartPay, una plataforma de comercio electrónico desarrollada con Vue.js y Vuetify.

## Características

- 🛍️ Catálogo de productos
- 🛒 Carrito de compras
- 🚚 Integración con API de envíos
- 👤 Autenticación de usuarios
- 💳 Proceso de checkout
- 📱 Diseño responsive

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

- Node.js (v14 o superior)
- NPM (v6 o superior)

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

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VUE_APP_API_URL=tu_url_api
VUE_APP_ENVIA_API_KEY=tu_api_key_envia
```

## Tecnologías Principales

- Vue.js 3
- Vuex (manejo de estado)
- Vue Router
- Vuetify 3
- Axios

## Despliegue

El proyecto está configurado para desplegarse en Vercel. Cada push a la rama principal activará un nuevo despliegue automáticamente.

## Estructura del Proyecto

```
src/
├── assets/        # Recursos estáticos
├── components/    # Componentes Vue
├── router/        # Configuración de rutas
├── store/         # Estado global (Vuex)
├── services/      # Servicios y APIs
├── views/         # Vistas principales
└── App.vue        # Componente raíz
```
## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.