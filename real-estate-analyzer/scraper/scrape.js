/**
 * Idealista scraper (uso personal)
 * --------------------------------
 * Usa Playwright + stealth para esquivar DataDome desde tu IP residencial.
 * Si tu IP está en una blocklist (cloud, VPN comercial, etc.) saltará captcha.
 *
 *   node scrape.js https://www.idealista.com/inmueble/111008988/
 *
 * Salida: property.json   (pega los campos en ../data.js > property)
 */

const fs = require('fs');
const path = require('path');
const { chromium, firefox } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);
firefox.use(stealth);

const URL = process.argv[2];
if (!URL || !URL.includes('idealista.com/inmueble/')) {
  console.error('Uso: node scrape.js https://www.idealista.com/inmueble/XXXXXXXX/');
  process.exit(1);
}

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
];
const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

async function humanScroll(page) {
  // Scroll natural para parecer humano
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  let pos = 0;
  while (pos < totalHeight) {
    const step = 80 + Math.random() * 200;
    pos += step;
    await page.evaluate(p => window.scrollTo({ top: p, behavior: 'smooth' }), pos);
    await page.waitForTimeout(180 + Math.random() * 280);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(500);
}

async function tryBrowser(browserType, name) {
  console.log(`\n→ Probando con ${name}...`);
  const browser = await browserType.launch({
    headless: false, // visible es más fiable contra DataDome
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--lang=es-ES'
    ]
  });

  const context = await browser.newContext({
    userAgent: ua,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    viewport: { width: 1366, height: 820 },
    extraHTTPHeaders: {
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Sec-Ch-Ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"'
    },
    // Marcadores anti-detección adicionales
    permissions: ['geolocation'],
    geolocation: { latitude: 36.83, longitude: -2.45 } // Almería
  });

  // Eliminar navigator.webdriver
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['es-ES', 'es', 'en'] });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();

  // Calienta la sesión: visita la home primero
  try {
    console.log('  Calentando sesión en idealista.com...');
    await page.goto('https://www.idealista.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000 + Math.random() * 2000);
    await humanScroll(page);
  } catch (e) {
    console.warn('  Aviso home:', e.message);
  }

  // Navega al inmueble
  console.log('  Navegando al anuncio...');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500 + Math.random() * 2500);

  const title = await page.title();
  console.log('  title:', title);

  if (/blocked|captcha|datadome/i.test(title) || (await page.locator('iframe[src*="datadome"]').count()) > 0) {
    console.log('  ⚠ DataDome captcha detectado.');
    console.log('  → Resuelve el captcha MANUALMENTE en la ventana abierta. Pulsando ENTER aquí continuamos.');
    await new Promise(resolve => process.stdin.once('data', resolve));
  }

  await humanScroll(page);

  // -------- EXTRAER DATOS --------
  const data = await page.evaluate(() => {
    const txt = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim().replace(/\s+/g, ' ') : null;
    };
    const txtAll = (sel) => Array.from(document.querySelectorAll(sel)).map(e => e.textContent.trim());
    const num = (s) => {
      if (!s) return null;
      const m = s.replace(/\./g, '').replace(',', '.').match(/[\d.]+/);
      return m ? parseFloat(m[0]) : null;
    };

    // Precio
    const priceTxt = txt('.info-data-price') || txt('[class*="price"]');
    const price = num(priceTxt);

    // Título
    const title = txt('.main-info__title-main') || txt('h1');

    // Localización
    const location = txt('.main-info__title-minor') || txt('[class*="location"]');

    // Features principales (m², habitaciones, etc.)
    const featuresMain = txtAll('.info-features span');
    const allFeatures = txtAll('.details-property-feature-one li');
    const moreFeatures = txtAll('.details-property-feature-two li');
    const allBullets = [...allFeatures, ...moreFeatures, ...txtAll('.details-property li')];

    // Descripción
    const desc = txt('.comment .adCommentsLanguage') || txt('div.comment p');

    // Reference number Idealista
    const reference = (txt('p.txt-ref') || '').replace(/[^\d]/g, '');

    // m² construidos
    let builtArea = null, usableArea = null, plotArea = null, bedrooms = null, bathrooms = null;
    let yearBuilt = null, parking = false, pool = false, terrace = false, storage = false;
    let energyCert = null, floor = null;

    [...featuresMain, ...allBullets].forEach(s => {
      const lo = s.toLowerCase();
      let m;
      if (/construidos/i.test(s) && (m = s.match(/(\d+[\d.]*)\s*m/))) builtArea = num(m[1]);
      else if (/útiles|utiles/i.test(s) && (m = s.match(/(\d+[\d.]*)\s*m/))) usableArea = num(m[1]);
      else if (/parcela|terreno/i.test(s) && (m = s.match(/(\d+[\d.]*)\s*m/))) plotArea = num(m[1]);
      else if (!builtArea && (m = s.match(/^(\d+[\d.]*)\s*m²/))) builtArea = num(m[1]);

      if ((m = s.match(/(\d+)\s*habitaci/i))) bedrooms = parseInt(m[1]);
      if ((m = s.match(/(\d+)\s*baño/i))) bathrooms = parseInt(m[1]);
      if ((m = s.match(/construido en (\d{4})/i))) yearBuilt = parseInt(m[1]);
      if ((m = s.match(/(\d{4})\s*año/i))) yearBuilt = yearBuilt || parseInt(m[1]);

      if (/garaje|parking|plaza de garaje/i.test(s)) parking = true;
      if (/piscina/i.test(s)) pool = true;
      if (/terraza|balcón|balcon/i.test(s)) terrace = true;
      if (/trastero/i.test(s)) storage = true;

      if ((m = s.match(/energético[:\s]*([A-G])/i))) energyCert = m[1];
      if ((m = s.match(/planta\s+(\d+|bajo|baja|ático|atico)/i))) floor = m[0];
    });

    // Galería
    const images = Array.from(document.querySelectorAll('img'))
      .map(i => i.src)
      .filter(s => s && /\.(jpg|jpeg|webp)/i.test(s) && s.includes('idealista'));

    return {
      reference, title, location, price, priceText: priceTxt,
      builtArea, usableArea, plotArea, bedrooms, bathrooms,
      yearBuilt, parking, pool, terrace, storage,
      energyCert, floor,
      featuresMain, featuresAll: allBullets,
      description: desc,
      imagesCount: images.length,
      imagePreview: images[0] || null,
      scrapedAt: new Date().toISOString(),
      url: window.location.href
    };
  });

  // Inferencias adicionales
  if (data.price && data.builtArea) {
    data.pricePerM2 = Math.round(data.price / data.builtArea);
  }

  // Inferir tipo (chalet, piso, ático…)
  const txtMix = ((data.title || '') + ' ' + (data.featuresAll || []).join(' ')).toLowerCase();
  data.type =
    /villa|chalet independiente/i.test(txtMix) ? 'Chalet independiente / Villa' :
    /chalet adosado|chalet pareado/i.test(txtMix) ? 'Chalet adosado/pareado' :
    /ático|atico/i.test(txtMix) ? 'Ático' :
    /piso|apartamento/i.test(txtMix) ? 'Piso/apartamento' :
    /casa/i.test(txtMix) ? 'Casa' : 'Desconocido';

  data.state =
    /a estrenar|obra nueva/i.test(txtMix) ? 'Obra nueva / a estrenar' :
    /reformado|reformada/i.test(txtMix) ? 'Buen estado / reformado' :
    /para reformar|reformar/i.test(txtMix) ? 'A reformar' :
    'Buen estado';

  const outPath = path.join(__dirname, 'property.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('\n✓ Datos extraídos en', outPath);
  console.log('\n──────── RESUMEN ────────');
  console.log(`  Tipo:       ${data.type}`);
  console.log(`  Estado:     ${data.state}`);
  console.log(`  Precio:     ${data.price?.toLocaleString('es-ES')} €`);
  console.log(`  Superficie: ${data.builtArea} m² (útiles ${data.usableArea ?? '?'}, parcela ${data.plotArea ?? '?'})`);
  console.log(`  €/m²:       ${data.pricePerM2?.toLocaleString('es-ES') ?? '?'}`);
  console.log(`  Hab/Baños:  ${data.bedrooms ?? '?'} / ${data.bathrooms ?? '?'}`);
  console.log(`  Año:        ${data.yearBuilt ?? '?'}`);
  console.log(`  Extras:     ${[data.pool && 'piscina', data.parking && 'garaje', data.terrace && 'terraza', data.storage && 'trastero'].filter(Boolean).join(', ') || '—'}`);
  console.log(`  Cert. en.:  ${data.energyCert ?? '?'}`);
  console.log('─────────────────────────\n');
  console.log('→ Próximo paso: edita ../data.js > property con estos valores.\n');

  await browser.close();
  return data;
}

(async () => {
  try {
    await tryBrowser(firefox, 'Firefox');
  } catch (e1) {
    console.error('Firefox falló:', e1.message);
    console.log('→ Reintentando con Chromium...');
    try {
      await tryBrowser(chromium, 'Chromium');
    } catch (e2) {
      console.error('Chromium falló:', e2.message);
      console.error('\nSi DataDome bloquea tu IP, prueba:\n' +
        '  · Conectarte desde otra red (móvil, casa)\n' +
        '  · Usar un proxy residencial (smartproxy/brightdata)\n' +
        '  · Solicitar API oficial: https://developers.idealista.com/access-request\n');
      process.exit(1);
    }
  }
})();
