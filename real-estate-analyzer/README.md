# Real Estate Analyzer · Retamar (Almería)

Informe interactivo en HTML mobile-first para analizar oportunidades inmobiliarias en Retamar y zonas comparables (Almería capital, Almerimar, El Ejido, San José).

## Estructura

```
real-estate-analyzer/
├── index.html        ← Abre esto en el móvil/navegador
├── report.js         ← Lógica de cálculo y gráficos
├── data.js           ← DATOS EDITABLES (inmueble + series macro)
├── scraper/          ← Script Playwright para extraer datos del anuncio
│   ├── scrape.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Uso

### 1. Ver el informe

Abre `index.html` directamente en el navegador (no necesita servidor). En el móvil, sirve la carpeta con cualquier static server:

```bash
cd real-estate-analyzer
python3 -m http.server 8000
# Luego abre http://<tu-ip>:8000 en el móvil
```

### 2. Actualizar con los datos reales del inmueble

Opción A — manual (2 minutos): edita `data.js`, bloque `property`, con los valores reales del anuncio.

Opción B — automática: ejecuta el scraper desde tu equipo local:

```bash
cd scraper
npm install
npx playwright install firefox
node scrape.js https://www.idealista.com/inmueble/111008988/
```

(Más detalles en `scraper/README.md`.)

### 3. Refresca el navegador

El informe recalcula automáticamente:

- Valor justo (fair value)
- Oferta inicial recomendada (ancla a 8% bajo fair value)
- Walk-away price (precio máximo)
- Yield bruto y neto en alquiler larga estancia y vacacional
- TIR proyectada a 10 años combinando plusvalía + rentas
- Comparativa con la base €/m² de Retamar
- Posición vs comparables activos

## Qué hay dentro del informe

| Sección | Qué resuelve |
|---|---|
| **Veredicto** | Recomendación de 1 minuto: comprar/negociar/pasar, con precios objetivo. |
| **Datos inmueble** | Ficha técnica completa (editable). |
| **Histórico 30 años** | Gráfico €/m² de Retamar, Almería, Almerimar, El Ejido, San José (1995-2026). Toggle absoluto / índice base 100. |
| **Benchmark actual** | €/m² hoy por zona, con Δ 5 años y Δ 30 años. |
| **Margen negociación** | Descomposición del precio pedido al fair value, paso a paso, en euros. |
| **Comparables** | 5 comparables activos en Retamar, scatter plot vs inmueble analizado. |
| **ROI** | Yield larga estancia, yield vacacional, proyección plusvalía 10 años (3 escenarios), TIR combinada. |
| **Riesgos** | 10 riesgos cualitativos (0-10) específicos para Retamar / costa Almería. |
| **Due diligence** | Checklist legal/técnico antes de oferta y antes de firmar. |
| **Metodología** | Fuentes y supuestos. |

## Metodología — series 1995-2026

Construidas combinando:

- **Idealista**: informes de precio por zona (2007-2026), incluye Retamar, Almería, Almerimar, San José.
- **Fotocasa**: índice de precio vivienda (2008-2026).
- **Tinsa IMIE**: serie histórica desde 2001 (base 1000).
- **INE**: índice de precio de vivienda (2007+).
- **Ministerio de Vivienda**: precio tasado (1995-2007).

Los datos 1995-2007 son interpolación regional ajustada por provincia: la costa almeriense amplificó el ciclo nacional ~15-20% por concentración de segunda residencia y producto turístico. Los datos 2008-2026 son contrastables directamente con las fuentes citadas en el footer del informe.

## Disclaimer

Este informe es una herramienta de análisis para uso personal del comprador y NO constituye asesoramiento financiero, fiscal ni legal. Las proyecciones de precio se basan en tendencias históricas y no garantizan resultados futuros. Verifica siempre los datos del inmueble directamente con el anunciante y un perito independiente antes de cualquier oferta vinculante.
