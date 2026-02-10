import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import {
  drawBarChart,
  drawPieChart,
  drawContentTable,
  COLORS,
  PLATFORM_COLORS,
  PLATFORM_NAMES,
} from '../charts/draw.js';

/**
 * Genera un reporte PDF profesional con gráficas y tablas.
 * Retorna un Buffer con el PDF.
 */
export async function generatePdfReport(reportData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      bufferPages: true,
      info: {
        Title: 'Reporte Semanal de Contenido Trending',
        Author: 'Twins Report System',
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const now = dayjs();
    const weekAgo = now.subtract(7, 'day');
    const period = `${weekAgo.format('DD/MM/YYYY')} - ${now.format('DD/MM/YYYY')}`;

    // ========== PORTADA ==========
    drawCover(doc, period, now);

    // ========== PÁGINA DE RESUMEN ==========
    doc.addPage();
    drawSummaryPage(doc, reportData);

    // ========== PÁGINAS POR INDUSTRIA ==========
    for (const topic of reportData) {
      doc.addPage();
      drawTopicPage(doc, topic);
    }

    // ========== FOOTER EN TODAS LAS PÁGINAS ==========
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      drawFooter(doc, i + 1, totalPages);
    }

    doc.end();
  });
}

function drawCover(doc, period, now) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Fondo gradiente simulado (rectángulos)
  const gradientSteps = 20;
  const stepHeight = pageHeight / gradientSteps;
  for (let i = 0; i < gradientSteps; i++) {
    const r = Math.round(102 + (118 - 102) * (i / gradientSteps));
    const g = Math.round(126 + (75 - 126) * (i / gradientSteps));
    const b = Math.round(234 + (162 - 234) * (i / gradientSteps));
    doc
      .rect(0, i * stepHeight, pageWidth, stepHeight + 1)
      .fillColor(`rgb(${r}, ${g}, ${b})`)
      .fill();
  }

  // Título principal
  doc.fontSize(36).fillColor(COLORS.white).font('Helvetica-Bold');
  doc.text('REPORTE SEMANAL', 0, pageHeight * 0.3, {
    width: pageWidth,
    align: 'center',
  });

  doc.fontSize(20).font('Helvetica');
  doc.text('Contenido Trending', 0, pageHeight * 0.3 + 50, {
    width: pageWidth,
    align: 'center',
  });

  // Línea decorativa
  const lineY = pageHeight * 0.3 + 90;
  doc
    .moveTo(pageWidth * 0.3, lineY)
    .lineTo(pageWidth * 0.7, lineY)
    .strokeColor(COLORS.white)
    .lineWidth(2)
    .stroke();

  // Plataformas
  doc.fontSize(14).font('Helvetica');
  doc.text('YouTube  |  Instagram  |  Facebook', 0, lineY + 20, {
    width: pageWidth,
    align: 'center',
  });

  // Periodo
  doc.fontSize(12).font('Helvetica');
  doc.text(`Periodo: ${period}`, 0, lineY + 55, {
    width: pageWidth,
    align: 'center',
  });

  // Fecha de generación
  doc.fontSize(10).fillColor('rgba(255,255,255,0.8)');
  doc.text(
    `Generado: ${now.format('DD/MM/YYYY HH:mm')}`,
    0,
    pageHeight - 80,
    { width: pageWidth, align: 'center' },
  );
}

function drawSummaryPage(doc, reportData) {
  // Título de sección
  drawSectionTitle(doc, 'Resumen General');

  // Calcular totales
  let totalYT = 0;
  let totalIG = 0;
  let totalFB = 0;

  for (const topic of reportData) {
    totalYT += topic.youtube?.length || 0;
    totalIG += topic.instagram?.length || 0;
    totalFB += topic.facebook?.length || 0;
  }

  const total = totalYT + totalIG + totalFB;

  // Métricas principales
  doc.y += 10;
  drawMetricBoxes(doc, [
    { label: 'Total Contenidos', value: total.toString() },
    { label: 'YouTube', value: totalYT.toString() },
    { label: 'Instagram', value: totalIG.toString() },
    { label: 'Facebook', value: totalFB.toString() },
  ]);

  doc.y += 20;

  // Gráfica de barras: Contenido por plataforma
  drawBarChart(doc, [
    { label: 'YouTube', value: totalYT, color: COLORS.youtube },
    { label: 'Instagram', value: totalIG, color: COLORS.instagram },
    { label: 'Facebook', value: totalFB, color: COLORS.facebook },
  ], {
    title: 'Contenido Encontrado por Plataforma',
    height: 140,
  });

  doc.y += 15;

  // Gráfica de pastel: Distribución
  drawPieChart(doc, [
    { label: 'YouTube', value: totalYT, color: COLORS.youtube },
    { label: 'Instagram', value: totalIG, color: COLORS.instagram },
    { label: 'Facebook', value: totalFB, color: COLORS.facebook },
  ], {
    title: 'Distribución por Plataforma',
  });

  doc.y += 15;

  // Gráfica de barras: Contenido por industria
  const industryData = reportData.map((topic) => ({
    label: topic.name,
    value:
      (topic.youtube?.length || 0) +
      (topic.instagram?.length || 0) +
      (topic.facebook?.length || 0),
    color: COLORS.primary,
  }));

  if (doc.y + 250 > doc.page.height - 60) doc.addPage();

  drawBarChart(doc, industryData, {
    title: 'Contenido por Industria',
    height: 300,
  });
}

