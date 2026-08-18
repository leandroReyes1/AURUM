import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import citasRoutes from './citas.routes.js';

// 1. Inicialización
const app = express();
const PORT = 4000;

// 2. Middlewares de Seguridad Globales
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false, // Desactivado temporalmente para no bloquear scripts externos (Tailwind, FontAwesome)
}));

// Límite global: 200 peticiones cada 15 minutos por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas peticiones, por favor intenta más tarde.' }
});
app.use(globalLimiter);

// 3. Middlewares Generales
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
// Limitar específicamente las peticiones a la API para evitar spam de citas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Incrementado a 500 para permitir uso del panel admin
  message: { error: 'Has enviado demasiadas solicitudes. Por favor espera 15 minutos.' }
});

app.use('/api', apiLimiter, (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, citasRoutes);

// 4. Iniciar Servidor
app.listen(PORT, () => {
  console.log(` Servidor de Aurum API corriendo en http://localhost:${PORT}`);
});