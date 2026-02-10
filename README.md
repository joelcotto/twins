# Twins - Reporte Semanal de Contenido Trending (PDF)

Sistema automatizado que recopila los videos y contenidos más vistos en **YouTube**, **Instagram** y **Facebook** sobre las industrias que te interesan, genera un **reporte PDF profesional con gráficas** y te lo envía por email cada semana.

## Qué incluye el reporte PDF

- Portada profesional con gradiente
- Página de resumen con métricas totales
- Gráfica de barras: contenido por plataforma
- Gráfica de pastel: distribución porcentual
- Gráfica de barras: contenido por industria
- Una página por cada industria con:
  - Gráfica de distribución
  - Tabla con los top contenidos (título, canal, plataforma, vistas/likes)
- Numeración de páginas y footer

## Industrias Monitoreadas

- Publicidad
- Marketing
- Tecnología
- Inteligencia Artificial
- Automatización
- Negocios
- Mercado de Valores
- Software
- Estrategias de Venta

## Requisitos

- **Node.js** 18 o superior
- **YouTube Data API v3** key (gratuita)
- **RapidAPI** key (plan gratuito disponible)
- **Gmail** con App Password habilitada

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/joelcotto/twins.git
cd twins

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys y configuración de email
```

## Obtener API Keys

### YouTube Data API v3 (Gratis)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Activa la **YouTube Data API v3**
4. Ve a **Credenciales** > **Crear credenciales** > **API Key**
5. Copia la key a tu archivo `.env`

### RapidAPI (Plan gratuito)
1. Regístrate en [RapidAPI](https://rapidapi.com/)
2. Suscríbete a [Instagram Scraper API](https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2) (plan gratuito)
3. Suscríbete a [Facebook Scraper](https://rapidapi.com/developer-jeremie/api/facebook-scraper3) (plan gratuito)
4. Copia tu RapidAPI key a tu archivo `.env`

### Gmail App Password
1. Activa la [verificación en 2 pasos](https://myaccount.google.com/signinoptions/two-step-verification) en tu cuenta de Google
2. Ve a [App Passwords](https://myaccount.google.com/apppasswords)
3. Genera una nueva contraseña de aplicación para "Mail"
4. Copia la contraseña a tu archivo `.env`

## Uso

### Ejecutar manualmente
```bash
# Generar reporte PDF y enviar por email
npm start

# Generar PDF SIN enviar email (prueba)
npm test
```

### Ejecución automática semanal (GitHub Actions)
El reporte se genera automáticamente **cada lunes a las 9:00 AM UTC**.

Para configurar GitHub Actions:
1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Agrega estos secretos:
   - `YOUTUBE_API_KEY`
   - `RAPIDAPI_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `REPORT_EMAIL`

También puedes ejecutarlo manualmente desde la pestaña **Actions** > **Weekly Trending Report** > **Run workflow**.

## Estructura del Proyecto

```
twins/
├── config/
│   └── topics.js              # Temas e industrias a monitorear
├── src/
│   ├── index.js               # Orquestador principal
│   ├── charts/
│   │   └── draw.js            # Gráficas vectoriales (barras, pastel, tablas)
│   ├── collectors/
│   │   ├── youtube.js         # YouTube Data API v3
│   │   ├── instagram.js       # Instagram (via RapidAPI)
│   │   └── facebook.js        # Facebook (via RapidAPI)
│   ├── report/
│   │   └── generator.js       # Generador de PDF con gráficas
│   └── email/
│       └── sender.js          # Envío por Gmail SMTP (con PDF adjunto)
├── .github/
│   └── workflows/
│       └── monthly-report.yml # GitHub Actions (semanal)
├── .env.example               # Plantilla de configuración
├── package.json
└── README.md
```

## Personalización

### Agregar o modificar industrias
Edita `config/topics.js` para cambiar los temas y palabras clave:

```javascript
{
  name: 'Tu Industria',
  icon: '🔥',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
}
```

### Cambiar frecuencia
Modifica el cron en `.github/workflows/monthly-report.yml`:
- Diario: `0 9 * * *`
- Cada lunes y jueves: `0 9 * * 1,4`
- Mensual (día 1): `0 9 1 * *`

## Licencia

MIT
