# Idealista Scraper

Tres rutas para extraer los datos del anuncio. Todas vuelcan a `property.json` con el mismo formato.

## Por qué hace falta un scraper

Idealista usa **DataDome** (anti-bot top tier). Desde IPs cloud (AWS/GCP/Docker) responde HTTP 403 a todo. **Desde tu IP residencial sí funciona** — DataDome no bloquea residenciales por defecto, solo te puede pedir captcha esporádicamente.

## Opción 1 · Node + Playwright stealth (recomendado)

Es la más fiable porque renderiza JavaScript y simula un humano (Firefox visible, scroll natural, warm-up).

```bash
cd real-estate-analyzer/scraper
npm install
npx playwright install firefox
node scrape.js https://www.idealista.com/inmueble/111008988/
```

Si salta captcha, lo resuelves a mano en la ventana abierta y pulsas ENTER en terminal — el script sigue.

## Opción 2 · Python + Scrapy

Adaptado de [David-Carrasco/Scrapy-Idealista](https://github.com/David-Carrasco/Scrapy-Idealista) para páginas individuales `/inmueble/`. Más rápido pero sin JavaScript, así que si Idealista te sirve la página de captcha falla.

```bash
cd real-estate-analyzer/scraper
pip install -r requirements.txt
python scrape_py.py https://www.idealista.com/inmueble/111008988/
```

Para añadir proxies residenciales (Smartproxy/BrightData/Oxylabs), edita la lista `PROXIES_LIST` al principio de `scrape_py.py`.

## Opción 3 · Copiar a mano (2 minutos)

Si nada de lo anterior funciona, abre `../data.js` y rellena estos campos del bloque `property`:

```javascript
askingPrice: ___,     // precio del anuncio
builtArea: ___,       // m² construidos
usableArea: ___,      // m² útiles
plotArea: ___,        // m² parcela (chalets)
bedrooms: ___,
bathrooms: ___,
yearBuilt: ___,
distanceBeachM: ___,  // estima con Google Maps
pool: true/false,
parking: true/false,
energyCert: "A"/"B"/.../"G",
state: "Buen estado / reformado"  // o el que aplique
```

Refresca `index.html` y todo el informe se recalcula (verdict, fair value, oferta, walk-away, ROI, gráficos).

## Salida común

Ambos scrapers generan `property.json` con esta forma:

```json
{
  "reference": "111008988",
  "type": "Chalet independiente / Villa",
  "state": "Buen estado / reformado",
  "price": 595000,
  "builtArea": 220,
  "usableArea": 195,
  "plotArea": 420,
  "bedrooms": 4,
  "bathrooms": 3,
  "yearBuilt": 2008,
  "pool": true,
  "parking": true,
  "energyCert": "D",
  "...": "..."
}
```

Pega los valores en `../data.js > property` y recarga el navegador.

## Si nada funciona (IP residencial bloqueada)

1. **Cambia de red** (datos móvil, otra wifi de un vecino, hotspot).
2. **Proxy residencial**: Smartproxy/BrightData/Oxylabs — desde 5€/GB. Edita `PROXIES_LIST` en `scrape_py.py`.
3. **API comercial todo-en-uno**: ScrapingBee, ZenRows, ScraperAPI (~0.5-2€/anuncio, tier gratis ~1000 req/mes). Manejan DataDome por ti.
4. **API oficial Idealista**: <https://developers.idealista.com/access-request>. Gratis pero requiere aprobación manual (1-2 semanas).
