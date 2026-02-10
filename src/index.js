import 'dotenv/config';
import { topics, platformConfig } from '../config/topics.js';
import { fetchYouTubeTrending } from './collectors/youtube.js';
import { fetchInstagramTrending } from './collectors/instagram.js';
import { fetchFacebookTrending } from './collectors/facebook.js';
import { generateReport } from './report/generator.js';
import { sendReport } from './email/sender.js';
import { writeFileSync } from 'fs';

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  console.log('='.repeat(50));
  console.log('  TWINS - Reporte Mensual de Contenido Trending');
  console.log('='.repeat(50));
  console.log();

  if (isDryRun) {
    console.log('[Modo] Dry run - se generará el reporte sin enviar email.\n');
  }

  const reportData = [];

  for (const topic of topics) {
    console.log(`\n--- ${topic.icon} ${topic.name} ---`);

    const topicResult = {
      name: topic.name,
      icon: topic.icon,
      youtube: [],
      instagram: [],
      facebook: [],
    };

    // Recopilar datos de cada plataforma en paralelo
    const collectors = [];

    if (platformConfig.youtube.enabled) {
      collectors.push(
        fetchYouTubeTrending(topic, platformConfig.youtube.maxResultsPerTopic)
          .then((data) => {
            topicResult.youtube = data;
            console.log(`  [YouTube] ${data.length} resultados`);
          })
          .catch((err) => console.error(`  [YouTube] Error: ${err.message}`)),
      );
    }

    if (platformConfig.instagram.enabled) {
      collectors.push(
        fetchInstagramTrending(topic, platformConfig.instagram.maxResultsPerTopic)
          .then((data) => {
            topicResult.instagram = data;
            console.log(`  [Instagram] ${data.length} resultados`);
          })
          .catch((err) => console.error(`  [Instagram] Error: ${err.message}`)),
      );
    }

    if (platformConfig.facebook.enabled) {
      collectors.push(
        fetchFacebookTrending(topic, platformConfig.facebook.maxResultsPerTopic)
          .then((data) => {
            topicResult.facebook = data;
            console.log(`  [Facebook] ${data.length} resultados`);
          })
          .catch((err) => console.error(`  [Facebook] Error: ${err.message}`)),
      );
    }

    await Promise.all(collectors);
    reportData.push(topicResult);
  }

  // Generar el reporte HTML
  console.log('\n[Reporte] Generando HTML...');
  const html = generateReport(reportData);

  // Guardar una copia local del reporte
  const filename = `report-${new Date().toISOString().slice(0, 10)}.html`;
  writeFileSync(filename, html);
  console.log(`[Reporte] Guardado localmente: ${filename}`);

  // Enviar por email (a menos que sea dry-run)
  if (!isDryRun) {
    console.log('\n[Email] Enviando reporte...');
    const sent = await sendReport(html);
    if (!sent) {
      console.log('[Email] El reporte se guardó localmente pero no se envió por email.');
    }
  } else {
    console.log('\n[Dry Run] Reporte generado. No se envió email.');
    console.log(`[Dry Run] Abre ${filename} en tu navegador para ver el reporte.`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('  Proceso completado.');
  console.log('='.repeat(50));
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
