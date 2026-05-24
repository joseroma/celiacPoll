// ============================================================
// Real Estate Analyzer · report.js
// Renderiza todo el informe a partir de window.REPORT_DATA
// ============================================================

(function () {
  const D = window.REPORT_DATA;
  if (!D) { console.error("data.js no cargado"); return; }

  // ---------- Helpers ----------
  const eur = (n, dec = 0) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: dec, maximumFractionDigits: dec
  }).format(n);
  const num = (n, dec = 0) => new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: dec, maximumFractionDigits: dec
  }).format(n);
  const pct = (n, dec = 1) => (n >= 0 ? '+' : '') + n.toFixed(dec) + '%';

  // ---------- 0. Header / dates / refs ----------
  document.getElementById('reportDate').textContent =
    new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('topRef').href = D.property.url;
  document.getElementById('ctaIdealista').href = D.property.url;
  if (D.property.isEstimated) {
    document.getElementById('estimatedWarning').style.display = 'block';
  }

  // ---------- 1. Property grid ----------
  const p = D.property;
  const pricePerM2Ask = p.askingPrice / p.builtArea;
  const propFields = [
    ['Tipo', p.type],
    ['Estado', p.state],
    ['Construidos', `${p.builtArea} m²`],
    ['Útiles', `${p.usableArea} m²`],
    ['Parcela', `${p.plotArea} m²`],
    ['Hab. / Baños', `${p.bedrooms} / ${p.bathrooms}`],
    ['Año construcción', p.yearBuilt],
    ['Cert. energético', p.energyCert],
    ['Distancia playa', `${p.distanceBeachM} m`],
    ['Piscina', p.pool ? '✓ Privada' : '—'],
    ['Garaje', p.parking ? '✓' : '—'],
    ['Trastero', p.storage ? '✓' : '—'],
    ['Terraza', p.terrace ? '✓' : '—'],
    ['Comunidad', `${eur(p.communityFeesMonth)}/mes`],
    ['IBI', `${eur(p.ibiYear)}/año`]
  ];
  document.getElementById('propGrid').innerHTML = propFields
    .map(([k, v]) => `<div class="dg-item"><div class="dg-k">${k}</div><div class="dg-v">${v}</div></div>`)
    .join('');

  // ---------- 2. Valor estimado (fair value) ----------
  // Punto de partida: media €/m² Retamar
  // + premium villa (parcela + piscina)
  // + premium estado reformado
  // - penalty distancia playa
  // + valor parcela por exceso
  const b = D.benchmarks;
  const baseM2 = b.retamarAvgPricePerM2_2026;
  const villaPremium = baseM2 * (b.retamarVillaPremiumPct / 100);
  const statePremium = p.state.toLowerCase().includes('reformado') || p.state.toLowerCase().includes('estrenar')
    ? baseM2 * (b.reformedPremiumPct / 100)
    : 0;
  let beachPenalty = 0;
  if (p.distanceBeachM < 200) beachPenalty = baseM2 * (b.beachProximityPenalty["<200m"] / 100);
  else if (p.distanceBeachM < 500) beachPenalty = baseM2 * (b.beachProximityPenalty["200-500m"] / 100);
  else if (p.distanceBeachM < 1000) beachPenalty = baseM2 * (b.beachProximityPenalty["500-1000m"] / 100);
  else beachPenalty = baseM2 * (b.beachProximityPenalty[">1000m"] / 100);

  const adjustedM2 = baseM2 + villaPremium + statePremium + beachPenalty;
  const buildingValue = adjustedM2 * p.builtArea;
  // Parcela: solo cuenta el EXCEDENTE sobre footprint (footprint = construido x ratio)
  const footprint = p.builtArea * b.footprintRatio;
  const excessPlot = Math.max(0, p.plotArea - footprint);
  const plotValue = excessPlot * b.plotPremiumPerM2;
  const fairValue = Math.round(buildingValue + plotValue);
  const fairPerM2 = Math.round(fairValue / p.builtArea);

  const deltaToAsk = p.askingPrice - fairValue;
  const deltaPct = (deltaToAsk / fairValue) * 100;

  // Offer: 8% por debajo del fair value (ancla baja para negociar)
  const initialOffer = Math.round(fairValue * 0.92 / 1000) * 1000;
  // Walk-away: fair value + 3% (max premium por buen estado/ubicación específica)
  const walkAway = Math.round(fairValue * 1.03 / 1000) * 1000;

  // ---------- 3. Verdict ----------
  let verdictClass, verdictBadge, verdictHL, verdictTxt;
  if (deltaPct > 10) {
    verdictClass = 'v-pass'; verdictBadge = 'CARO — Negociar fuerte o pasar';
    verdictHL = `El vendedor pide un ${pct(deltaPct)} por encima del valor justo`;
    verdictTxt = `El precio pedido (${eur(p.askingPrice)}) está sustancialmente sobre el valor objetivo (${eur(fairValue)}). Solo tiene sentido si encuentras un ángulo único (uso turístico premium, valor sentimental, ubicación inigualable). Ancla con una oferta agresiva en ${eur(initialOffer)} y, si no se mueve por debajo de ${eur(walkAway)}, pasa de largo: hay alternativas comparables.`;
  } else if (deltaPct > 3) {
    verdictClass = 'v-hold'; verdictBadge = 'NEGOCIAR — Margen objetivo claro';
    verdictHL = `Precio razonable pero con ${pct(deltaPct)} de recorrido a la baja`;
    verdictTxt = `El precio está ligeramente por encima del valor justo (${eur(fairValue)} estimado). Es típico: en Retamar el descuento medio sobre precio inicial es del ${b.sellerDiscountAvgPct}%. Abre con ${eur(initialOffer)} (8% bajo fair value), techo de negociación en ${eur(walkAway)}. Margen realista a obtener: ${eur(p.askingPrice - walkAway)}.`;
  } else if (deltaPct > -3) {
    verdictClass = 'v-buy'; verdictBadge = 'PRECIO JUSTO — Avanzar';
    verdictHL = `Precio dentro del rango de valor de mercado`;
    verdictTxt = `El vendedor pide muy cerca del fair value (${eur(fairValue)}). Hay poco margen para regatear pero tampoco estás pagando de más. Si los fundamentales encajan (ubicación exacta, estado verificado, certificación energética), una oferta en ${eur(initialOffer)} es razonable como ancla, cerrando en torno al precio pedido si la operación se desencalla rápido.`;
  } else {
    verdictClass = 'v-buy'; verdictBadge = 'OPORTUNIDAD — Por debajo de mercado';
    verdictHL = `El precio pedido está por debajo del fair value`;
    verdictTxt = `Curioso: el vendedor pide ${pct(Math.abs(deltaPct))} POR DEBAJO del valor de mercado. Verifica que no hay gato encerrado (cargas, vicios ocultos, lindes en disputa, proceso de divorcio/herencia urgente). Si la due diligence sale limpia, oferta cerca del precio pedido para evitar competencia: ${eur(Math.round(p.askingPrice * 0.97 / 1000) * 1000)}.`;
  }
  const vb = document.getElementById('verdictBadge');
  vb.className = 'verdict-badge ' + verdictClass;
  vb.textContent = verdictBadge;
  document.getElementById('verdictHeadline').textContent = verdictHL;
  document.getElementById('verdictText').textContent = verdictTxt;

  // ---------- KPI tiles ----------
  document.getElementById('kpiAsk').textContent = eur(p.askingPrice);
  document.getElementById('kpiAskPerM2').textContent = `${num(pricePerM2Ask)} €/m²`;
  document.getElementById('kpiFair').textContent = eur(fairValue);
  document.getElementById('kpiFairPerM2').textContent = `${num(fairPerM2)} €/m² · ${pct(-deltaPct)} vs pedido`;
  document.getElementById('kpiOffer').textContent = eur(initialOffer);
  document.getElementById('kpiWalk').textContent = eur(walkAway);

  // ---------- 4. CHART: histórico 30 años ----------
  const ZONES = [
    { key: 'retamar',   label: 'Retamar',         color: '#d4af37' },
    { key: 'almeria',   label: 'Almería capital', color: '#5aa9ff' },
    { key: 'almerimar', label: 'Almerimar',       color: '#3ddc97' },
    { key: 'ejido',     label: 'El Ejido',        color: '#b87cff' },
    { key: 'sanjose',   label: 'San José',        color: '#ff6b6b' }
  ];
  const years = D.history.years;

  // legend
  document.getElementById('histLegend').innerHTML = ZONES
    .map(z => `<span><span class="leg-dot" style="background:${z.color}"></span>${z.label}</span>`)
    .join('');

  const ctxHist = document.getElementById('chartHistory').getContext('2d');
  let chartMode = 'abs';

  function buildHistData(mode) {
    return ZONES.map(z => {
      const raw = D.history.series[z.key];
      const data = mode === 'idx' ? raw.map(v => (v / raw[0]) * 100) : raw;
      return {
        label: z.label, data,
        borderColor: z.color,
        backgroundColor: z.color + '20',
        borderWidth: z.key === 'retamar' ? 2.5 : 1.5,
        pointRadius: 0, pointHoverRadius: 4,
        tension: 0.25,
        fill: false
      };
    });
  }

  const histChart = new Chart(ctxHist, {
    type: 'line',
    data: { labels: years, datasets: buildHistData('abs') },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0b1320', borderColor: '#25334d', borderWidth: 1,
          titleColor: '#d4af37', bodyColor: '#e8ecf3',
          padding: 10, cornerRadius: 6,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${chartMode === 'idx' ? Math.round(ctx.parsed.y) + ' pts' : num(Math.round(ctx.parsed.y)) + ' €/m²'}`
          }
        },
        annotation: {}
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#6b7791', maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#6b7791', font: { size: 10 }, callback: (v) => chartMode === 'idx' ? v : num(v) }
        }
      }
    }
  });

  document.querySelectorAll('#histTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#histTabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      chartMode = tab.dataset.mode;
      histChart.data.datasets = buildHistData(chartMode);
      histChart.update();
    });
  });

  // ---------- 5. Benchmark actual ----------
  const last = D.history.years.length - 1;
  const five = last - 5;
  const benchData = ZONES.map(z => ({
    zone: z.label, color: z.color,
    current: D.history.series[z.key][last],
    delta5y: ((D.history.series[z.key][last] / D.history.series[z.key][five]) - 1) * 100,
    delta30y: ((D.history.series[z.key][last] / D.history.series[z.key][0]) - 1) * 100
  }));

  // Bar chart
  new Chart(document.getElementById('chartBenchmark').getContext('2d'), {
    type: 'bar',
    data: {
      labels: benchData.map(b => b.zone),
      datasets: [{
        data: benchData.map(b => b.current),
        backgroundColor: benchData.map(b => b.color),
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0b1320', borderColor: '#25334d', borderWidth: 1,
          callbacks: { label: ctx => num(ctx.parsed.y) + ' €/m²' }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9aa6bd', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7791', font: { size: 10 }, callback: v => num(v) } }
      }
    }
  });

  // Tabla
  const tbody = document.querySelector('#tBenchmark tbody');
  tbody.innerHTML = benchData.map(b => {
    const isRetamar = b.zone === 'Retamar';
    return `<tr class="${isRetamar ? 'hl' : ''}">
      <td>${b.zone}</td>
      <td class="num">${num(b.current)}</td>
      <td class="num" style="color:${b.delta5y >= 0 ? 'var(--green)' : 'var(--red)'}">${pct(b.delta5y, 1)}</td>
      <td class="num">${pct(b.delta30y, 0)}</td>
    </tr>`;
  }).join('');

  // ---------- 6. Negotiation breakdown ----------
  const negBreak = [
    { label: 'Precio pedido por el vendedor', amount: p.askingPrice, kind: 'start' },
    { label: 'Sobreprecio vs €/m² medio Retamar', amount: -(pricePerM2Ask - baseM2) * p.builtArea, kind: 'adj' },
    { label: `Premium villa (parcela ${p.plotArea}m² + piscina)`, amount: villaPremium * p.builtArea, kind: 'add' },
    { label: 'Premium por estado reformado', amount: statePremium * p.builtArea, kind: 'add' },
    { label: `Ajuste distancia playa (${p.distanceBeachM}m)`, amount: beachPenalty * p.builtArea, kind: 'adj' },
    { label: `Valor parcela excedente (${num(excessPlot)}m² × ${eur(b.plotPremiumPerM2)})`, amount: plotValue, kind: 'add' },
    { label: 'Descuento medio observado en Retamar (-' + b.sellerDiscountAvgPct + '%)', amount: -p.askingPrice * b.sellerDiscountAvgPct / 100, kind: 'neg' },
    { label: 'Valor objetivo · fair value', amount: fairValue, kind: 'total' }
  ];

  document.getElementById('negBreakdown').innerHTML = negBreak.map(item => {
    const sign = item.amount >= 0 ? 'pos' : 'neg';
    if (item.kind === 'total') {
      return `<div class="neg-line total"><span class="neg-label">${item.label}</span><span class="neg-amount">${eur(item.amount)}</span></div>`;
    }
    if (item.kind === 'start') {
      return `<div class="neg-line"><span class="neg-label">${item.label}</span><span class="neg-amount">${eur(item.amount)}</span></div>`;
    }
    return `<div class="neg-line"><span class="neg-label">${item.label}</span><span class="neg-amount ${sign}">${item.amount >= 0 ? '+' : ''}${eur(item.amount)}</span></div>`;
  }).join('');

  // Negotiation strategy
  document.getElementById('negStrategy').innerHTML = `
    <p><strong>Apertura.</strong> Oferta inicial en <strong>${eur(initialOffer)}</strong> (≈8% bajo fair value). Justifica con: (1) descuento medio en Retamar del ${b.sellerDiscountAvgPct}%, (2) tiempo medio para vender 4-6 meses (vendedor con prisa), (3) precio €/m² superior al baseline del barrio (${num(baseM2)} €/m²).</p>
    <p><strong>Palancas duras.</strong> ITE/peritaje (300-500€) y nota simple SIEMPRE antes de mejorar oferta. Si el peritaje saca hallazgos (humedades, instalaciones, aluminosis), descuenta literal el coste de reforma estimado del precio.</p>
    <p><strong>Palancas blandas.</strong> Mostrarte como comprador serio (preaprobación hipotecaria escrita), flexibilidad en fecha de entrega, todo en metálico para arras (ahorra al vendedor incertidumbre). Estos detalles valen 1-2% reales del precio.</p>
    <p><strong>Walk-away.</strong> Por encima de <strong>${eur(walkAway)}</strong> no compras. Es +3% sobre fair value, margen de seguridad razonable. Por encima, el mercado de Retamar te ofrece alternativas mejores (comparables ya listados).</p>
    <p><strong>Estacionalidad.</strong> Septiembre-noviembre es el mejor momento para cerrar (post-verano, vendedores resignados a otro año sin vender). Evitar mayo-julio (alta demanda turística).</p>
  `;

  // ---------- 7. Comparables ----------
  const compHtml = D.comparables.map(c => {
    const deltaVsFair = ((c.pricePerM2 / fairPerM2) - 1) * 100;
    return `<div class="comp-item">
      <div class="comp-head">
        <div class="comp-ref">${c.ref}</div>
        <div class="comp-price">${eur(c.price)}</div>
      </div>
      <div class="comp-meta">
        <span><strong>${c.area} m²</strong></span>
        <span><strong>${num(c.pricePerM2)} €/m²</strong></span>
        <span>${c.state}</span>
        <span style="color:${deltaVsFair > 0 ? 'var(--red)' : 'var(--green)'}">${pct(deltaVsFair)} vs fair €/m²</span>
        ${c.url ? `<span><a href="${c.url}" target="_blank">↗ ver</a></span>` : ''}
      </div>
    </div>`;
  }).join('');
  document.getElementById('compList').innerHTML = compHtml;

  // Scatter comparables vs nuestra finca
  const compCanvas = document.getElementById('chartComp');
  new Chart(compCanvas.getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Comparables',
          data: D.comparables.map(c => ({ x: c.area, y: c.pricePerM2 })),
          backgroundColor: '#5aa9ff', pointRadius: 6, pointHoverRadius: 8
        },
        {
          label: 'Inmueble analizado · pedido',
          data: [{ x: p.builtArea, y: pricePerM2Ask }],
          backgroundColor: '#ff6b6b', pointRadius: 9, pointStyle: 'rectRot'
        },
        {
          label: 'Inmueble analizado · fair value',
          data: [{ x: p.builtArea, y: fairPerM2 }],
          backgroundColor: '#3ddc97', pointRadius: 9, pointStyle: 'rectRot'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#9aa6bd', font: { size: 10 }, boxWidth: 10, padding: 8 } },
        tooltip: {
          backgroundColor: '#0b1320', borderColor: '#25334d', borderWidth: 1,
          callbacks: { label: ctx => `${ctx.dataset.label} — ${ctx.parsed.x} m² · ${num(Math.round(ctx.parsed.y))} €/m²` }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Superficie (m²)', color: '#6b7791', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7791', font: { size: 10 } } },
        y: { title: { display: true, text: '€/m²', color: '#6b7791', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7791', font: { size: 10 }, callback: v => num(v) } }
      }
    }
  });

  // ---------- 8. ROI ----------
  // Larga estancia
  const rentLT_m2 = D.rental.longTerm.retamar;
  const rentLT_month = rentLT_m2 * p.builtArea;
  const rentLT_year = rentLT_month * 12;
  const grossYieldLT = (rentLT_year / fairValue) * 100;
  // Net: 10% gastos comunidad+IBI+seguros, 8% vacancia/morosidad, 5% mantenimiento
  const netYieldLT = grossYieldLT * (1 - 0.10 - 0.08 - 0.05);
  document.getElementById('rentLT').textContent = eur(rentLT_month);
  document.getElementById('rentLTpct').textContent = `${rentLT_m2.toFixed(1)} €/m²/mes · ${eur(rentLT_year)}/año`;
  document.getElementById('yieldLT').textContent = netYieldLT.toFixed(2) + '%';

  // Vacacional
  const rentVT_day = D.rental.vacation.retamar;
  const occupancy = D.rental.occupancyVacationPct / 100;
  const rentVT_year = rentVT_day * 365 * occupancy;
  const grossYieldVT = (rentVT_year / fairValue) * 100;
  // Net: 25% gestión + limpieza, 12% gastos + IBI + tasa turística, 8% mantenimiento intensivo
  const netYieldVT = grossYieldVT * (1 - 0.25 - 0.12 - 0.08);
  document.getElementById('rentVT').textContent = eur(rentVT_year);
  document.getElementById('rentVTpct').textContent = `${eur(rentVT_day)}/día · ${(occupancy * 100).toFixed(0)}% ocupación`;
  document.getElementById('yieldVT').textContent = netYieldVT.toFixed(2) + '%';

  // Proyección a 10 años (CAGR derivado de últimos 10 años de Retamar)
  const retSeries = D.history.series.retamar;
  const cagr10 = Math.pow(retSeries[retSeries.length - 1] / retSeries[retSeries.length - 11], 1 / 10) - 1;
  const projYears = [];
  const projAvg = [];
  const projOpt = [];
  const projPess = [];
  for (let i = 0; i <= 10; i++) {
    projYears.push(2026 + i);
    projAvg.push(Math.round(fairValue * Math.pow(1 + cagr10, i)));
    projOpt.push(Math.round(fairValue * Math.pow(1 + cagr10 + 0.015, i)));
    projPess.push(Math.round(fairValue * Math.pow(1 + Math.max(0, cagr10 - 0.025), i)));
  }
  new Chart(document.getElementById('chartProj').getContext('2d'), {
    type: 'line',
    data: {
      labels: projYears,
      datasets: [
        { label: 'Optimista', data: projOpt,  borderColor: '#3ddc97', backgroundColor: 'rgba(61,220,151,0.08)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, tension: 0.1, fill: false },
        { label: 'Tendencia (10y)', data: projAvg, borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2.5, pointRadius: 0, tension: 0.1, fill: '+1' },
        { label: 'Pesimista', data: projPess, borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.08)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, tension: 0.1, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#9aa6bd', font: { size: 10 }, boxWidth: 10, padding: 8 } },
        tooltip: {
          backgroundColor: '#0b1320', borderColor: '#25334d', borderWidth: 1,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${eur(Math.round(ctx.parsed.y))}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7791', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7791', font: { size: 10 }, callback: v => num(v / 1000) + 'k' } }
      }
    }
  });

  const valueIn10 = projAvg[10];
  const totalRentLT_10y = rentLT_year * 10 * (1 - 0.10 - 0.08 - 0.05);
  const irrApproxLT = (Math.pow((valueIn10 + totalRentLT_10y) / fairValue, 1 / 10) - 1) * 100;
  document.getElementById('projText').innerHTML = `
    CAGR del valor proyectado: <strong style="color:var(--gold-2)">${(cagr10 * 100).toFixed(2)}%/año</strong>
    (derivado de la tendencia 2016→2026 de Retamar).<br>
    Valor proyectado a 10 años (escenario central): <strong>${eur(valueIn10)}</strong>.<br>
    TIR aproximada combinando plusvalía + alquiler larga estancia (sin apalancamiento): <strong style="color:var(--green)">${irrApproxLT.toFixed(1)}%</strong>.
  `;

  // ---------- 9. Risk matrix ----------
  document.getElementById('riskList').innerHTML = D.risks.map(r => {
    const cls = r.level <= 3 ? 'rs-low' : r.level <= 6 ? 'rs-med' : 'rs-high';
    const barColor = r.level <= 3 ? 'var(--green)' : r.level <= 6 ? 'var(--amber)' : 'var(--red)';
    return `<div class="risk-item">
      <div class="risk-head">
        <div class="risk-name">${r.name}</div>
        <div class="risk-score ${cls}">${r.level}/10</div>
      </div>
      <div class="risk-bar"><div class="risk-bar-fill" style="width:${r.level * 10}%; background:${barColor}"></div></div>
      <div class="risk-note">${r.note}</div>
    </div>`;
  }).join('');

  // ---------- 10. Sources ----------
  document.getElementById('sourcesList').innerHTML = D.sources
    .map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name} ↗</a>`)
    .join('');

})();
