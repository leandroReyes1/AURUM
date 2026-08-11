import { Router } from 'express';
import {
  getAllCitas,
  createCita,
  getCitaById,
  updateCita,
  getHorariosDisponibles,
  getAllEstudios
} from './citas.controller.js';

const router = Router();

router.get('/citas', getAllCitas);
router.post('/citas', createCita);
router.get('/citas/:id', getCitaById);
router.put('/citas/:id', updateCita);
router.get('/horarios-disponibles', getHorariosDisponibles);
router.get('/estudios', getAllEstudios);

export default router;