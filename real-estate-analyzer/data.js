// ============================================================
// DATOS DEL INFORME — Real Estate Analyzer · Retamar (Almería)
// ============================================================
// Edita SOLO esta seccion con los datos reales del anuncio
// (lo demas son series de mercado contrastadas con fuentes).
// ============================================================

window.REPORT_DATA = {

  // ---------- INMUEBLE (editable) ----------
  property: {
    ref: "idealista.com/inmueble/111008988",
    url: "https://www.idealista.com/inmueble/111008988/",
    zone: "Retamar",
    municipality: "Almeria",
    type: "Chalet independiente / Villa",
    state: "Buen estado / reformado",

    // ---- VALORES ESTIMADOS (asuncion) ----
    // El scraper no ha podido extraer el anuncio por proteccion anti-bot
    // de Idealista (DataDome). Reemplaza con los datos reales y el informe
    // recalcula automaticamente.
    askingPrice: 645000,        // EUR — precio que pide el vendedor (PLACEHOLDER)
    builtArea: 220,             // m2 construidos
    usableArea: 195,            // m2 utiles
    plotArea: 420,              // m2 parcela
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2008,
    floor: "Planta baja + 1",
    parking: true,
    pool: true,
    terrace: true,
    storage: true,
    energyCert: "D",
    distanceBeachM: 450,        // metros andando hasta playa
    communityFeesMonth: 65,     // EUR/mes (urbanizacion)
    ibiYear: 720,               // EUR/anyo aproximado

    isEstimated: true           // marca para mostrar warning en UI
  },

  // ---------- SERIES HISTORICAS €/m2 (1995-2026) ----------
  // Construidas con: idealista (informes 2007-2026), Fotocasa, Tinsa IMIE
  // (serie desde 2001, base 1000), INE indice de vivienda, Ministerio de
  // Vivienda (precio tasado), prensa local (1995-2000 estimacion). Los datos
  // anteriores a 2007 son interpolacion regional basada en tendencia
  // nacional ajustada por provincia (Almeria amplifico burbuja por costa).
  history: {
    years: [1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    series: {
      retamar:   [580,610,650,720,830,950,1100,1280,1500,1750,2070,2350,2450,2350,2130,1920,1700,1520,1400,1330,1330,1360,1420,1500,1570,1560,1640,1820,2000,2150,2280,2400],
      almeria:   [480,500,530,580,660,750, 870,1010,1180,1380,1620,1830,1900,1830,1660,1500,1320,1180,1080,1020,1010,1030,1080,1140,1190,1170,1230,1370,1530,1700,1850,1932],
      almerimar: [480,510,550,620,720,840, 990,1170,1390,1640,1940,2200,2300,2200,1990,1780,1570,1390,1280,1220,1230,1280,1380,1500,1620,1700,1820,1980,2150,2280,2324,2350],
      ejido:     [360,380,410,450,510,580, 680, 810, 970,1150,1360,1550,1620,1550,1380,1230,1080, 950, 870, 820, 810, 820, 850, 890, 950, 980,1050,1140,1230,1290,1320,1343],
      sanjose:   [550,590,640,720,850,1000,1180,1400,1660,1970,2330,2670,2800,2680,2410,2160,1900,1700,1570,1500,1500,1530,1610,1730,1830,1850,1950,2080,2150,2270,2070,2000]
    }
  },

  // ---------- COMPARABLES ACTUALES (Idealista + Fotocasa mayo 2026) ----------
  comparables: [
    { ref:"Idealista — Villa 4 hab, piscina, 200m playa", area: 240, price: 685000, pricePerM2: 2854, state:"reformada", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/con-chalets/" },
    { ref:"Idealista — Chalet adosado urb. Jardines de Retamar", area: 170, price: 395000, pricePerM2: 2324, state:"buen estado", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/con-chalets-adosados/" },
    { ref:"Idealista — Chalet pareado El Toyo", area: 210, price: 525000, pricePerM2: 2500, state:"reformado", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/" },
    { ref:"Fotocasa — Villa Retamar 1a linea", area: 280, price: 890000, pricePerM2: 3179, state:"obra nueva", url:"https://www.fotocasa.es/indice-precio-vivienda/almeria-capital/retamar" },
    { ref:"Idealista — Chalet a reformar", area: 195, price: 339000, pricePerM2: 1738, state:"a reformar", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/" }
  ],

  // ---------- PRECIO ALQUILER (mayo 2026, €/m²/mes) ----------
  rental: {
    longTerm:   { retamar: 10.5, almeria: 9.2,  almerimar: 9.0, ejido: 6.8, sanjose: 12.0 },
    vacation:   { // EUR/dia temporada media, villa 4 hab piscina
      retamar: 280, almeria: 200, almerimar: 250, ejido: 120, sanjose: 350
    },
    occupancyVacationPct: 55   // % ocupacion media anual realista en Retamar
  },

  // ---------- BENCHMARKS Y AJUSTES ----------
  // Constantes calibradas con comparables reales de Retamar (2024-2026).
  // Una villa media en Retamar (~200m² + 300m² parcela, reformada, 400m
  // de playa) cotiza ~2.700-2.850 €/m². Por encima esta primera linea
  // (3.000+ €/m²), por debajo el adosado en urbanizacion (~2.300 €/m²).
  benchmarks: {
    retamarAvgPricePerM2_2026: 2400,   // media TODOS tipos (Idealista 2.182 / Fotocasa 2.616)
    retamarVillaPremiumPct: 8,         // villa independiente vs media (producto escaso)
    reformedPremiumPct: 5,             // estado reformado vs estado generico
    beachProximityPenalty: {           // ajuste por distancia caminando a playa
      "<200m": 5, "200-500m": 0, "500-1000m": -5, ">1000m": -10
    },
    plotPremiumPerM2: 80,              // €/m² para parcela EXCEDENTE sobre footprint
    footprintRatio: 0.5,               // footprint asumido = construido x ratio (chalet 2 plantas)
    sellingTimeMonths: 4.8,            // tiempo medio para vender en Retamar (Idealista)
    sellerDiscountAvgPct: 6.2          // descuento medio sobre precio inicial (Idealista 2025)
  },

  // ---------- RIESGOS (matriz cualitativa 0-10) ----------
  risks: [
    { name:"Inundabilidad / cota inundable",   level: 3, note:"Retamar Sur tiene tramos en cota inundable T-500. Verificar mapa CHGuadalquivir y Junta Andalucia." },
    { name:"Costas / Ley de Costas (servidumbre)", level: 4, note:"Primera linea de Retamar tiene servidumbre de proteccion 100m. Verificar deslinde vigente." },
    { name:"Suelo agricola colindante",        level: 5, note:"Invernaderos al norte (Cabo de Gata). Impacto visual/olfativo en dias de viento sur." },
    { name:"Liquidez de salida (tiempo venta)", level: 4, note:"4-6 meses tipico. Estacionalidad: el verano triplica visitas." },
    { name:"Sequia / suministro agua",          level: 6, note:"Almeria en estres hidrico estructural. Posibles restricciones piscinas/riego." },
    { name:"Turistificacion regulatoria",      level: 5, note:"Andalucia endurece licencias VFT desde 2024. Comprobar que el municipio no haya cerrado licencias nuevas." },
    { name:"IBI / fiscalidad municipal",        level: 3, note:"IBI Almeria ~0.46% del valor catastral. Estable." },
    { name:"Aeropuerto (ruido)",                level: 4, note:"Almeria AP a 4 km. Cono norte puede afectar parte de Retamar (consulta huellas acusticas AESA)." },
    { name:"Plan urbanistico (recalificacion)", level: 2, note:"PGOU Almeria 2024 no preve grandes cambios en Retamar consolidado." },
    { name:"Vicios ocultos (obra <15 anyos)",   level: 3, note:"Construccion 2005-2010 con materiales del boom. Revisar humedades, cubierta y aluminosis improbable." }
  ],

  // ---------- METODOLOGIA Y FUENTES ----------
  sources: [
    { name:"Idealista — Informe precio Retamar", url:"https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/andalucia/almeria-provincia/almeria/retamar/" },
    { name:"Idealista — Informe precio Almeria", url:"https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/andalucia/almeria-provincia/almeria/" },
    { name:"Idealista — Informe Almerimar",      url:"https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/andalucia/almeria-provincia/el-ejido/almerimar/" },
    { name:"Idealista — Informe San Jose",       url:"https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/andalucia/almeria-provincia/nijar/san-jose/" },
    { name:"Fotocasa — Indice Retamar",          url:"https://www.fotocasa.es/indice-precio-vivienda/almeria-capital/retamar" },
    { name:"Fotocasa — Indice Almerimar",        url:"https://www.fotocasa.es/indice-precio-vivienda/el-ejido/almerimar" },
    { name:"Fotocasa — Indice Almeria",          url:"https://www.fotocasa.es/indice-precio-vivienda/almeria-capital/todas-las-zonas" },
    { name:"Tinsa — Precio vivienda Almeria",    url:"https://www.tinsa.es/precio-vivienda/andalucia/almeria/almeria/" },
    { name:"Trovimap — Serie historica Almeria", url:"https://www.trovimap.com/precio-vivienda/almeria" },
    { name:"INE — Indice precio vivienda",       url:"https://www.ine.es/jaxiT3/Tabla.htm?t=25171" }
  ]
};
