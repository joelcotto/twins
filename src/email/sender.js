import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

/**
 * Envía el reporte PDF por email como adjunto usando Gmail SMTP.
 * Requiere una "App Password" de Google (no la contraseña normal).
 */
export async function sendReport(pdfBuffer, filename) {
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

  const weekRange = `${dayjs().subtract(7, 'day').format('DD/MM')} - ${dayjs().format('DD/MM/YYYY')}`;

  const mailOptions = {
    from: `"Twins Report" <${user}>`,
    to: recipient,
    subject: `Reporte Semanal de Contenido Trending - ${weekRange}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #667eea;">Reporte Semanal de Contenido Trending</h2>
        <p>Hola,</p>
        <p>Adjunto encontrarás tu reporte semanal con los videos y contenidos más trending
        en <strong>YouTube</strong>, <strong>Instagram</strong> y <strong>Facebook</strong>
        sobre las industrias que monitoreas.</p>
        <p><strong>Periodo:</strong> ${weekRange}</p>
        <p>El reporte incluye gráficas de distribución por plataforma, tablas con los
        top contenidos, y un desglose por cada industria.</p>
        <hr style="border: 1px solid #e8e8f0; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">
          Generado automáticamente por Twins Report System.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: filename || 'reporte-semanal.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Reporte PDF enviado exitosamente a ${recipient}`);
    console.log(`[Email] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email] Error enviando el reporte:', error.message);
    return false;
  }
}
