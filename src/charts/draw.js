/**
 * Módulo de gráficas usando las primitivas vectoriales de PDFKit.
 * Dibuja bar charts, pie charts y tablas directamente en el PDF.
 */

// Paleta de colores profesional
const COLORS = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  facebook: '#1877F2',
  primary: '#667EEA',
  secondary: '#764BA2',
  text: '#1A1A2E',
  textLight: '#666666',
  border: '#E8E8F0',
  background: '#F8F9FF',
  white: '#FFFFFF',
};

const PLATFORM_COLORS = [COLORS.youtube, COLORS.instagram, COLORS.facebook];
const PLATFORM_NAMES = ['YouTube', 'Instagram', 'Facebook'];

/**
 * Dibuja una gráfica de barras horizontal comparando contenido por plataforma.
 */
export function drawBarChart(doc, data, options = {}) {
  const {
    x = 50,
    y = 0,
    width = 480,
    height = 180,
    title = 'Contenido por Plataforma',
  } = options;

  const startY = y || doc.y;

  // Título
  doc.fontSize(13).fillColor(COLORS.text).font('Helvetica-Bold');
  doc.text(title, x, startY, { width });
  let currentY = startY + 25;

  const barHeight = 28;
  const gap = 12;
  const labelWidth = 85;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const barWidth = ((width - labelWidth - 50) * item.value) / maxVal;

    // Label
    doc.fontSize(10).fillColor(COLORS.text).font('Helvetica');
    doc.text(item.label, x, currentY + 7, { width: labelWidth, align: 'right' });

    // Bar background
    doc
      .rect(x + labelWidth + 10, currentY, width - labelWidth - 50, barHeight)
      .fillColor('#F0F0F5')
      .fill();

    // Bar
    if (barWidth > 0) {
      doc
        .rect(x + labelWidth + 10, currentY, barWidth, barHeight)
        .fillColor(item.color || PLATFORM_COLORS[i % 3])
        .fill();
    }

    // Value
    doc.fontSize(9).fillColor(COLORS.white).font('Helvetica-Bold');
    if (barWidth > 30) {
      doc.text(
        item.value.toString(),
        x + labelWidth + 15,
        currentY + 8,
        { width: barWidth - 10 },
      );
    } else {
      doc.fillColor(COLORS.text);
      doc.text(
        item.value.toString(),
        x + labelWidth + barWidth + 15,
        currentY + 8,
      );
    }

    currentY += barHeight + gap;
  }

  doc.y = currentY + 10;
  return currentY + 10;
}

/**
 * Dibuja una gráfica de pastel (pie chart) mostrando distribución.
 */
export function drawPieChart(doc, data, options = {}) {
  const {
    x = 50,
    y = 0,
    radius = 65,
    title = 'Distribución',
  } = options;

  const startY = y || doc.y;

  // Título
  doc.fontSize(13).fillColor(COLORS.text).font('Helvetica-Bold');
  doc.text(title, x, startY, { width: 480 });

  const centerX = x + radius + 20;
  const centerY = startY + 30 + radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let startAngle = -Math.PI / 2;

  for (let i = 0; i < data.length; i++) {
    const slice = data[i];
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    if (slice.value > 0) {
      // Dibujar sector
      doc.save();
      doc.fillColor(slice.color || PLATFORM_COLORS[i % 3]);

      const path = doc.path(
        `M ${centerX} ${centerY} ` +
        `L ${centerX + radius * Math.cos(startAngle)} ${centerY + radius * Math.sin(startAngle)} ` +
        arcPath(centerX, centerY, radius, startAngle, endAngle) +
        ' Z',
      );
      path.fill();
      doc.restore();
    }

    startAngle = endAngle;
  }

  // Leyenda al lado derecho
  const legendX = centerX + radius + 40;
  let legendY = startY + 40;

  for (let i = 0; i < data.length; i++) {
    const slice = data[i];
    const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0.0';

    // Color box
    doc
      .rect(legendX, legendY, 12, 12)
      .fillColor(slice.color || PLATFORM_COLORS[i % 3])
      .fill();

    // Label
    doc.fontSize(10).fillColor(COLORS.text).font('Helvetica');
    doc.text(
      `${slice.label}: ${slice.value} (${pct}%)`,
      legendX + 18,
      legendY + 1,
      { width: 200 },
    );

    legendY += 22;
  }

  doc.y = centerY + radius + 20;
  return doc.y;
}

/**
 * Dibuja una tabla con los top contenidos de una industria.
 */
export function drawContentTable(doc, items, options = {}) {
  const {
    x = 50,
    y = 0,
    width = 495,
    maxItems = 5,
  } = options;

  let currentY = y || doc.y;
  const colWidths = [width * 0.45, width * 0.2, width * 0.15, width * 0.2];
  const rowHeight = 32;

  // Header
  doc.rect(x, currentY, width, rowHeight).fillColor(COLORS.primary).fill();

  doc.fontSize(9).fillColor(COLORS.white).font('Helvetica-Bold');
  const headers = ['Título', 'Canal', 'Plataforma', 'Vistas / Likes'];
  let colX = x + 6;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], colX, currentY + 10, {
      width: colWidths[i] - 12,
      ellipsis: true,
    });
    colX += colWidths[i];
  }

  currentY += rowHeight;

  // Rows
  const displayItems = items.slice(0, maxItems);
  for (let r = 0; r < displayItems.length; r++) {
    const item = displayItems[r];
    const bgColor = r % 2 === 0 ? COLORS.white : COLORS.background;

    doc.rect(x, currentY, width, rowHeight).fillColor(bgColor).fill();

    doc.fontSize(8).fillColor(COLORS.text).font('Helvetica');
    colX = x + 6;

    // Título
    doc.text(truncate(item.title, 50), colX, currentY + 10, {
      width: colWidths[0] - 12,
      ellipsis: true,
      lineBreak: false,
    });
    colX += colWidths[0];

    // Canal
    doc.text(truncate(item.channel, 20), colX, currentY + 10, {
      width: colWidths[1] - 12,
      ellipsis: true,
      lineBreak: false,
    });
    colX += colWidths[1];

    // Plataforma
    const platColor =
      item.platform === 'YouTube'
        ? COLORS.youtube
        : item.platform === 'Instagram'
          ? COLORS.instagram
          : COLORS.facebook;
    doc.fontSize(8).fillColor(platColor).font('Helvetica-Bold');
    doc.text(item.platform, colX, currentY + 10, {
      width: colWidths[2] - 12,
    });
    colX += colWidths[2];

    // Stats
    doc.fontSize(8).fillColor(COLORS.text).font('Helvetica');
    const stats = formatStats(item.views, item.likes);
    doc.text(stats, colX, currentY + 10, {
      width: colWidths[3] - 12,
    });

    currentY += rowHeight;
  }

  // Border
  doc
    .rect(x, (y || doc.y) + rowHeight - 32, width, currentY - (y || doc.y) + 32 - rowHeight)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  doc.y = currentY + 10;
  return currentY + 10;
}

// Helpers

function arcPath(cx, cy, r, startAngle, endAngle) {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const ex = cx + r * Math.cos(endAngle);
  const ey = cy + r * Math.sin(endAngle);
  return ` A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}

function formatStats(views, likes) {
  const parts = [];
  if (views) parts.push(`${formatNumber(views)} vistas`);
  if (likes) parts.push(`${formatNumber(likes)} likes`);
  return parts.join(' / ') || '-';
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export { COLORS, PLATFORM_COLORS, PLATFORM_NAMES };
