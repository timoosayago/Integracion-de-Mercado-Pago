const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');
const app = express();
const PORT = 3000;

// Token de prueba de Mercado Pago (usá el tuyo real en producción)
mercadopago.configure({
  access_token: 'APP_USR-3642566228529799-070317-67ef1a145d1f66f63ebf1c1277bc3dbd-1577049737' // Cambiar por tu token de test real
});

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Asegúrate que tu HTML/JS esté dentro de /public

app.post('/api/create-preference', async (req, res) => {
  const pedido = req.body;

  const preference = {
    items: pedido.items,
    payer: pedido.payer,
    back_urls: pedido.back_urls,
    auto_return: pedido.auto_return,
    shipments: {
      cost: pedido.shipping.cost,
      mode: 'not_specified'
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({
      id: response.body.id,
      init_point: response.body.init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error al crear preferencia de Mercado Pago' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
