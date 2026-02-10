import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

/**
 * Envía el reporte HTML por email usando Gmail SMTP.
 * Requiere una "App Password" de Google (no la contraseña normal).
 */
export async function sendReport(htmlContent) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.REPORT_EMAIL || user;

  if (!user || !pass) {
    console.error('[Email] GMAIL_USER o GMAIL_APP_PASSWORD no configurados.');
    console.log('[Email] El reporte fue generado pero no se pudo enviar por email.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const lastMonth = dayjs().subtract(1, 'month').format('MMMM YYYY');

  const mailOptions = {
    from: `"Twins Report" <${user}>`,
    to: recipient,
    subject: `Reporte Mensual de Contenido Trending - ${lastMonth}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Reporte enviado exitosamente a ${recipient}`);
    console.log(`[Email] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email] Error enviando el reporte:', error.message);
    return false;
  }
}
