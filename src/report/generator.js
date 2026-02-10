import dayjs from 'dayjs';

/**
 * Genera un reporte HTML profesional con el contenido trending recopilado.
 */
export function generateReport(reportData) {
  const now = dayjs();
  const lastMonth = now.subtract(1, 'month');
  const periodLabel = `${lastMonth.format('MMMM YYYY')}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Mensual de Contenido Trending - ${periodLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f0f2f5;
      color: #1a1a2e;
      line-height: 1.6;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .summary {
      background: #f8f9ff;
      padding: 20px 30px;
      border-bottom: 1px solid #e8e8f0;
    }
    .summary-grid {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }
    .summary-item h3 {
      font-size: 28px;
      color: #667eea;
    }
    .summary-item p {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .topic-section {
      padding: 25px 30px;
      border-bottom: 1px solid #f0f0f0;
    }
    .topic-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 15px;
      color: #1a1a2e;
      border-left: 4px solid #667eea;
      padding-left: 12px;
    }
    .platform-group {
      margin-bottom: 15px;
    }
    .platform-label {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      padding: 4px 12px;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 10px;
    }
    .platform-youtube { background: #ff0000; }
    .platform-instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
    .platform-facebook { background: #1877f2; }
    .content-card {
      background: #fafbff;
      border: 1px solid #e8e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 10px;
      transition: box-shadow 0.2s;
    }
    .content-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .content-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .content-title a {
      color: #1a1a2e;
      text-decoration: none;
    }
    .content-title a:hover {
      color: #667eea;
    }
    .content-meta {
      font-size: 12px;
      color: #888;
    }
    .content-meta span {
      margin-right: 12px;
    }
    .content-stats {
      font-size: 12px;
      color: #667eea;
      font-weight: 600;
      margin-top: 4px;
    }
    .footer {
      background: #1a1a2e;
      color: #aaa;
      padding: 25px 30px;
      text-align: center;
      font-size: 12px;
    }
    .footer a { color: #667eea; }
    .no-data {
      color: #999;
      font-style: italic;
      font-size: 13px;
      padding: 10px 0;
    }
    @media (max-width: 600px) {
      .header h1 { font-size: 20px; }
      .summary-grid { flex-direction: column; gap: 10px; }
      .topic-section { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reporte Mensual de Contenido Trending</h1>
      <p>Periodo: ${periodLabel} | Generado: ${now.format('DD/MM/YYYY HH:mm')}</p>
    </div>

    <div class="summary">
      <div class="summary-grid">
        ${buildSummaryItems(reportData)}
      </div>
    </div>

    ${buildTopicSections(reportData)}

    <div class="footer">
      <p>Generado automáticamente por <strong>Twins Monthly Report</strong></p>
      <p style="margin-top: 8px;">Para modificar los temas, edita <code>config/topics.js</code></p>
    </div>
  </div>
</body>
</html>`;
}

function buildSummaryItems(reportData) {
  let totalYT = 0;
  let totalIG = 0;
  let totalFB = 0;

  for (const topic of reportData) {
    totalYT += topic.youtube?.length || 0;
    totalIG += topic.instagram?.length || 0;
    totalFB += topic.facebook?.length || 0;
  }

  return `
    <div class="summary-item">
      <h3>${totalYT}</h3>
      <p>YouTube</p>
    </div>
    <div class="summary-item">
      <h3>${totalIG}</h3>
      <p>Instagram</p>
    </div>
    <div class="summary-item">
      <h3>${totalFB}</h3>
      <p>Facebook</p>
    </div>
    <div class="summary-item">
      <h3>${reportData.length}</h3>
      <p>Industrias</p>
    </div>
  `;
}

function buildTopicSections(reportData) {
  return reportData
    .map(
      (topic) => `
    <div class="topic-section">
      <div class="topic-title">${topic.icon} ${topic.name}</div>
      ${buildPlatformGroup('YouTube', 'youtube', topic.youtube)}
      ${buildPlatformGroup('Instagram', 'instagram', topic.instagram)}
      ${buildPlatformGroup('Facebook', 'facebook', topic.facebook)}
    </div>
  `,
    )
    .join('');
}

function buildPlatformGroup(label, cssClass, items) {
  if (!items || items.length === 0) {
    return `
      <div class="platform-group">
        <span class="platform-label platform-${cssClass}">${label}</span>
        <p class="no-data">No se encontró contenido trending este mes.</p>
      </div>
    `;
  }

  const cards = items
    .map(
      (item) => `
    <div class="content-card">
      <div class="content-title">
        <a href="${item.url}" target="_blank">${escapeHtml(item.title)}</a>
      </div>
      <div class="content-meta">
        <span>@${escapeHtml(item.channel)}</span>
        <span>${item.publishedAt ? dayjs(item.publishedAt).format('DD/MM/YYYY') : ''}</span>
      </div>
      <div class="content-stats">
        ${item.views ? `${formatNumber(item.views)} vistas` : ''}
        ${item.views && item.likes ? ' · ' : ''}
        ${item.likes ? `${formatNumber(item.likes)} likes` : ''}
      </div>
    </div>
  `,
    )
    .join('');

  return `
    <div class="platform-group">
      <span class="platform-label platform-${cssClass}">${label}</span>
      ${cards}
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
