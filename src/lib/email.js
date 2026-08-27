import nodemailer from 'nodemailer';
import dns from 'dns';

// Forzar la resolución de DNS a IPv4 primero para evitar que Docker bloquee los correos
dns.setDefaultResultOrder('ipv4first');
// Configuración del transporter usando las credenciales del .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // true para puerto 465 (SSL)
  auth: {
    user: process.env.EMAIL_USUARIO,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envia un correo electrónico sobre el estado de la cita al paciente
 * @param {Object} cita Objeto con los datos de la cita actualizada
 * @param {String} tipo 'Confirmada', 'Reagendada' o 'Cancelada'
 */
export const sendAppointmentEmail = async (cita, tipo = 'Confirmada') => {
  if (!cita.email) {
    console.log('No se puede enviar correo: el paciente no tiene un email registrado.');
    return;
  }

  // Formatear la fecha para que sea más legible
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaObjeto = new Date(cita.fecha_cita);
  fechaObjeto.setMinutes(fechaObjeto.getMinutes() + fechaObjeto.getTimezoneOffset());
  let fechaLegible = fechaObjeto.toLocaleDateString('es-ES', opcionesFecha);
  fechaLegible = fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1);

  // Formatear la hora (quitar segundos)
  const horaFormateada = cita.hora_cita.slice(0, 5);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4A154B; color: white; padding: 20px; text-align: center;">
        <img src="https://admin.radioonco.com.mx/assets/images/logos/logo01_round.png" alt="Logo Aurum" style="height: 60px; margin-bottom: 15px; border-radius: 50%;">
        <h2 style="margin: 0;">${tipo === 'Cancelada' ? 'Cancelación de Cita Médica' : tipo === 'Reagendada' ? 'Actualización de Cita Médica' : 'Confirmación de Cita Médica'}</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Aurum Centro de Imagen Oncológica y Diagnóstico</p>
      </div>
      
      <div style="padding: 30px; background-color: #FAFAFD; color: #333;">
        <p style="font-size: 16px;">Hola <strong>${cita.nombre_paciente}</strong>,</p>
        <p>Tu cita ha sido <strong>${tipo.toLowerCase()}</strong>.${tipo === 'Cancelada' ? ' Si tienes dudas, por favor contáctanos.' : ' A continuación, te compartimos los detalles:'}</p>
        
        <div style="background-color: white; border-left: 4px solid #E91E63; padding: 15px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <p style="margin: 5px 0;"><strong>Estudio:</strong> <span style="color: #4A154B;">${cita.estudio}</span></p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${fechaLegible}</p>
          <p style="margin: 5px 0;"><strong>Hora:</strong> ${horaFormateada}</p>
          <p style="margin: 5px 0;"><strong>Código de Cita:</strong> ${cita.id}</p>
        </div>
        
        <h3 style="color: #4A154B; margin-top: 30px;">Indicaciones Importantes</h3>
        <ul style="color: #555; font-size: 14px; line-height: 1.5;">
          <li>Por favor llega con <strong>15 minutos de anticipación</strong>.</li>
          <li>Si tienes estudios anteriores relacionados, no olvides llevarlos.</li>
          <li>En caso de necesitar cancelar o reagendar, te pedimos notificarnos con al menos 24 horas de anticipación a nuestro WhatsApp: 229 520 7459.</li>
        </ul>
        
        <p style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">
          Gracias por confiar en nosotros.<br>
          <em>Dra. Brigitte Reyes Palmero</em>
        </p>
      </div>
    </div>
  `;

  const asunto = tipo === 'Cancelada' ? `Cancelación de Cita: ${cita.estudio} - Aurum` :
                 tipo === 'Reagendada' ? `Actualización de Cita: ${cita.estudio} - Aurum` :
                 `Confirmación de Cita: ${cita.estudio} - Aurum`;

  const mailOptions = {
    from: `"Aurum Citas" <${process.env.EMAIL_USUARIO}>`,
    to: cita.email,
    subject: asunto,
    html: htmlBody
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado exitosamente a ${cita.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error enviando correo a ${cita.email}:`, error);
    throw error;
  }
};
