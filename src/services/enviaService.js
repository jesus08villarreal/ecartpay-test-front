import axios from 'axios';

// Configuración de las APIs
const enviaApi = axios.create({
  baseURL: process.env.VUE_APP_ENVIA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.VUE_APP_ENVIA_TOKEN}`
  }
});

const geocodesApi = axios.create({
  baseURL: process.env.VUE_APP_GEOCODES_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Constantes para el paquete
const DEFAULT_PACKAGE_DIMENSIONS = {
  length: 30,
  width: 30,
  height: 30
};

// Validar dirección usando el API de Envia
export const validateAddress = async (address) => {
  try {
    if (!address.postalCode) {
      throw new Error('El código postal es requerido');
    }

    const response = await geocodesApi.get(`/zipcode/MX/${address.postalCode}`);
    
    if (!response.data) {
      throw new Error('Respuesta inválida del servidor');
    }

    const data = response.data[0];
    console.log(data);
    // Si la dirección es válida, retornamos los datos normalizados
    return {
      success: true,
      data: {
        zipCode: data.zip_code,
        country: data.country,
        state: data.state,
        locality: data.locality,
        suburbs: data.suburbs || [],
        coordinates: data.coordinates,
        regions: data.regions,
        info: data.info,
        // Información procesada para facilitar su uso
        municipality: data.regions?.region_2 || data.locality || '',
        stateCode: data.state?.code?.['2digit'] || '',
        countryCode: data.country?.code || 'MX'
      }
    };
  } catch (error) {
    console.error('Error al validar dirección:', error);
    throw new Error(error.response?.data?.message || 'Error al validar la dirección');
  }
};


// Validaciones
const validateProducts = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('Se requiere al menos un producto para calcular el envío');
  }

  products.forEach((item, index) => {
    if (!item.product || !item.quantity) {
      throw new Error(`Producto inválido en la posición ${index + 1}`);
    }
    if (item.quantity <= 0) {
      throw new Error(`Cantidad inválida para el producto ${item.product.name || `#${index + 1}`}`);
    }
    if (!item.product.price || item.product.price <= 0) {
      throw new Error(`Precio inválido para el producto ${item.product.name || `#${index + 1}`}`);
    }
  });
};

const validateShippingData = (shippingData) => {
  if (!shippingData) {
    throw new Error('Los datos de envío son requeridos');
  }

  const requiredFields = [
    'name',
    'email',
    'phone',
    'street',
    'number',
    'district',
    'city',
    'state',
    'stateCode',
    'postalCode'
  ];

  const missingFields = requiredFields.filter(field => {
    return !shippingData[field] || shippingData[field].trim() === '';
  });

  if (missingFields.length > 0) {
    throw new Error(`Los siguientes campos son requeridos: ${missingFields.join(', ')}`);
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(shippingData.email)) {
    throw new Error('El formato del correo electrónico no es válido');
  }

  // Validar formato de teléfono (10 dígitos)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(shippingData.phone)) {
    throw new Error('El teléfono debe tener 10 dígitos');
  }

  // Validar código postal (5 dígitos)
  const postalCodeRegex = /^\d{5}$/;
  if (!postalCodeRegex.test(shippingData.postalCode)) {
    throw new Error('El código postal debe tener 5 dígitos');
  }

  // Retornar los datos validados
  return {
    ...shippingData,
    // Asegurarnos que los campos opcionales existan
    company: shippingData.company || '',
    interiorNumber: shippingData.interiorNumber || '',
    reference: shippingData.reference || ''
  };
};

const calculatePackageDetails = (products) => {
  validateProducts(products);

  // Calcular el peso total y valor declarado
  const totalWeight = products.reduce((sum, item) => {
    const weight = Number(item.product.weight) || 0.5; // Peso mínimo por defecto: 0.5 kg
    return sum + (weight * item.quantity);
  }, 0);

  const declaredValue = products.reduce((sum, item) => {
    return sum + (Number(item.product.price) * item.quantity);
  }, 0);

  return {
    content: "Productos",
    amount: 1,
    type: "box",
    weight: Number(Math.max(0.1, totalWeight)), // Peso mínimo: 100g
    insurance: Number(declaredValue),
    declaredValue: Number(declaredValue),
    weightUnit: "KG",
    lengthUnit: "CM",
    dimensions: {
      length: Number(DEFAULT_PACKAGE_DIMENSIONS.length),
      width: Number(DEFAULT_PACKAGE_DIMENSIONS.width),
      height: Number(DEFAULT_PACKAGE_DIMENSIONS.height)
    }
  };
};

export const calculateShipping = async ({ postalCode, products }) => {
  try {
    // Validar productos y dirección
    validateProducts(products);
    
    // Validar dirección primero
    const addressValidation = await validateAddress({ postalCode });
    if (!addressValidation.success) {
      throw new Error('Código postal inválido');
    }

    const packageDetails = calculatePackageDetails(products);
    console.log(packageDetails);

    // Construir el payload según la documentación de Envia
    const payload = {
      origin: {
        name: process.env.VUE_APP_STORE_NAME || "Mi Tienda",
        company: process.env.VUE_APP_STORE_COMPANY || "Mi Empresa",
        email: process.env.VUE_APP_STORE_EMAIL || "contacto@mitienda.com",
        phone: process.env.VUE_APP_STORE_PHONE || "8180000000",
        street: process.env.VUE_APP_STORE_STREET || "Av. Principal",
        number: process.env.VUE_APP_STORE_NUMBER || "123",
        district: "",
        city: process.env.VUE_APP_STORE_CITY || "Monterrey",
        state: process.env.VUE_APP_STORE_STATE || "NL",
        country: "MX",
        postalCode: process.env.VUE_APP_STORE_POSTAL_CODE || "64000",
        reference: ""
      },
      destination: {
        name: "Cliente",
        company: "",
        email: "",
        phone: "",
        street: "",
        number: "",
        district: addressValidation.data.suburbs?.[0] || "", // Usamos la primera colonia disponible
        city: addressValidation.data.regions?.region_2 || addressValidation.data.locality || "",
        state: addressValidation.data.state?.code?.['2digit'] || "NL",
        country: "MX",
        postalCode: addressValidation.data.zipCode,
        reference: "",
        coordinates: addressValidation.data.coordinates || {
          latitude: "",
          longitude: ""
        }
      },
      packages: [{
        content: packageDetails.content,
        amount: Number(packageDetails.amount),
        type: packageDetails.type,
        weight: Number(packageDetails.weight),
        insurance: Number(packageDetails.insurance),
        declaredValue: Number(packageDetails.declaredValue),
        weightUnit: packageDetails.weightUnit,
        lengthUnit: packageDetails.lengthUnit,
        dimensions: {
          length: Number(DEFAULT_PACKAGE_DIMENSIONS.length),
          width: Number(DEFAULT_PACKAGE_DIMENSIONS.width),
          height: Number(DEFAULT_PACKAGE_DIMENSIONS.height)
        }
      }],
      shipment: {
        carrier: "dhl",
        type: 1
      },
      settings: {
        currency: "MXN"
      }
    };

    const response = await enviaApi.post('/ship/rate', payload);

    if (!response.data?.data || !Array.isArray(response.data.data)) {
      throw new Error('Respuesta inválida del servidor');
    }
    // Filtrar y ordenar tarifas válidas
    let rates = response.data.data
      .filter(rate => rate?.totalPrice > 0 && rate.carrier && rate.service)
      .sort((a, b) => a.totalPrice - b.totalPrice);

    if (rates.length === 0) {
      throw new Error('No hay tarifas disponibles para esta dirección');
    }

    return {
      success: true,
      rates: rates.map(rate => ({
        carrier: rate.carrier,
        service: rate.service,
        amount: rate.totalPrice,
        currency: rate.currency || 'MXN',
        days: rate.deliveryDate?.dateDifference || 1,
        deliveryEstimate: rate.deliveryEstimate || `${rate.deliveryDate?.dateDifference || 1} días`,
        deliveryDate: rate.deliveryDate?.date,
        basePrice: rate.basePrice,
        totalPrice: rate.totalPrice,
        description: rate.serviceDescription || rate.service
      }))
    };
  } catch (error) {
    console.error('Error al calcular envío:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error al calcular el costo de envío');
  }
};

export const createShipment = async ({ products, selectedRate, shippingData }) => {
  try {
    // Validar datos
    validateProducts(products);
    const validatedShippingData = validateShippingData(shippingData);

    // Obtener información normalizada del código postal
    const addressInfo = await validateAddress({
      postalCode: validatedShippingData.postalCode
    });

    const packageDetails = calculatePackageDetails(products);

    // Construir el payload según la documentación de Envia
    const payload = {
      origin: {
        name: process.env.VUE_APP_STORE_NAME || "Mi Tienda",
        company: process.env.VUE_APP_STORE_COMPANY || "Mi Empresa",
        email: process.env.VUE_APP_STORE_EMAIL || "contacto@mitienda.com",
        phone: process.env.VUE_APP_STORE_PHONE || "8180000000",
        street: process.env.VUE_APP_STORE_STREET || "Av. Principal",
        number: process.env.VUE_APP_STORE_NUMBER || "123",
        district: "",
        city: process.env.VUE_APP_STORE_CITY || "Monterrey",
        state: process.env.VUE_APP_STORE_STATE || "NL",
        country: "MX",
        postalCode: process.env.VUE_APP_STORE_POSTAL_CODE || "64000",
        reference: ""
      },
      destination: {
        name: validatedShippingData.name,
        company: validatedShippingData.company,
        email: validatedShippingData.email,
        phone: validatedShippingData.phone,
        street: validatedShippingData.street,
        number: validatedShippingData.number,
        district: validatedShippingData.district,
        city: addressInfo.data.municipality || validatedShippingData.city,
        state: validatedShippingData.stateCode,
        country: "MX",
        postalCode: validatedShippingData.postalCode,
        reference: [
          validatedShippingData.interiorNumber ? `Int. ${validatedShippingData.interiorNumber}` : null,
          validatedShippingData.reference
        ].filter(Boolean).join('. '),
        coordinates: addressInfo.data.coordinates
      },
      packages: [{
        content: packageDetails.content,
        amount: Number(packageDetails.amount),
        type: packageDetails.type,
        weight: Number(packageDetails.weight),
        insurance: Number(packageDetails.insurance),
        declaredValue: Number(packageDetails.declaredValue),
        weightUnit: packageDetails.weightUnit,
        lengthUnit: packageDetails.lengthUnit,
        dimensions: {
          length: Number(DEFAULT_PACKAGE_DIMENSIONS.length),
          width: Number(DEFAULT_PACKAGE_DIMENSIONS.width),
          height: Number(DEFAULT_PACKAGE_DIMENSIONS.height)
        }
      }],
      shipment: {
        carrier: selectedRate.carrier,
        service: selectedRate.service,
        type: 1,
      },
      settings: {
        printFormat: "PDF",
        printSize: "STOCK_4X6",
        currency: "MXN"
      }
    };

    console.log('Payload para generación de etiqueta:', payload);
    const response = await enviaApi.post('/ship/generate', payload);
    console.log('Respuesta de generación de etiqueta:', response.data.data[0]);

    if (!response.data?.data) {
      throw new Error('Respuesta inválida del servidor');
    }
    const shipment = response.data.data[0];

    return {
      success: true,
      shipment: {
        ...shipment,
        trackingNumber: shipment.trackingNumber,
        label: shipment.label,
        carrier: shipment.carrier,
        service: shipment.service,
        tracking: shipment.tracking,
        destination: payload.destination,
        origin: payload.origin
      }
    };
  } catch (error) {
    console.error('Error al generar envío:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error al generar el envío');
  }
}; 