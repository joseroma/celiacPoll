# Idealista Scraper

Extrae automáticamente todos los datos de un anuncio de Idealista y los vuelca a `property.json` para pegarlos en `../data.js`.

## Por qué este scraper existe

Idealista usa **DataDome**, uno de los anti-bot más estrictos. Desde IPs de cloud (AWS, GCP, Azure, Docker en cloud, etc.) bloquea HTTP 403 todo lo que viene. Por eso este informe no se pudo construir directamente desde el agente.

**Desde tu IP residencial sí debería funcionar** porque DataDome no bloquea residenciales por defecto, solo te puede pedir captcha alguna vez.

## Uso

```bash
cd real-estate-analyzer/scraper
npm install
npx playwright install firefox chromium
node scrape.js https://www.idealista.com/inmueble/111008988/
```

El script abre Firefox visible (no headless — clave para no ser detectado), navega como un humano (warm-up + scroll natural), extrae los datos y los guarda en `property.json`.

**Si salta captcha:** lo resuelves a mano en la ventana abierta y pulsas ENTER en el terminal. El script sigue.

## Salida

```json
{
  "reference": "111008988",
  "type": "Chalet independiente / Villa",
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
  ...
}
```

## Pegar los datos en el informe

Abre `../data.js`, busca el bloque `property: { ... }` y reemplaza los valores. Refresca `index.html` y el informe se recalcula entero (verdict, fair value, oferta, ROI, gráficos).

## Si nada funciona

1. **Cambia de red** (datos móvil, otra wifi).
2. **Proxy residencial** (Smartproxy, BrightData) — más caro pero garantizado.
3. **API de scraping comercial**: ScrapingBee, ZenRows o ScraperAPI manejan DataDome por ti (~0.5-2€ por anuncio). Tienen tier gratis de 1000 requests/mes.
4. **API oficial de Idealista**: https://developers.idealista.com/access-request (requiere aprobación manual, 1-2 semanas).

## Alternativa: copiar a mano

El informe está diseñado para que rellenar 8 campos en `data.js` te lleve 2 minutos:

```javascript
property: {
  askingPrice: ___,     // del anuncio
  builtArea: ___,       // m² construidos
  usableArea: ___,      // m² útiles
  plotArea: ___,        // m² parcela (si es chalet)
  bedrooms: ___,
  bathrooms: ___,
  yearBuilt: ___,
  distanceBeachM: ___,  // estima con Google Maps
  ...
}
```
