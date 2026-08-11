import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import citasRoutes from './citas.routes.js';

// 1. Inicialización
const app = express();
const PORT = 4000;

// 2. Middlewares
// Configuración de CORS para permitir múltiples orígenes locales
const corsOptions = {
  origin: function (origin, callback) {
    // En desarrollo local, permitimos cualquier origen para facilitar pruebas en red (celulares, tablets, etc.)
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 3. Rutas estáticas (Frontend) y API (Backend)
app.use(express.static('.')); // Sirve el index.html, admin.html, etc.
// Desactivar caché en la API para evitar que Chrome/Safari muestren datos viejos
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, citasRoutes);

// 4. Iniciar Servidor
app.listen(PORT, () => {
  console.log(` Servidor de Aurum API corriendo en http://localhost:${PORT}`);
});