function drawTopicPage(doc, topic) {
  // Título de industria
  drawSectionTitle(doc, `${topic.icon} ${topic.name}`);

  // Mini resumen
  const ytCount = topic.youtube?.length || 0;
  const igCount = topic.instagram?.length || 0;
  const fbCount = topic.facebook?.length || 0;

  doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica');
  doc.text(
    `YouTube: ${ytCount} | Instagram: ${igCount} | Facebook: ${fbCount}`,
    50,
    doc.y + 5,
    { width: 495 },
  );
  doc.y += 20;

  // Gráfica de barras mini
  drawBarChart(doc, [
    { label: 'YouTube', value: ytCount, color: COLORS.youtube },
    { label: 'Instagram', value: igCount, color: COLORS.instagram },
    { label: 'Facebook', value: fbCount, color: COLORS.facebook },
  ], {
    title: 'Distribución de Contenido',
    height: 120,
  });

  doc.y += 10;

  // Combinar todos los items y mostrar los top
  const allItems = [
    ...(topic.youtube || []),
    ...(topic.instagram || []),
    ...(topic.facebook || []),
  ].sort((a, b) => (b.views + b.likes) - (a.views + a.likes));

  if (allItems.length > 0) {
    // Verificar espacio disponible, agregar página si necesario
    if (doc.y + 200 > doc.page.height - 60) doc.addPage();

    doc.fontSize(13).fillColor(COLORS.text).font('Helvetica-Bold');
    doc.text('Top Contenidos de la Semana', 50, doc.y, { width: 495 });
    doc.y += 8;

    drawContentTable(doc, allItems, { maxItems: 8 });
  } else {
    doc.fontSize(11).fillColor(COLORS.textLight).font('Helvetica');
    doc.text('No se encontró contenido trending esta semana para esta industria.', 50, doc.y);
  }
}

function drawSectionTitle(doc, title) {
  const y = doc.y || 40;

  // Línea decorativa
  doc
    .rect(50, y, 4, 24)
    .fillColor(COLORS.primary)
    .fill();

  doc.fontSize(18).fillColor(COLORS.text).font('Helvetica-Bold');
  doc.text(title, 62, y + 2, { width: 480 });

  // Línea separadora
  doc
    .moveTo(50, y + 32)
    .lineTo(545, y + 32)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();

  doc.y = y + 42;
}

function drawMetricBoxes(doc, metrics) {
  const boxWidth = 110;
  const boxHeight = 60;
  const gap = 15;
  const startX = 50;
  const y = doc.y;

  for (let i = 0; i < metrics.length; i++) {
    const x = startX + i * (boxWidth + gap);

    // Box background
    doc.roundedRect(x, y, boxWidth, boxHeight, 6).fillColor(COLORS.background).fill();
    doc.roundedRect(x, y, boxWidth, boxHeight, 6).strokeColor(COLORS.border).lineWidth(0.5).stroke();

    // Value
    doc.fontSize(22).fillColor(COLORS.primary).font('Helvetica-Bold');
    doc.text(metrics[i].value, x, y + 10, { width: boxWidth, align: 'center' });

    // Label
    doc.fontSize(8).fillColor(COLORS.textLight).font('Helvetica');
    doc.text(metrics[i].label, x, y + 38, {
      width: boxWidth,
      align: 'center',
    });
  }

  doc.y = y + boxHeight + 10;
}

function drawFooter(doc, page, total) {
  if (page === 1) return; // No footer on cover

  const y = doc.page.height - 30;
  doc.fontSize(8).fillColor(COLORS.textLight).font('Helvetica');
  doc.text(
    `Twins Weekly Report | Página ${page} de ${total}`,
    50,
    y,
    { width: doc.page.width - 100, align: 'center' },
  );
}
