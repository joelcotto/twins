/**
 * Configuración de industrias y palabras clave para buscar contenido trending.
 * Puedes agregar, quitar o modificar temas según tus intereses.
 */
export const topics = [
  {
    name: 'Publicidad',
    icon: '📢',
    keywords: ['advertising trends', 'digital advertising', 'ad campaigns', 'publicidad digital'],
  },
  {
    name: 'Marketing',
    icon: '📊',
    keywords: ['marketing strategy', 'digital marketing', 'marketing trends', 'growth marketing'],
  },
  {
    name: 'Tecnología',
    icon: '💻',
    keywords: ['tech trends', 'new technology', 'tecnología', 'tech news'],
  },
  {
    name: 'Inteligencia Artificial',
    icon: '🤖',
    keywords: ['artificial intelligence', 'AI tools', 'machine learning', 'inteligencia artificial'],
  },
  {
    name: 'Automatización',
    icon: '⚙️',
    keywords: ['automation tools', 'workflow automation', 'business automation', 'automatización'],
  },
  {
    name: 'Negocios',
    icon: '💼',
    keywords: ['business strategy', 'entrepreneurship', 'startups', 'negocios'],
  },
  {
    name: 'Mercado de Valores',
    icon: '📈',
    keywords: ['stock market', 'investing', 'trading strategies', 'mercado de valores'],
  },
  {
    name: 'Software',
    icon: '🖥️',
    keywords: ['software development', 'SaaS', 'best software tools', 'software trends'],
  },
  {
    name: 'Estrategias de Venta',
    icon: '🎯',
    keywords: ['sales strategies', 'sales tips', 'B2B sales', 'estrategias de venta'],
  },
];

export const platformConfig = {
  youtube: {
    enabled: true,
    maxResultsPerTopic: parseInt(process.env.MAX_RESULTS_PER_TOPIC || '5', 10),
  },
  instagram: {
    enabled: true,
    maxResultsPerTopic: parseInt(process.env.MAX_RESULTS_PER_TOPIC || '5', 10),
  },
  facebook: {
    enabled: true,
    maxResultsPerTopic: parseInt(process.env.MAX_RESULTS_PER_TOPIC || '5', 10),
  },
};
