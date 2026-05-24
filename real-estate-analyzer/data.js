// ============================================================
// DATOS DEL INFORME — Real Estate Analyzer · Retamar (Almería)
// ============================================================
// Edita SOLO esta seccion con los datos reales del anuncio
// (lo demas son series de mercado contrastadas con fuentes).
// ============================================================

window.REPORT_DATA = {

  // ---------- INMUEBLE (datos confirmados desde el anuncio) ----------
  property: {
    ref: "idealista.com/inmueble/111008988",
    url: "https://www.idealista.com/inmueble/111008988/",
    zone: "Retamar",
    municipality: "Almeria",
    address: "Camino de la Espuela, 59, Retamar",
    type: "Casa o chalet independiente",
    state: "Segunda mano / buen estado",

    askingPrice: 480000,        // confirmado anuncio
    builtArea: 185,             // m2 construidos (confirmado)
    usableArea: 139,            // m2 utiles (confirmado)
    plotArea: 982,              // m2 parcela (confirmado — 3x media Retamar)
    porchArea: 53,              // m2 porche cubierto

    bedrooms: 4,                // 3 dormitorios + 1 despacho/habitacion
    bathrooms: 2,
    floors: 1,                  // toda la vivienda en planta baja

    yearBuilt: null,            // no figura en anuncio (asumir 1995-2005 por arquitectura)
    floor: "1 planta",
    parking: true,              // plaza garaje incluida
    pool: true,                 // confirmado equipamiento
    terrace: true,              // confirmado
    storage: false,             // no figura trastero
    energyCert: "En tramite",   // sin certificado emitido
    heating: false,             // NO dispone de calefaccion (penalty)
    orientation: "Sur, Este",
    wardrobes: true,            // armarios empotrados

    // Caracteristicas singulares (valor cualitativo)
    extras: [
      "Patio andaluz con aljibe (arquitectura sur Espana)",
      "Porche 53 m² acceso a piscina y jardin",
      "Vestidor amplio con vistas al jardin",
      "Cocina con despensa",
      "Despacho independiente",
      "Jardin que rodea toda la casa",
      "Sin comunidad (chalet exento)",
      "13 km centro Almeria / cerca Hospital Toyo, golf y aeropuerto"
    ],

    distanceBeachM: 1100,       // >1km confirmado por usuario
    distanceAirportKm: 4,       // aeropuerto Almeria
    distanceHospitalKm: 1.5,    // Hospital del Toyo
    distanceCenterKm: 13,

    listingAgeWeeks: 5,         // "actualizado hace mas de un mes"
    photosCount: 79,

    communityFeesMonth: 0,      // chalet independiente, sin comunidad
    ibiYear: 580,               // estimado segun valor catastral

    isEstimated: false
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
  // OJO: Espuela 59 esta a >1km de playa. Reduce viabilidad vacacional.
  // longTerm aplica todo el anyo, vacation solo si esta cerca playa.
  rental: {
    longTerm:   { retamar: 10.5, almeria: 9.2,  almerimar: 9.0, ejido: 6.8, sanjose: 12.0 },
    vacation:   { // EUR/dia temporada media, villa 4 hab piscina
      retamar: 280, almeria: 200, almerimar: 250, ejido: 120, sanjose: 350
    },
    occupancyVacationPct: 55,    // % ocupacion realista Retamar cerca playa
    farFromBeachPenaltyPct: -35  // descuento ingresos vacacional si >1km playa
  },

  // ---------- BENCHMARKS Y AJUSTES (modelo tasador) ----------
  // Modelo de valoracion: VALOR TERRENO + VALOR CONSTRUCCION
  // Como hace un tasador profesional (Tinsa, Tasaciones Hipotecarias).
  // El modelo simple €/m² subestima el valor cuando la parcela es grande
  // (caso Espuela 59: parcela 982m² ~ 3x media Retamar).
  benchmarks: {
    retamarAvgPricePerM2_2026: 2400,   // media TODOS tipos (Idealista 2.182 / Fotocasa 2.616)

    // Valor SUELO Retamar por m² (solar urbano residencial)
    // Tier 1 = jardin proximo casa, tier 2 = parcela amplia, tier 3 = excedente segregable
    plotValueTiers: [
      { upto: 200, valuePerM2: 80 },   // primeros 200m² de jardin
      { upto: 500, valuePerM2: 150 },  // siguientes 300m² (parcela amplia)
      { upto: Infinity, valuePerM2: 220 } // excedente real (potencialmente segregable)
    ],

    // Valor CONSTRUCCION por m² (mercado, no reposicion)
    // Para villa Retamar segunda mano en buen estado, lo que paga el comprador
    // por el edificio terminado (incluye prima por evitar obra y trámites).
    constructionValuePerM2: 1900,      // base "buen estado" — calibrado con comparables

    // Ajustes al valor construccion
    constructionAdjustments: {
      reformedPct: 12,                  // si reformado integral: +12%
      noHeatingPct: -4,                 // sin calefaccion: -4%
      energyCertPendingPct: -3,         // cert energetico en tramite/desconocido: -3%
      energyCertGoodPct: 5,             // cert A/B: +5%
      energyCertBadPct: -6,             // cert F/G: -6%
      sourceOrientationPct: 2,          // orientacion sur/este: +2%
      singleFloorPct: 3,                // 1 sola planta (mas accesible, vivienda principal): +3%
      poolPct: 4,                       // piscina propia: +4% sobre valor construccion
      noParkingPct: -3                  // sin garaje: -3%
    },

    // Ajustes generales por ubicacion dentro de Retamar
    // 1km no es catastrofico en Retamar - es zona residencial, no
    // exclusivamente turistica. Penalty moderado, no severo.
    beachProximityAdjPct: {
      "<200m": 8, "200-500m": 0, "500-1000m": -4, ">1000m": -8
    },

    // Premium por extras singulares (valor cualitativo)
    extrasPremiumEur: {
      patioAndaluz: 8000,               // patio singular con aljibe
      bigGardenMature: 12000,           // jardin maduro rodea casa (valor visual)
      noCommunityFees: 5000             // sin comunidad: ahorro percibido
    },

    // Indicadores de mercado para negociacion
    sellingTimeMonths: 4.8,             // tiempo medio para vender en Retamar (Idealista)
    sellerDiscountAvgPct: 6.2,          // descuento medio sobre precio inicial (Idealista 2025)
    listingAgeFlexibilityPct: {         // descuento adicional segun edad anuncio
      "<2sem": 0, "2-6sem": 2, "6-12sem": 4, ">12sem": 7
    }
  },

  // ---------- RIESGOS (matriz cualitativa 0-10, especifica Espuela 59) ----------
  risks: [
    { name:"Sin calefaccion instalada",         level: 6, note:"El anuncio confirma 'no dispone de calefaccion'. Almeria tiene inviernos templados pero diciembre-febrero pide calefaccion al menos por la noche. Coste instalar bomba calor/aerotermia con conductos: 5.000-8.000 €. Aprovechar como palanca de negociacion." },
    { name:"Certificado energetico pendiente",  level: 5, note:"Anuncio dice 'en tramite'. Casa de los 90-00 sin calefaccion + ventanas probablemente no premium = probable E o F. Coste emision: ~150 €. Impacto: si sale F, dificulta hipoteca a algunos bancos y rebaja valor 4-6%." },
    { name:"Aljibe / pozo (verificar legalidad)", level: 5, note:"El anuncio menciona aljibe en patio andaluz. Verificar: (a) si es solo elemento ornamental o pozo activo, (b) si tiene legalizacion CHGuadalquivir, (c) calidad agua si se usa para riego/piscina, (d) ITC de mantenimiento." },
    { name:"Distancia a playa >1km",            level: 4, note:"Limita uso turistico vacacional (los inquilinos de Retamar quieren playa <500m). Ventaja: zona mas tranquila, menos turismo de paso. Bueno para vivienda habitual o segunda residencia familiar." },
    { name:"Parcela grande = mantenimiento",    level: 4, note:"982 m² requieren mantenimiento intensivo: jardinero ocasional (40-80 €/mes), riego automatico, piscina (300-500 €/anyo). Calcular como gasto fijo en la operacion." },
    { name:"Aeropuerto (ruido)",                level: 5, note:"Almeria AP a 4 km. Camino Espuela esta en eje norte-sur de Retamar - cono de aproximacion puede afectar. Comprobar huellas acusticas AESA y la frecuencia real de vuelos (Ryanair, etc)." },
    { name:"Invernaderos colindantes",          level: 4, note:"Al norte de Retamar empieza el mar de plastico de Cabo de Gata. Impacto visual a 1-2 km. Dias de viento sur: olor a pesticida/fitosanitarios ocasional." },
    { name:"Sequia / restricciones agua",       level: 7, note:"Almeria en estres hidrico estructural cronico. Riesgo real de restricciones piscina/riego en proximos veranos. Importante con parcela 982 m² + piscina." },
    { name:"Construccion sin reformar integral", level: 4, note:"'Segunda mano / buen estado' = no reforma reciente. Probables actualizaciones diferidas: instalacion electrica, fontaneria PVC vs PER, ventanas (¿climalit?), aislamiento cubierta. Presupuestar 15-25k para puesta a punto." },
    { name:"Anuncio activo >5 semanas",         level: 3, note:"Aunque permite negociar, tambien hay que preguntarse por que no se ha vendido: ¿precio alto?, ¿vicios ocultos?, ¿zona menos demandada? Investigar." },
    { name:"Liquidez de salida (revender)",     level: 4, note:"Tiempo medio venta en Retamar: 4-6 meses. Para una villa con esta parcela y sin playa cerca, el comprador objetivo es estrecho (familias locales, no extranjeros). Estima 6-9 meses para revender." },
    { name:"Sin comunidad = sin servicios",     level: 2, note:"Como chalet exento no pagas comunidad, pero tampoco tienes mantenimiento de zonas comunes, seguridad ni servicio recoge basura comunitario. Asume tu mismo el mantenimiento exterior." }
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
