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

  // ---------- ANÁLISIS DE EXPERTO INMOBILIARIO ----------
  // Asesoramiento profesional: timing, proyección, financiación, TCO
  expertView: {

    // --- PERFIL DEL COMPRADOR ---
    buyerProfile: {
      age: 30,
      firstHome: true,
      family: 'Matrimonio + 2 niños + perro mediano',
      horizonYears: 25,                // años previstos de tenencia
      description: 'Comprador joven (30 años) en su primera vivienda. Capital propio €230k (venta vivienda anterior + bonus), horizonte largo, sin urgencia financiera.',
      strengthsOfThisProfile: [
        'Horizonte de tenencia largo → diluye riesgo de timing del ciclo',
        'Edad permite plazos de hipoteca hasta 35-40 años (banca extiende hasta 70 años al cancelar)',
        '€230k de capital = LTV 58% → perfil premium para banca, condiciones mejorables',
        'Sin patrimonio inmobiliario previo → toda la atención y capital en este activo único'
      ],
      // Beneficios fiscales y de financiación específicos primer comprador <35
      firstHomeBenefits: [
        {
          applies: false,
          title: 'ITP reducido 3,5% Andalucía',
          detail: 'NO APLICA: el ITP reducido para menores de 35 + primera vivienda está limitado a viviendas hasta €150.000. Espuela 59 (€465-480k) lo supera. El ITP queda en el 7% normal Andalucía 2026.',
          impact: 0
        },
        {
          applies: false,
          title: 'Aval ICO 20% jóvenes <35',
          detail: 'NO NECESARIO: el aval ICO está diseñado para compradores sin capital de entrada. Con vuestros €230k, el LTV se sitúa en 58% sin avales — perfil mejor que el que el aval intenta resolver.',
          impact: 0
        },
        {
          applies: 'maybe',
          title: 'Bonificación TIN "joven primer comprador"',
          detail: 'Algunos bancos ofrecen -0,05% a -0,10% adicional sobre TIN base si demuestras ser primer comprador menor de 35. Sondea explícitamente: ING, Openbank y Bankinter lo aplican.',
          impact: 'hasta -€2.500 en intereses totales 30 años'
        },
        {
          applies: 'maybe',
          title: 'Deducción IRPF autonómica Andalucía',
          detail: 'Vivienda habitual con renta familiar < €24.000/año: 2% deducción. Si vuestros ingresos lo permiten, verificar con asesor. Vivienda > €150k: deducción puede limitarse.',
          impact: 'hasta €960/año si aplica'
        },
        {
          applies: true,
          title: 'Plazo de hipoteca extendido (hasta 40 años)',
          detail: 'A los 30 años, la mayoría de bancos te financian hasta 40 años (límite normal: cancelación antes de 70 años → 30+40=70). Esto te permite plazo largo para cuota baja y libertad financiera.',
          impact: 'Cuota -€259/mes vs 25 años'
        }
      ]
    },

    // --- A. Contexto macro mayo 2026 ---
    macro: {
      reportDate: "mayo 2026",
      ecbMainRate: 2.25,            // BCE main refi rate (bajado de 4.50% pico 2023)
      euribor12m: 2.30,             // Euribor 12m mayo 2026
      inflationESP: 2.6,            // IPC España interanual
      housePriceCagrESP_5y: 5.8,    // Apreciación nacional media 5 años
      housePriceCagrRetamar_5y: 4.9,// Apreciación Retamar 5 años
      population: {
        almeria: 760000,
        almeriaCity: 200000,
        annualGrowth: 1.3           // % crecimiento anual Almeria (entre los mas altos Espanya)
      },
      driversFavorable: [
        { label: 'Tipos en descenso desde 2023', detail: 'BCE bajo del 4,50% al 2,25% entre 2023-2026. Hipotecas mas baratas que en 2 años.' },
        { label: 'Demografia Almeria al alza', detail: '+1,3% poblacion/año, top 10 provincias Espanya. Demanda real sostenida.' },
        { label: 'Inflacion controlada (2,6%)', detail: 'Vuelta a objetivo BCE. Activos fisicos protegen capital.' },
        { label: 'Energia solar atrae inversion', detail: 'Almeria lider FV en Espanya. Empleos cualificados creando demanda residencial.' },
        { label: 'Hospital Toyo expansion', detail: 'Atrae profesionales sanitarios alta cualificacion. Vector demanda zona.' },
        { label: 'Inversion extranjera estable', detail: 'Almeria 4o destino UK/Holanda/Belgica para segunda residencia/jubilacion.' }
      ],
      driversUnfavorable: [
        { label: 'Sequia estructural Almeria', detail: 'Restricciones agua posibles. Impacto medio plazo turismo y piscinas.' },
        { label: 'Posible recesion EU 2026-27', detail: 'Si llega, correccion -5% a -10% en zonas no primera linea.' },
        { label: 'Tipos podrian bajar mas', detail: 'BCE podria bajar al 1,75% en 2027. Esperar = hipoteca mas barata pero precio activos sube.' },
        { label: 'Mar de plastico al norte', detail: 'Cabo de Gata invernaderos a 2-3 km. Impacto visual y olores ocasionales.' }
      ],
      timingScore: 8.1,             // 0-10, ranking experto sobre si es buen momento
      timingVerdict: 'COMPRAR AHORA',
      timingRationale: 'Convergen 5 senyales positivas: (1) tipos competitivos sin esperar bajada incierta, (2) precio Espuela 59 bajo fair value, (3) capital propio fuerte que reduce LTV y mejora condiciones banca, (4) horizonte familiar largo (>10 años) que diluye riesgo timing, (5) producto unico (parcela 982 m²) dificil de reemplazar.'
    },

    // --- B. Histórico y proyección €/m² Retamar 2003-2036 ---
    priceHistory: [
      { year: 2003, p: 1400 }, { year: 2005, p: 2150 }, { year: 2007, p: 2820 },
      { year: 2009, p: 2400 }, { year: 2011, p: 1820 }, { year: 2013, p: 1500 },
      { year: 2015, p: 1650 }, { year: 2017, p: 1850 }, { year: 2019, p: 2000 },
      { year: 2021, p: 2150 }, { year: 2023, p: 2280 }, { year: 2024, p: 2330 },
      { year: 2025, p: 2370 }, { year: 2026, p: 2400 }
    ],

    // Proyección 3 escenarios 2027-2036 (€/m² Retamar)
    priceProjection: [
      { year: 2027, pess: 2304, base: 2472, opt: 2520 },
      { year: 2028, pess: 2350, base: 2546, opt: 2646 },
      { year: 2029, pess: 2397, base: 2622, opt: 2778 },
      { year: 2030, pess: 2445, base: 2701, opt: 2917 },
      { year: 2031, pess: 2494, base: 2782, opt: 3063 },
      { year: 2032, pess: 2544, base: 2865, opt: 3216 },
      { year: 2033, pess: 2595, base: 2951, opt: 3377 },
      { year: 2034, pess: 2647, base: 3040, opt: 3546 },
      { year: 2035, pess: 2700, base: 3131, opt: 3723 },
      { year: 2036, pess: 2754, base: 3225, opt: 3909 }
    ],

    // Valor estimado Espuela 59 cada año (fair value, base case)
    // Asume suelo crece 4%/año, construccion 2.5%/año, extras estable
    espuela59Projection: [
      { year: 2026, suelo: 112340, constr: 329023, extras: 25000, total: 466363 },
      { year: 2027, suelo: 116834, constr: 337249, extras: 25000, total: 479083 },
      { year: 2028, suelo: 121507, constr: 345680, extras: 25000, total: 492187 },
      { year: 2029, suelo: 126367, constr: 354322, extras: 25000, total: 505689 },
      { year: 2030, suelo: 131422, constr: 363180, extras: 25000, total: 519602 },
      { year: 2031, suelo: 136679, constr: 372260, extras: 25000, total: 533939 },
      { year: 2032, suelo: 142146, constr: 381567, extras: 25000, total: 548713 },
      { year: 2033, suelo: 147832, constr: 391106, extras: 25000, total: 563938 },
      { year: 2034, suelo: 153745, constr: 400884, extras: 25000, total: 579629 },
      { year: 2035, suelo: 159895, constr: 410906, extras: 25000, total: 595801 },
      { year: 2036, suelo: 166291, constr: 421179, extras: 25000, total: 612470 }
    ],

    // --- C. Financiación: capital propio + estructura ---
    financing: {
      buyerCash: {
        previousHouseSale: 200000,    // dato usuario
        bonus: 30000,                  // dato usuario
        total: 230000
      },
      closingCostsRules: {
        itpAndaluciaPct: 7.0,          // ITP Andalucia segunda mano 2026
        notaria: 1000,
        registro: 600,
        gestoria: 400,
        tasacion: 450,
        bankOpeningFeesPct: 0          // negociable a 0% para perfil bueno
      }
    },

    // --- D. Hipoteca · escenarios reales mayo 2026 ---
    mortgageMarketMay2026: {
      euribor12m: 2.30,
      bestFijaTIN: 2.69,             // ING Naranja con nomina
      avgFijaTIN: 2.95,              // media bancos grandes con vinculacion
      avgVariableDiff: 0.65,          // Euribor + diferencial medio
      scenarios: [
        {
          id: 'fija25',
          name: 'Hipoteca FIJA 25 años',
          type: 'fija',
          tin: 2.85,
          tae: 3.10,
          years: 25,
          vinculacion: 'Nómina + seguro hogar',
          ageFinish: 55,
          pros: ['Hipoteca cancelada a los 55 años', 'Menos intereses totales (€107k)', 'Cuota manejable si renta consolidada'],
          cons: ['Cuota más alta (€1.259/mes) reduce margen para ahorro/inversión', 'Menos flexibilidad si nacen más hijos o cambian circunstancias']
        },
        {
          id: 'fija30',
          name: 'Hipoteca FIJA 30 años (RECOMENDADA para 30 años edad)',
          type: 'fija',
          tin: 2.85,
          tae: 3.10,
          years: 30,
          vinculacion: 'Nómina + seguro hogar',
          ageFinish: 60,
          recommended: true,
          pros: ['Cuota baja (€1.117/mes) — €142/mes más para ahorrar/invertir', 'Hipoteca cancelada a los 60 años (5 años antes de jubilación)', 'Permite estrategia: cuota base baja + amortización anticipada con pagas extra'],
          cons: ['€24k más en intereses totales vs 25 años', 'Si no amortizas anticipadamente, pagas más']
        },
        {
          id: 'fija35',
          name: 'Hipoteca FIJA 35 años',
          type: 'fija',
          tin: 2.95,                   // ligeramente más alto plazos largos
          tae: 3.20,
          years: 35,
          vinculacion: 'Nómina + seguro hogar',
          ageFinish: 65,
          pros: ['Cuota mínima (~€1.030/mes) → máximo margen mensual', 'Permite máximo ahorro/inversión paralelo a la hipoteca'],
          cons: ['€55k más en intereses totales vs 25 años', 'Hipoteca activa hasta los 65 años', 'TIN ligeramente superior (riesgo plazo)']
        },
        {
          id: 'fija40',
          name: 'Hipoteca FIJA 40 años (límite máximo)',
          type: 'fija',
          tin: 3.10,
          tae: 3.35,
          years: 40,
          vinculacion: 'Nómina + seguro hogar + plan pensiones',
          ageFinish: 70,
          pros: ['Cuota mínima absoluta (~€965/mes)', 'Posible solo por edad joven (30) — ventana única'],
          cons: ['€87k más en intereses totales vs 25 años', 'Pocos bancos lo ofrecen (ING, Openbank en algunos casos)', 'Hipoteca te acompaña hasta los 70 años — fin de la vida laboral']
        },
        {
          id: 'mixta30',
          name: 'Hipoteca MIXTA 5y fija + Euribor (a 30 años)',
          type: 'mixta',
          tinInitial: 2.50,            // primeros 5 años
          tinAfter: 2.90,              // estimado
          tae: 2.85,
          years: 30,
          fixedYears: 5,
          vinculacion: 'Nómina + seguro hogar',
          ageFinish: 60,
          pros: ['Cuota baja primeros 5 años críticos (niños pequeños)', 'Si tipos bajan en 2030, te beneficias', 'Tiempo para amortizar antes de la variable'],
          cons: ['Incertidumbre tras año 5 (cuota subiría hasta ~€1.150/mes con Euribor base)', 'Requiere disciplina para amortizar capital antes del cambio']
        }
      ]
    },

    // --- E. Gastos recurrentes propiedad (anuales) ---
    propertyOpex: {
      ibiYear: 580,                    // estimado parcela 982 + construido 185
      basuraYear: 95,
      seguroHogarYear: 380,            // todo riesgo + contenido villa
      mantenimientoPiscinaYear: 480,   // productos + manten. propia
      mantenimientoJardinYear: 720,    // jardinero 1 vez/mes promedio
      mantenimientoEstructuralYear: 1200, // reserva 0.25% valor casa
      suministrosLuzGasAguaYear: 2400, // familia 4 personas
      cuotaCommunidadYear: 0,          // sin comunidad
      total: 5855                      // suma año 1 (sin contar hipoteca)
    },

    // --- F. Checklist experto pre-compra ---
    expertChecklist: [
      { category: 'Documental (ANTES de arras)', items: [
        'Nota simple del Registro de la Propiedad (cargas, embargos, hipotecas)',
        'Certificado de no deudas con la comunidad (no aplica aqui)',
        'Ultimo recibo de IBI pagado',
        'Certificado catastral coincidente con la realidad',
        'Cedula de habitabilidad o licencia de primera ocupacion',
        'Certificado energetico EMITIDO (no en tramite)',
        'Verificar legalizacion del aljibe (CHGuadalquivir)'
      ]},
      { category: 'Inspeccion fisica (con perito)', items: [
        'ITE/IEE si la construccion tiene >30 años',
        'Estado cubierta y tejado (drone si es posible)',
        'Humedades en muros y suelos',
        'Estado instalacion electrica (cuadro, diferencial, RCD)',
        'Fontaneria (presion, fugas, materiales)',
        'Carpinteria exterior (climalit, rotura puente termico)',
        'Estado piscina (depuradora, vaso, depuradora)',
        'Vallado perimetral y muros parcela',
        'Posibles aluminosis (poco probable construccion >1995)'
      ]},
      { category: 'Mercado y negociacion', items: [
        'Tiempo del anuncio activo (5+ semanas = flexibilidad vendedor)',
        'Si el precio se ha bajado: lo conviertes en palanca',
        'Comparables vendidos REALMENTE en los ultimos 6 meses (no listados)',
        'Verificar que no hay sobreoferta (segunda visita en otro horario)',
        'Pedir al agente: "¿alguna otra oferta sobre la mesa?"',
        'Ofertar por escrito con plazo de respuesta 48-72h'
      ]},
      { category: 'Financiacion · pre-aprobacion ANTES de oferta', items: [
        'Pre-aprobacion hipoteca de 2-3 bancos antes de hacer ofertas',
        'Comparar TAE, no solo TIN (incluye seguros y comisiones)',
        'Negociar: comision apertura, amortizacion anticipada, vinculacion minima',
        'Vinculacion CRUZADA: si exiges seguros, que sean comparables al mercado',
        'Plazo razonable: 25 años es el sweet spot (cuota manejable + intereses moderados)'
      ]},
      { category: 'Legales · CON abogado independiente', items: [
        'Arras penitenciales (no confirmatorias) - permiten desistir',
        'Importe arras: 10% del precio cierre es lo estandar',
        'Plazo entre arras y escritura: 60-90 dias',
        'Clausula de financiacion (si no obtienes hipoteca, recuperas arras)',
        'Verificar IBI y plusvalia municipal del vendedor',
        'Reparto de gastos notaria/registro segun ley'
      ]}
    ]
  },
  comparables: [
    {
      id: 'A',
      shortName: 'Adosado Retamar',
      headline: 'Chalet adosado · €425k',
      url: '',
      type: 'Chalet adosado',
      askingPrice: 425000,
      originalPrice: 450000,           // rebajado
      builtArea: 170,
      usableArea: 100,
      plotArea: 390,
      bedrooms: 3,
      bathrooms: 2,
      floors: 2,                       // estimado adosado
      yearBuilt: 2005,
      state: 'Segunda mano / buen estado',
      heating: true,                   // bomba frío/calor
      ac: true,
      pool: 'private',
      poolType: 'privada',
      parking: true,
      garden: true,
      energyCert: 'En tramite',
      orientation: 'Oeste',
      community: 0,                    // dato no claro, asumido 0
      distanceBeachM: 900,             // Retamar interior estimado
      distanceSchoolKm: 0.8,
      listingAgeWeeks: 3,
      pricePerM2: 2500
    },
    {
      id: 'B',
      shortName: 'Dúplex Toyo',
      headline: 'Pareado dúplex · Toyo · €360k',
      url: '',
      type: 'Pareado dúplex',
      askingPrice: 360000,
      originalPrice: 374000,
      builtArea: 110,
      usableArea: 95,
      plotArea: 160,
      bedrooms: 3,
      bathrooms: 3,
      floors: 2,
      yearBuilt: 2005,
      state: 'Segunda mano / buen estado',
      heating: false,
      ac: true,
      pool: 'community',
      poolType: 'comunitaria (+ padel)',
      parking: true,
      garden: false,                   // jardin comunitario
      energyCert: 'E',                 // consumo y emisiones E
      orientation: 'Este-Oeste',
      community: 110,                  // residencial cerrado con servicios
      distanceBeachM: 1500,            // Toyo más interior
      distanceSchoolKm: 0.5,
      distanceHospitalKm: 0.4,         // 5 min walking
      listingAgeWeeks: 1,
      pricePerM2: 3273
    },
    {
      id: 'C',
      shortName: 'Indep. 375k Retamar',
      headline: 'Chalet independiente · €375k',
      url: '',
      type: 'Casa o chalet independiente',
      askingPrice: 375000,
      originalPrice: 375000,
      builtArea: 139,
      usableArea: 126,
      plotArea: 421,
      bedrooms: 3,
      bathrooms: 2,
      floors: 2,                       // estimado (no consta)
      yearBuilt: 2009,
      state: 'Segunda mano / buen estado',
      heating: true,                   // individual
      ac: false,                       // no mencionado
      pool: 'private',
      poolType: 'privada',
      parking: true,
      garden: true,
      energyCert: 'E',                 // E consumo / D emisiones
      energyCertEmissions: 'D',
      kwhPerM2Year: 138.47,
      orientation: 'Este, Oeste',
      community: 80,
      distanceBeachM: 1000,            // Retamar zona similar a Espuela (estimado)
      distanceSchoolKm: 1.0,
      listingAgeWeeks: 4,
      pricePerM2: 2698,
      extras: ['Vestidor', 'Baño en suite', 'Solarium', 'Barbacoa', 'Casita madera']
    }
  ],

  // ---------- PERFIL FAMILIAR del comprador ----------
  // Para que el informe valore las opciones desde la lente concreta del usuario.
  familyProfile: {
    description: 'Matrimonio + 2 niños + perro mediano',
    members: { adults: 2, children: 2, dogs: 1, dogSize: 'mediano' },
    priorities: [
      { key: 'outdoorSpace', label: 'Espacio exterior (perro + niños)', weight: 20 },
      { key: 'bedrooms',     label: 'Habitaciones suficientes',          weight: 12 },
      { key: 'singleFloor',  label: 'Vivienda 1 planta (seguridad niños/perro)', weight: 10 },
      { key: 'comfortDay1',  label: 'Confort día 1 (calefacción + cert)', weight: 10 },
      { key: 'totalCost',    label: 'Coste mensual recurrente',           weight: 10 },
      { key: 'schoolDist',   label: 'Cercanía colegios/servicios',        weight: 8  },
      { key: 'flexibility',  label: 'Sin reglas comunidad (perro libre)', weight: 8  },
      { key: 'safety',       label: 'Seguridad / entorno cerrado',        weight: 5  },
      { key: 'futureValue',  label: 'Revalorización 20 años',             weight: 10 },
      { key: 'liquidity',    label: 'Liquidez si hay que revender',       weight: 7  }
    ],
    // Scoring 0-10 para cada propiedad (incluye Espuela 59 = 'P')
    scores: {
      'P': { outdoorSpace: 10, bedrooms: 10, singleFloor: 10, comfortDay1: 4,  totalCost: 9, schoolDist: 7, flexibility: 10, safety: 7,  futureValue: 10, liquidity: 5 },
      'A': { outdoorSpace: 6,  bedrooms: 7,  singleFloor: 3,  comfortDay1: 9,  totalCost: 8, schoolDist: 8, flexibility: 8,  safety: 6,  futureValue: 6,  liquidity: 8 },
      'B': { outdoorSpace: 2,  bedrooms: 7,  singleFloor: 1,  comfortDay1: 8,  totalCost: 6, schoolDist: 9, flexibility: 4,  safety: 10, futureValue: 7,  liquidity: 8 },
      'C': { outdoorSpace: 7,  bedrooms: 7,  singleFloor: 3,  comfortDay1: 9,  totalCost: 7, schoolDist: 8, flexibility: 7,  safety: 6,  futureValue: 7,  liquidity: 8 }
    }
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

  // ---------- COMPARABLES MERCADO ABIERTO (Idealista + Fotocasa mayo 2026) ----------
  // Listado generico de otros chalets en venta en Retamar (no son los favoritos
  // del usuario, solo contexto de mercado para el chart de dispersion m²/€)
  marketComparables: [
    { ref:"Idealista — Villa 4 hab, piscina, 200m playa", area: 240, price: 685000, pricePerM2: 2854, state:"reformada", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/con-chalets/" },
    { ref:"Idealista — Chalet adosado urb. Jardines de Retamar", area: 170, price: 395000, pricePerM2: 2324, state:"buen estado", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/con-chalets-adosados/" },
    { ref:"Idealista — Chalet pareado El Toyo", area: 210, price: 525000, pricePerM2: 2500, state:"reformado", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/" },
    { ref:"Fotocasa — Villa Retamar 1a linea", area: 280, price: 890000, pricePerM2: 3179, state:"obra nueva", url:"https://www.fotocasa.es/indice-precio-vivienda/almeria-capital/retamar" },
    { ref:"Idealista — Chalet a reformar", area: 195, price: 339000, pricePerM2: 1738, state:"a reformar", url:"https://www.idealista.com/venta-viviendas/almeria/retamar/" }
  ],

  // ---------- PRECIO ALQUILER (mayo 2026, €/m²/mes) ----------
  // OJO: Espuela 59 esta a >1km de playa. Reduce viabilidad vacacional.
  // longTerm aplica todo el año, vacation solo si esta cerca playa.
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
    // Calibrado con los 4 comparables reales del usuario:
    //   Espuela 59 (185m², sin calef): asking 480k → fair ~520k → OPORTUNIDAD
    //   Adosado (170m², con calef):    asking 425k → fair ~406k → NEGOCIAR
    //   Indep 375k (139m², 2009):       asking 375k → fair ~345k → NEGOCIAR
    //   Toyo dúplex (110m², residenc):  asking 360k → fair ~221k → CARO (resid. cerrado infravalorado)
    constructionValuePerM2: 2200,      // base "buen estado" Retamar/Toyo mercado terminado

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
    { name:"Parcela grande = mantenimiento",    level: 4, note:"982 m² requieren mantenimiento intensivo: jardinero ocasional (40-80 €/mes), riego automatico, piscina (300-500 €/año). Calcular como gasto fijo en la operacion." },
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
