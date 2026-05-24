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

  // ---------- Helper · calcula fair value de cualquier propiedad ----------
  // Reutilizable para Espuela 59 y los 3 comparables.
  function computeFairValue(prop, benchmarks) {
    const b = benchmarks;
    const floors = prop.floors || 2;
    const footprint = prop.builtArea / floors;
    let remaining = Math.max(0, prop.plotArea - footprint);
    let landValue = 0;
    for (const tier of b.plotValueTiers) {
      if (remaining <= 0) break;
      const take = Math.min(tier.upto, remaining);
      landValue += take * tier.valuePerM2;
      remaining -= take;
    }
    const adj = b.constructionAdjustments;
    let cM2 = b.constructionValuePerM2;
    if (/reformado|reformada|estrenar|nueva/i.test(prop.state || '')) cM2 *= (1 + adj.reformedPct / 100);
    if (prop.heating === false) cM2 *= (1 + adj.noHeatingPct / 100);
    const ec = (prop.energyCert || '').toLowerCase();
    if (/tramite|pendiente|desconocid/i.test(ec) || !ec) cM2 *= (1 + adj.energyCertPendingPct / 100);
    else if (/^[ab]$/i.test(ec)) cM2 *= (1 + adj.energyCertGoodPct / 100);
    else if (/^[fg]$/i.test(ec)) cM2 *= (1 + adj.energyCertBadPct / 100);
    if (prop.orientation && /sur|sureste|sur, este/i.test(prop.orientation)) cM2 *= (1 + adj.sourceOrientationPct / 100);
    if (floors === 1) cM2 *= (1 + adj.singleFloorPct / 100);
    if (prop.pool === 'private' || prop.pool === true) cM2 *= (1 + adj.poolPct / 100);
    if (!prop.parking) cM2 *= (1 + adj.noParkingPct / 100);
    let beachKey;
    const dB = prop.distanceBeachM || 1100;
    if (dB < 200) beachKey = '<200m';
    else if (dB < 500) beachKey = '200-500m';
    else if (dB < 1000) beachKey = '500-1000m';
    else beachKey = '>1000m';
    cM2 *= (1 + b.beachProximityAdjPct[beachKey] / 100);
    const constructionValue = cM2 * prop.builtArea;
    let extras = 0;
    if (prop.extras && prop.extras.some(e => /patio andaluz|aljibe/i.test(e))) extras += b.extrasPremiumEur.patioAndaluz;
    if (prop.extras && prop.extras.some(e => /jardin.*rodea|jardin maduro/i.test(e))) extras += b.extrasPremiumEur.bigGardenMature;
    if ((prop.communityFeesMonth === 0) || (prop.community === 0)) extras += b.extrasPremiumEur.noCommunityFees;
    const fair = Math.round(landValue + constructionValue + extras);
    const delta = prop.askingPrice - fair;
    const deltaPct = (delta / fair) * 100;
    return {
      landValue: Math.round(landValue),
      constructionValue: Math.round(constructionValue),
      constructionPerM2: Math.round(cM2),
      extras,
      fairValue: fair,
      delta,
      deltaPct,
      verdict: deltaPct > 10 ? 'CARO' : deltaPct > 3 ? 'NEGOCIAR' : deltaPct > -3 ? 'JUSTO' : 'OPORTUNIDAD'
    };
  }
  window.__computeFairValue = computeFairValue;

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
  const propFields = [
    ['Direccion', p.address || `${p.zone}, ${p.municipality}`],
    ['Tipo', p.type],
    ['Estado', p.state],
    ['Construidos', `${p.builtArea} m²`],
    ['Útiles', `${p.usableArea} m²`],
    ['Parcela', `${num(p.plotArea)} m²`],
    ['Porche', p.porchArea ? `${p.porchArea} m²` : '—'],
    ['Plantas', `${p.floors || '?'}`],
    ['Hab. / Baños', `${p.bedrooms} / ${p.bathrooms}`],
    ['Año construcción', p.yearBuilt || 'No figura'],
    ['Cert. energético', p.energyCert],
    ['Calefacción', p.heating === false ? '✗ No dispone' : (p.heating ? '✓' : '?')],
    ['Orientación', p.orientation || '—'],
    ['Distancia playa', `${num(p.distanceBeachM)} m`],
    ['Aeropuerto', p.distanceAirportKm ? `${p.distanceAirportKm} km` : '—'],
    ['Piscina', p.pool ? '✓ Privada' : '—'],
    ['Garaje', p.parking ? '✓ Incluido' : '—'],
    ['Terraza', p.terrace ? '✓' : '—'],
    ['Comunidad', p.communityFeesMonth === 0 ? 'Sin comunidad' : `${eur(p.communityFeesMonth)}/mes`],
    ['IBI estimado', `${eur(p.ibiYear)}/año`],
    ['Anuncio', p.listingAgeWeeks ? `${p.listingAgeWeeks} semanas activo` : '—']
  ];
  document.getElementById('propGrid').innerHTML = propFields
    .map(([k, v]) => `<div class="dg-item"><div class="dg-k">${k}</div><div class="dg-v">${v}</div></div>`)
    .join('');

  // Extras singulares
  if (p.extras && p.extras.length) {
    const extrasHtml = `<div class="card" style="margin-top:12px;background:rgba(212,175,55,0.03);border-color:rgba(212,175,55,0.2)">
      <div class="card-title" style="color:var(--gold-2)">★ Características singulares</div>
      <ul style="margin:0; padding-left: 18px; color: var(--text-dim); font-size: 13px; line-height: 1.7;">
        ${p.extras.map(e => `<li>${e}</li>`).join('')}
      </ul>
    </div>`;
    document.getElementById('propGrid').parentElement.insertAdjacentHTML('afterend', extrasHtml);
  }

  // ---------- 2. Valor estimado · modelo TASADOR (suelo + construccion) ----------
  const b = D.benchmarks;

  // (A) VALOR DEL SUELO — graduado por tramos
  // Footprint = lo que ocupa la casa en planta. Si 1 planta = built, si N plantas = built/N
  const floors = p.floors || 2;
  const footprint = p.builtArea / floors;
  let remaining = Math.max(0, p.plotArea - footprint);
  let landValue = 0;
  let landBreakdown = [];
  for (const tier of b.plotValueTiers) {
    if (remaining <= 0) break;
    const take = Math.min(tier.upto, remaining);
    landValue += take * tier.valuePerM2;
    landBreakdown.push({ m2: Math.round(take), perM2: tier.valuePerM2, value: Math.round(take * tier.valuePerM2) });
    remaining -= take;
  }

  // (B) VALOR DE LA CONSTRUCCION — base + ajustes %
  const adj = b.constructionAdjustments;
  let constructionM2 = b.constructionValuePerM2;
  const constructionAdjs = [];
  const applyAdj = (label, pct) => {
    if (!pct) return;
    const delta = constructionM2 * (pct / 100);
    constructionM2 += delta;
    constructionAdjs.push({ label, pct, delta: Math.round(delta * p.builtArea) });
  };

  // Estado
  if (/reformado|reformada|estrenar|nueva/i.test(p.state)) applyAdj('Reforma integral', adj.reformedPct);
  // Calefaccion
  if (p.heating === false) applyAdj('Sin calefaccion', adj.noHeatingPct);
  // Cert energetico
  const ec = (p.energyCert || '').toLowerCase();
  if (/tramite|pendiente|desconocid/i.test(ec) || !ec) applyAdj('Cert. energetico pendiente', adj.energyCertPendingPct);
  else if (/^[ab]$/i.test(p.energyCert)) applyAdj('Cert. energetico A/B', adj.energyCertGoodPct);
  else if (/^[fg]$/i.test(p.energyCert)) applyAdj('Cert. energetico F/G', adj.energyCertBadPct);
  // Orientacion
  if (p.orientation && /sur|sureste|sur, este/i.test(p.orientation)) applyAdj('Orientacion sur/este', adj.sourceOrientationPct);
  // 1 planta
  if (p.floors === 1) applyAdj('Vivienda en 1 planta', adj.singleFloorPct);
  // Piscina
  if (p.pool) applyAdj('Piscina privada', adj.poolPct);
  // Garaje
  if (!p.parking) applyAdj('Sin garaje', adj.noParkingPct);
  // Distancia playa
  let beachKey;
  if (p.distanceBeachM < 200) beachKey = '<200m';
  else if (p.distanceBeachM < 500) beachKey = '200-500m';
  else if (p.distanceBeachM < 1000) beachKey = '500-1000m';
  else beachKey = '>1000m';
  applyAdj(`Distancia playa ${beachKey}`, b.beachProximityAdjPct[beachKey]);

  const constructionValue = Math.round(constructionM2 * p.builtArea);

  // (C) EXTRAS SINGULARES
  let extrasValue = 0;
  const extrasBreakdown = [];
  if (p.extras && p.extras.some(e => /patio andaluz|aljibe/i.test(e))) {
    extrasValue += b.extrasPremiumEur.patioAndaluz;
    extrasBreakdown.push({ label: 'Patio andaluz con aljibe', value: b.extrasPremiumEur.patioAndaluz });
  }
  if (p.extras && p.extras.some(e => /jardin.*rodea|jardin maduro/i.test(e))) {
    extrasValue += b.extrasPremiumEur.bigGardenMature;
    extrasBreakdown.push({ label: 'Jardin maduro envuelve casa', value: b.extrasPremiumEur.bigGardenMature });
  }
  if (p.communityFeesMonth === 0) {
    extrasValue += b.extrasPremiumEur.noCommunityFees;
    extrasBreakdown.push({ label: 'Sin comunidad (chalet exento)', value: b.extrasPremiumEur.noCommunityFees });
  }

  // (D) FAIR VALUE total
  const fairValue = Math.round(landValue + constructionValue + extrasValue);
  const fairPerM2 = Math.round(fairValue / p.builtArea);
  const pricePerM2Ask = p.askingPrice / p.builtArea;
  const deltaToAsk = p.askingPrice - fairValue;
  const deltaPct = (deltaToAsk / fairValue) * 100;

  // (E) Negociacion — ancla considerando edad del anuncio
  let listingFlexKey;
  const w = p.listingAgeWeeks || 0;
  if (w < 2) listingFlexKey = '<2sem';
  else if (w < 6) listingFlexKey = '2-6sem';
  else if (w < 12) listingFlexKey = '6-12sem';
  else listingFlexKey = '>12sem';
  const extraListingDiscount = b.listingAgeFlexibilityPct[listingFlexKey];

  // Si el precio pedido YA esta bajo fair value, no se ancla por debajo del fair,
  // se ancla mas cerca del precio pedido para cerrar rapido sin perder oportunidad
  let initialOffer, walkAway, anchorStrategy;
  if (deltaPct < -3) {
    // Inmueble infravalorado: cerrar rapido. Oferta -4% del asking.
    initialOffer = Math.round(p.askingPrice * 0.96 / 1000) * 1000;
    walkAway = Math.round(p.askingPrice * 1.00 / 1000) * 1000;
    anchorStrategy = 'pegado al asking';
  } else {
    // Inmueble en fair o sobrevalorado: ancla en fair value -8% y +descuento por edad
    const discountPct = 8 + extraListingDiscount;
    initialOffer = Math.round(fairValue * (1 - discountPct / 100) / 1000) * 1000;
    walkAway = Math.round(fairValue * 1.02 / 1000) * 1000;
    anchorStrategy = `fair value - ${discountPct}%`;
  }

  // Expose for debug / negotiation table
  const valuationTrace = { landBreakdown, landValue, constructionAdjs, constructionValue, extrasBreakdown, extrasValue, beachKey, listingFlexKey };
  window.__VAL_TRACE = valuationTrace;

  // ---------- 3. Verdict ----------
  let verdictClass, verdictBadge, verdictHL, verdictTxt;
  const closingMid = Math.round((initialOffer + walkAway) / 2 / 1000) * 1000;
  if (deltaPct > 10) {
    verdictClass = 'v-pass'; verdictBadge = 'CARO — Negociar fuerte o pasar';
    verdictHL = `El vendedor pide un ${pct(deltaPct)} por encima del valor justo`;
    verdictTxt = `El precio pedido (${eur(p.askingPrice)}) está sustancialmente sobre el valor objetivo (${eur(fairValue)}). Solo tiene sentido si encuentras un ángulo único (uso turístico premium, valor sentimental, ubicación inigualable). Ancla con una oferta agresiva en ${eur(initialOffer)} y, si no se mueve por debajo de ${eur(walkAway)}, pasa de largo: hay alternativas comparables.`;
  } else if (deltaPct > 3) {
    verdictClass = 'v-hold'; verdictBadge = 'NEGOCIAR — Margen objetivo claro';
    verdictHL = `Precio razonable pero con ${pct(deltaPct)} de recorrido a la baja`;
    verdictTxt = `El precio está ligeramente por encima del valor justo (${eur(fairValue)} estimado). En Retamar el descuento medio sobre precio inicial es del ${b.sellerDiscountAvgPct}%. Abre con ${eur(initialOffer)}, techo en ${eur(walkAway)}. Cierre realista en ${eur(closingMid)}. Margen a obtener: ${eur(p.askingPrice - closingMid)}.`;
  } else if (deltaPct > -3) {
    verdictClass = 'v-buy'; verdictBadge = 'PRECIO JUSTO — Avanzar';
    verdictHL = `Precio dentro del rango de valor de mercado (${pct(-deltaPct)})`;
    verdictTxt = `El vendedor pide muy cerca del fair value (${eur(fairValue)}). Margen ajustado para regatear pero no estás pagando de más. Si los fundamentales encajan, oferta en ${eur(initialOffer)} como ancla, cerrar en torno a ${eur(closingMid)}.`;
  } else {
    verdictClass = 'v-buy'; verdictBadge = 'OPORTUNIDAD — Por debajo del fair value';
    verdictHL = `Precio pedido un ${pct(-deltaPct, 1)} POR DEBAJO del valor objetivo`;
    const reasons = [];
    if (p.heating === false) reasons.push('falta calefacción');
    if (/tramite|pendiente/i.test(p.energyCert || '')) reasons.push('cert. energético sin emitir');
    if (p.distanceBeachM > 1000) reasons.push('distancia a playa &gt;1km');
    const reasonsStr = reasons.length ? `por <em>${reasons.join(', ')}</em>` : '';
    verdictTxt = `El vendedor lo ha precificado bajo ${reasonsStr}. Si la due diligence sale limpia (nota simple, peritaje, sin cargas), <strong>cierra rápido</strong>: oferta en ${eur(initialOffer)} (-${((1 - initialOffer / p.askingPrice) * 100).toFixed(1)}% del asking) y cierre realista en ${eur(closingMid)}. Bajar más del 6-7% del asking = riesgo real de que entre otro comprador.`;
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

  // ---------- 6. Valoracion (modelo tasador) ----------
  const negLines = [];
  negLines.push({ label: 'Precio pedido por el vendedor', amount: p.askingPrice, kind: 'start' });
  negLines.push({ label: '', kind: 'sep', text: 'A. Valor del suelo (parcela ' + num(p.plotArea) + ' m²)' });
  valuationTrace.landBreakdown.forEach(tier => {
    negLines.push({ label: `Suelo · ${tier.m2} m² × ${eur(tier.perM2)}/m²`, amount: tier.value, kind: 'add' });
  });
  negLines.push({ label: '', kind: 'sep', text: 'B. Valor construccion (' + p.builtArea + ' m²)' });
  negLines.push({ label: `Base construccion · ${num(p.builtArea)} m² × ${eur(b.constructionValuePerM2)}/m²`, amount: p.builtArea * b.constructionValuePerM2, kind: 'add' });
  valuationTrace.constructionAdjs.forEach(a => {
    negLines.push({ label: `${a.label} (${a.pct > 0 ? '+' : ''}${a.pct}%)`, amount: a.delta, kind: a.delta >= 0 ? 'add' : 'neg' });
  });
  if (valuationTrace.extrasBreakdown.length) {
    negLines.push({ label: '', kind: 'sep', text: 'C. Extras singulares' });
    valuationTrace.extrasBreakdown.forEach(e => negLines.push({ label: e.label, amount: e.value, kind: 'add' }));
  }
  negLines.push({ label: 'Valor objetivo (fair value)', amount: fairValue, kind: 'total' });
  negLines.push({ label: `vs precio pedido · ${pct(deltaPct, 1)}`, amount: -deltaToAsk, kind: 'delta' });

  document.getElementById('negBreakdown').innerHTML = negLines.map(item => {
    if (item.kind === 'sep') {
      return `<div style="margin: 12px 0 4px; padding-top: 8px; border-top:1px dashed var(--line); font-size:11px; color:var(--gold-2); text-transform:uppercase; letter-spacing:.5px; font-weight:600">${item.text}</div>`;
    }
    if (item.kind === 'total') {
      return `<div class="neg-line total"><span class="neg-label">${item.label}</span><span class="neg-amount">${eur(item.amount)}</span></div>`;
    }
    if (item.kind === 'start') {
      return `<div class="neg-line" style="background:rgba(212,175,55,0.04); margin:0 -10px; padding:11px 10px; border-radius:6px"><span class="neg-label" style="color:var(--text);font-weight:600">${item.label}</span><span class="neg-amount" style="color:var(--text)">${eur(item.amount)}</span></div>`;
    }
    if (item.kind === 'delta') {
      const cls = item.amount >= 0 ? 'pos' : 'neg';
      const colorbar = item.amount >= 0 ? 'var(--green)' : 'var(--red)';
      return `<div class="neg-line" style="border-left: 3px solid ${colorbar}; padding-left: 8px"><span class="neg-label" style="color:${colorbar};font-weight:600">${item.label}</span><span class="neg-amount ${cls}">${item.amount >= 0 ? '+' : ''}${eur(item.amount)}</span></div>`;
    }
    const sign = item.amount >= 0 ? 'pos' : 'neg';
    return `<div class="neg-line"><span class="neg-label">${item.label}</span><span class="neg-amount ${sign}">${item.amount >= 0 ? '+' : ''}${eur(item.amount)}</span></div>`;
  }).join('');

  // ---------- Negotiation strategy ----------
  const isUnderPriced = deltaPct < -3;
  const flexNote = w >= 6 ? `<strong>Vendedor lleva ${w} semanas activo</strong> sin movimiento — alta probabilidad de aceptar oferta razonable.` : `Anuncio reciente (${w} semanas), vendedor con menos urgencia.`;

  let strategyHtml;
  if (isUnderPriced) {
    strategyHtml = `
      <p><strong>Caso atípico:</strong> el precio pedido está <strong style="color:var(--green)">${pct(-deltaPct)} POR DEBAJO</strong> del fair value. El vendedor lo ha precificado bajo por: (a) <em>${p.heating === false ? 'falta de calefacción' : ''}${p.heating === false && /tramite|pendiente/i.test(p.energyCert || '') ? ' + ' : ''}${/tramite|pendiente/i.test(p.energyCert || '') ? 'cert. energético sin emitir' : ''}</em>, (b) distancia a playa &gt;1km que limita el mercado turístico, (c) ${flexNote}.</p>
      <p><strong>Estrategia recomendada — anclar pegado al asking, no fuerzar bajada agresiva.</strong> Si pides menos del 5-6%, riesgo real de perder el inmueble: con ese €/m² (€${num(Math.round(pricePerM2Ask))}/m²) entrará un comprador rival rápido.</p>
      <p><strong>Apertura.</strong> Oferta inicial en <strong>${eur(initialOffer)}</strong> (-${((1 - initialOffer / p.askingPrice) * 100).toFixed(1)}% del asking). Justifica con: (1) coste instalación calefacción ~5-7k €, (2) descuento medio Retamar ${b.sellerDiscountAvgPct}%, (3) cert. energético en trámite (riesgo de salir E/F).</p>
      <p><strong>Cerrar en torno a <span style="color:var(--gold-2)">${eur(Math.round((initialOffer + walkAway) / 2 / 1000) * 1000)}</span>.</strong> Walk-away: ${eur(walkAway)} (el precio pedido). Sobre eso, perderías el descuento "anti-frigción" típico del mercado almeriense.</p>
      <p><strong>Ahorro realista esperado:</strong> entre <strong>${eur(p.askingPrice - initialOffer)}</strong> (apertura) y <strong>${eur(p.askingPrice - Math.round((initialOffer + walkAway) / 2 / 1000) * 1000)}</strong> (cierre medio).</p>
      <p><strong>Palancas duras.</strong> ITE/peritaje (300-500€) y nota simple SIEMPRE antes de mejorar oferta. Si el peritaje saca hallazgos (humedades, instalaciones, aluminosis), descuenta literal el coste de reforma del precio.</p>
      <p><strong>Estacionalidad.</strong> Septiembre-noviembre es el mejor momento para cerrar (post-verano, vendedor resignado). Evitar mayo-julio (alta demanda turística).</p>
    `;
  } else {
    strategyHtml = `
      <p><strong>Apertura.</strong> Oferta inicial en <strong>${eur(initialOffer)}</strong> (${anchorStrategy}, -${((1 - initialOffer / p.askingPrice) * 100).toFixed(1)}% del asking). Justifica con: (1) descuento medio en Retamar del ${b.sellerDiscountAvgPct}%, (2) ${flexNote}, (3) precio €/m² superior al fair value (€${num(fairPerM2)}/m²).</p>
      <p><strong>Palancas duras.</strong> ITE/peritaje (300-500€) y nota simple SIEMPRE antes de mejorar oferta. Si el peritaje saca hallazgos, descuenta literal el coste estimado de reforma del precio.</p>
      <p><strong>Palancas blandas.</strong> Mostrarte como comprador serio (preaprobación hipotecaria escrita), flexibilidad en fecha de entrega, todo en metálico para arras. Estos detalles valen 1-2% reales del precio.</p>
      <p><strong>Walk-away.</strong> Por encima de <strong>${eur(walkAway)}</strong> no compras (+2% sobre fair value, margen de seguridad razonable).</p>
      <p><strong>Ahorro realista esperado:</strong> entre <strong>${eur(p.askingPrice - initialOffer)}</strong> y <strong>${eur(p.askingPrice - walkAway)}</strong>.</p>
    `;
  }
  document.getElementById('negStrategy').innerHTML = strategyHtml;

  // ---------- 7. Comparables (mercado abierto Retamar) ----------
  const mktComps = D.marketComparables || [];
  const compHtml = mktComps.map(c => {
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
          data: mktComps.map(c => ({ x: c.area, y: c.pricePerM2 })),
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

  // Vacacional — ajustado por distancia playa
  const beachFar = p.distanceBeachM > 1000;
  const beachAdj = beachFar ? (1 + (D.rental.farFromBeachPenaltyPct / 100)) : 1;
  const occupancyAdj = beachFar ? 0.40 : (D.rental.occupancyVacationPct / 100);
  const rentVT_day = Math.round(D.rental.vacation.retamar * beachAdj);
  const rentVT_year = Math.round(rentVT_day * 365 * occupancyAdj);
  const grossYieldVT = (rentVT_year / fairValue) * 100;
  const netYieldVT = grossYieldVT * (1 - 0.25 - 0.12 - 0.08);
  document.getElementById('rentVT').textContent = eur(rentVT_year);
  document.getElementById('rentVTpct').textContent = beachFar
    ? `${eur(rentVT_day)}/día · ${(occupancyAdj * 100).toFixed(0)}% ocupación (penaliza distancia playa)`
    : `${eur(rentVT_day)}/día · ${(occupancyAdj * 100).toFixed(0)}% ocupación`;
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

  // ============================================================
  // 11. COMPARATIVA · 4 opciones (Espuela 59 + A, B, C)
  // ============================================================
  if (D.comparables && D.comparables.length) {
    const propAsCompare = {
      id: 'P', shortName: 'Espuela 59', headline: 'Chalet indep. Espuela 59',
      type: p.type, askingPrice: p.askingPrice, originalPrice: p.askingPrice,
      builtArea: p.builtArea, usableArea: p.usableArea, plotArea: p.plotArea,
      bedrooms: p.bedrooms, bathrooms: p.bathrooms, floors: p.floors,
      yearBuilt: p.yearBuilt || '~2000', state: p.state,
      heating: p.heating, ac: false, pool: p.pool ? 'private' : null,
      poolType: 'privada', parking: p.parking, garden: true,
      energyCert: p.energyCert, orientation: p.orientation,
      community: p.communityFeesMonth, distanceBeachM: p.distanceBeachM,
      distanceSchoolKm: 1.2, listingAgeWeeks: p.listingAgeWeeks,
      pricePerM2: Math.round(p.askingPrice / p.builtArea),
      extras: p.extras
    };
    const allProps = [propAsCompare, ...D.comparables];

    // Calcula fair value de cada opcion
    const fvs = allProps.map(prop => ({ ...prop, fv: computeFairValue(prop, D.benchmarks) }));

    // ---------- 11.1 Tabla mercado ----------
    const compareTableEl = document.getElementById('compareTable');
    if (compareTableEl) {
      const rows = [
        ['Tipo',           p => p.type],
        ['Precio asking',  p => eur(p.askingPrice), true],
        ['Precio original',p => p.originalPrice && p.originalPrice !== p.askingPrice ? `${eur(p.originalPrice)} <span style="color:var(--green);font-size:11px">(-${Math.round((1 - p.askingPrice/p.originalPrice) * 100)}%)</span>` : '—'],
        ['Construidos',    p => `${p.builtArea} m²`],
        ['Útiles',         p => `${p.usableArea} m² <span style="color:var(--text-dim);font-size:11px">(${Math.round(p.usableArea/p.builtArea*100)}%)</span>`],
        ['Parcela',        p => `${num(p.plotArea)} m²`, true],
        ['Hab. / Baños',   p => `${p.bedrooms} / ${p.bathrooms}`],
        ['Plantas',        p => p.floors || '—'],
        ['Año',            p => p.yearBuilt || '—'],
        ['Calefacción',    p => p.heating === true ? '<span style="color:var(--green)">✓</span>' : '<span style="color:var(--red)">✗</span>'],
        ['A/A',            p => p.ac === true ? '<span style="color:var(--green)">✓</span>' : '—'],
        ['Piscina',        p => p.pool === 'private' ? '<span style="color:var(--green)">Privada</span>' : p.pool === 'community' ? 'Comunit.' : '—'],
        ['Cert. energ.',   p => p.energyCert],
        ['Orientación',    p => p.orientation || '—'],
        ['Comunidad',      p => p.community ? `${eur(p.community)}/mes` : 'Sin comu.'],
        ['€/m² construido',p => num(p.pricePerM2)],
        ['€/m² total (build+plot)', p => num(Math.round(p.askingPrice / (p.builtArea + p.plotArea)))],
        ['Anuncio activo', p => p.listingAgeWeeks ? `${p.listingAgeWeeks} sem` : '—'],
        ['Fair value',     p => eur(p.fv.fairValue), true],
        ['Δ vs asking',    p => {
          const dp = p.fv.deltaPct;
          const cls = dp > 10 ? 'neg' : dp > 3 ? 'warn' : dp > -3 ? 'pos' : 'pos';
          const color = dp > 10 ? 'var(--red)' : dp > 3 ? 'var(--gold-2)' : dp > -3 ? 'var(--green)' : 'var(--green)';
          return `<span style="color:${color};font-weight:600">${pct(dp, 1)}</span>`;
        }, true],
        ['Veredicto modelo', p => {
          const v = p.fv.verdict;
          const color = v === 'CARO' ? 'var(--red)' : v === 'NEGOCIAR' ? 'var(--gold-2)' : v === 'JUSTO' ? 'var(--green)' : 'var(--green)';
          return `<span style="color:${color};font-weight:700;font-size:11px;letter-spacing:.5px">${v}</span>`;
        }, true]
      ];

      const headerCells = fvs.map(p => {
        const isTarget = p.id === 'P';
        return `<th style="${isTarget ? 'background:rgba(212,175,55,0.1);color:var(--gold-2);font-weight:700;border-left:2px solid var(--gold-2)' : ''}">${isTarget ? '★ ' : ''}${p.shortName}</th>`;
      }).join('');

      const bodyRows = rows.map(([label, fn, hi]) => {
        const cells = fvs.map(p => {
          const isTarget = p.id === 'P';
          const targetStyle = isTarget ? 'background:rgba(212,175,55,0.05);border-left:2px solid var(--gold-2)' : '';
          return `<td style="${targetStyle}${hi ? ';font-weight:600' : ''}">${fn(p)}</td>`;
        }).join('');
        return `<tr><th class="row-label">${label}</th>${cells}</tr>`;
      }).join('');

      compareTableEl.innerHTML = `
        <table class="ctable">
          <thead><tr><th></th>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      `;
    }

    // ---------- 11.2 Fair value desglose por inmueble ----------
    const fvBreakdownEl = document.getElementById('fairValueBreakdown');
    if (fvBreakdownEl) {
      const cards = fvs.map(prop => {
        const isTarget = prop.id === 'P';
        const verdict = prop.fv.verdict;
        const vColor = verdict === 'CARO' ? 'var(--red)' : verdict === 'NEGOCIAR' ? 'var(--gold-2)' : 'var(--green)';
        return `
          <div class="fv-card ${isTarget ? 'fv-target' : ''}">
            <div class="fv-head">
              <div>
                <div class="fv-name">${isTarget ? '★ ' : ''}${prop.shortName}</div>
                <div class="fv-sub">${prop.type} · ${prop.builtArea}m² · parcela ${num(prop.plotArea)}m²</div>
              </div>
              <div class="fv-verdict" style="color:${vColor}">${verdict}</div>
            </div>
            <div class="fv-bars">
              <div class="fv-bar-row"><span class="fv-bl">Valor suelo</span><span class="fv-br">${eur(prop.fv.landValue)}</span></div>
              <div class="fv-bar-row"><span class="fv-bl">Valor construcción <small style="color:var(--text-dim)">(@${eur(prop.fv.constructionPerM2)}/m²)</small></span><span class="fv-br">${eur(prop.fv.constructionValue)}</span></div>
              ${prop.fv.extras ? `<div class="fv-bar-row"><span class="fv-bl">Extras singulares</span><span class="fv-br">${eur(prop.fv.extras)}</span></div>` : ''}
              <div class="fv-bar-row total"><span class="fv-bl"><strong>Fair value estimado</strong></span><span class="fv-br"><strong>${eur(prop.fv.fairValue)}</strong></span></div>
              <div class="fv-bar-row"><span class="fv-bl">Precio pedido</span><span class="fv-br">${eur(prop.askingPrice)}</span></div>
              <div class="fv-bar-row" style="border-top:1px dashed var(--line);padding-top:6px;margin-top:6px"><span class="fv-bl" style="color:${vColor};font-weight:600">Diferencia vs fair</span><span class="fv-br" style="color:${vColor};font-weight:700">${pct(prop.fv.deltaPct, 1)} · ${eur(prop.fv.delta)}</span></div>
            </div>
          </div>
        `;
      }).join('');
      fvBreakdownEl.innerHTML = cards;
    }

    // ---------- 11.3 Chart comparativo prices vs fair value ----------
    const compareCtx = document.getElementById('chartCompare');
    if (compareCtx) {
      new Chart(compareCtx, {
        type: 'bar',
        data: {
          labels: fvs.map(p => p.shortName),
          datasets: [
            {
              label: 'Precio pedido (€)',
              data: fvs.map(p => p.askingPrice),
              backgroundColor: fvs.map(p => p.id === 'P' ? 'rgba(212,175,55,0.7)' : 'rgba(180,180,180,0.5)'),
              borderColor: fvs.map(p => p.id === 'P' ? '#d4af37' : '#888'),
              borderWidth: 2
            },
            {
              label: 'Fair value (€)',
              data: fvs.map(p => p.fv.fairValue),
              backgroundColor: fvs.map(p => p.id === 'P' ? 'rgba(46,160,67,0.7)' : 'rgba(46,160,67,0.4)'),
              borderColor: '#2ea043',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#a8a8a8', font: { size: 11 } } },
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${eur(ctx.raw)}` } }
          },
          scales: {
            y: { ticks: { color: '#a8a8a8', callback: v => (v / 1000) + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#a8a8a8', font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    }

    // ============================================================
    // 12. SCORING FAMILIAR · matriz ponderada
    // ============================================================
    if (D.familyProfile) {
      const fp = D.familyProfile;
      const totalWeight = fp.priorities.reduce((a, p) => a + p.weight, 0);

      // Computa score ponderado
      const propIds = ['P', 'A', 'B', 'C'];
      const propLabels = { P: '★ Espuela 59', A: 'Adosado', B: 'Toyo', C: 'Indep. 375k' };
      const weightedScores = {};
      propIds.forEach(id => {
        const s = fp.scores[id] || {};
        let total = 0;
        fp.priorities.forEach(pr => { total += (s[pr.key] || 0) * pr.weight; });
        weightedScores[id] = total / totalWeight;
      });

      // Ranking
      const ranked = propIds.slice().sort((a, b) => weightedScores[b] - weightedScores[a]);
      const winner = ranked[0];

      const scoringEl = document.getElementById('familyScoring');
      if (scoringEl) {
        const headerCells = propIds.map(id => {
          const isWin = id === winner;
          const isTarget = id === 'P';
          return `<th style="${isTarget ? 'color:var(--gold-2);border-left:2px solid var(--gold-2)' : ''}${isWin ? ';background:rgba(46,160,67,0.15)' : ''}">${propLabels[id]}${isWin ? ' 🏆' : ''}</th>`;
        }).join('');

        const bodyRows = fp.priorities.map(pr => {
          const cells = propIds.map(id => {
            const score = fp.scores[id][pr.key] || 0;
            const bgIntensity = score / 10;
            const color = score >= 8 ? `rgba(46,160,67,${bgIntensity * 0.4})` : score >= 5 ? `rgba(212,175,55,${bgIntensity * 0.3})` : `rgba(248,81,73,${(1 - bgIntensity) * 0.3})`;
            const isTarget = id === 'P';
            return `<td style="text-align:center;background:${color};${isTarget ? 'border-left:2px solid var(--gold-2)' : ''}"><strong>${score}</strong>/10</td>`;
          }).join('');
          return `<tr><th class="row-label">${pr.label}<small style="display:block;color:var(--text-dim);font-weight:400;font-size:11px">peso ${pr.weight}%</small></th>${cells}</tr>`;
        }).join('');

        const totalRow = `<tr style="border-top:2px solid var(--gold-2);background:rgba(212,175,55,0.05)"><th class="row-label" style="color:var(--gold-2);font-weight:700">PUNTUACIÓN FINAL</th>${propIds.map(id => {
          const sc = weightedScores[id];
          const isWin = id === winner;
          const isTarget = id === 'P';
          return `<td style="text-align:center;${isTarget ? 'border-left:2px solid var(--gold-2);' : ''}${isWin ? 'background:rgba(46,160,67,0.25);' : ''}font-size:18px;font-weight:700;color:${isWin ? 'var(--green)' : 'var(--text)'}">${sc.toFixed(1)}/10${isWin ? ' 🏆' : ''}</td>`;
        }).join('')}</tr>`;

        scoringEl.innerHTML = `
          <table class="ctable">
            <thead><tr><th>Prioridad familiar (peso)</th>${headerCells}</tr></thead>
            <tbody>${bodyRows}${totalRow}</tbody>
          </table>
        `;
      }

      // Veredicto familiar
      const verdictEl = document.getElementById('familyVerdict');
      if (verdictEl) {
        const winnerName = { P: 'Espuela 59 (chalet exento)', A: 'Adosado (425k)', B: 'Dúplex Toyo (360k)', C: 'Indep. Retamar 375k' }[winner];
        const winnerScore = weightedScores[winner].toFixed(1);
        const runnerUp = ranked[1];
        const runnerUpName = { P: 'Espuela 59', A: 'Adosado 425k', B: 'Dúplex Toyo', C: 'Indep. 375k' }[runnerUp];
        const gap = (weightedScores[winner] - weightedScores[runnerUp]).toFixed(1);

        verdictEl.innerHTML = `
          <div class="winner-banner">
            <div class="winner-label">🏆 MEJOR OPCIÓN PARA VUESTRO PERFIL</div>
            <div class="winner-title">${winnerName}</div>
            <div class="winner-score">Puntuación ponderada: <strong>${winnerScore}/10</strong> · ${gap} puntos por delante de ${runnerUpName}</div>
          </div>
          <div class="card-narrative" style="margin-top:16px">
            <p><strong>Por qué Espuela 59 gana para una familia con perro mediano + 2 niños + matrimonio:</strong></p>
            <ul style="padding-left:20px;line-height:1.7;color:var(--text)">
              <li><strong>Parcela 982 m²</strong> — el perro mediano necesita 200-400 m² de carrera libre diaria. Espuela tiene 800m² aprovechables (3-4× lo necesario). En las otras opciones (A: 305m²; C: 280m²; B: ~0) el perro pasaría más tiempo encerrado o en paseos forzados.</li>
              <li><strong>1 sola planta</strong> — clave con niños pequeños (no caen escaleras) y perro envejeciendo. Las otras 3 opciones son todas a 2 plantas / dúplex.</li>
              <li><strong>4 habitaciones</strong> — master + dormitorio niños + 2ª habitación niños + despacho/cuarto invitados. Las otras se quedan en 3 hab (suficiente pero apretado a 10-15 años vista cuando los niños crezcan).</li>
              <li><strong>Sin comunidad</strong> — perro suelto en parcela sin reglas, libertad para BBQ ruidosas, instalar caseta, etc. En el dúplex de Toyo el reglamento limita perros, ruidos y modificaciones.</li>
              <li><strong>Asset que protege capital</strong> — 23% del precio es suelo. En 20 años, cuando los niños se vayan, podéis vender Espuela revalorizada o quedaros con la casa (sin escaleras, ideal jubilación).</li>
              <li><strong>Patio andaluz + jardín maduro</strong> — entorno "respirable" para los niños, mejor que un patio de cemento.</li>
            </ul>
            <p><strong>Lo que tendréis que asumir si compráis Espuela 59:</strong></p>
            <ul style="padding-left:20px;line-height:1.7;color:var(--text-dim)">
              <li>Instalar calefacción tras compra (~6-8k €) — palanca de negociación, no problema real.</li>
              <li>Cert. energético sin emitir — pedirlo antes de firmar arras.</li>
              <li>Mantenimiento jardín 982 m² requiere jardinero ocasional (~40-60 €/mes) o dedicación familiar de fin de semana.</li>
              <li>Liquidez de salida más lenta (6-9 meses) si necesitáis revender en urgencia.</li>
            </ul>
            <p><strong>Si se descarta Espuela 59</strong> (por presupuesto o por la falta de calefacción que no os compense), <strong>el plan B es ${runnerUpName}</strong> con ${weightedScores[runnerUp].toFixed(1)}/10. Diferencia neta de presupuesto: <strong>${winner === 'P' ? eur(p.askingPrice - (D.comparables.find(c => c.id === runnerUp) || {askingPrice: p.askingPrice}).askingPrice) : '—'}</strong>.</p>
          </div>
        `;
      }

      // Estrategia comprar varias
      const strategyEl = document.getElementById('shoppingStrategy');
      if (strategyEl) {
        strategyEl.innerHTML = `
          <p><strong>Orden recomendado de visitas:</strong></p>
          <ol style="padding-left:20px;line-height:1.8">
            <li><strong>Visitar C (Indep. Retamar 375k) PRIMERO</strong> — Establece la baseline: ¿qué da un chalet exento Retamar a precio ajustado? Año 2009, calefacción, cert emitido. Pide nota simple + ITE el mismo día. Si os enamora, ofertad <strong>${eur(355000)}</strong> (cierre realista).</li>
            <li><strong>Visitar Espuela 59 con la referencia de C en cabeza.</strong> Pregunta clave al vendedor: <em>"¿por qué su chalet vale 105k más que el de Mya Inmobiliaria si no tiene calefacción?"</em>. Esa pregunta es la palanca para bajarle a <strong>${eur(450000)}</strong>.</li>
            <li><strong>Visitar A (Adosado 425k)</strong> como plan-B de presupuesto medio. Si parcela 390 m² os parece "suficiente" para el perro, este es buen producto con calefacción incluida y rebaja ya aplicada (-6%).</li>
            <li><strong>Visitar B (Dúplex Toyo) último</strong> — sólo tiene sentido si valoráis residencial cerrado con servicios por encima del espacio (perfil no familiar con perro). Probablemente lo descartaréis al visitar.</li>
          </ol>
          <p style="margin-top:14px"><strong>Tabla de ofertas y cierre realista:</strong></p>
          <table class="ctable" style="margin-top:8px">
            <thead><tr><th>Inmueble</th><th>Asking</th><th>Apertura</th><th>Cierre realista</th><th>Walk-away</th><th>Ahorro</th></tr></thead>
            <tbody>
              ${fvs.map(prop => {
                const isTarget = prop.id === 'P';
                const open = Math.round(prop.askingPrice * 0.90 / 1000) * 1000;
                const close = Math.round((prop.askingPrice * 0.94) / 1000) * 1000;
                const walkaway = Math.round((prop.fv.fairValue * 1.02) / 1000) * 1000;
                const saving = prop.askingPrice - close;
                return `<tr style="${isTarget ? 'background:rgba(212,175,55,0.05)' : ''}">
                  <td style="${isTarget ? 'border-left:2px solid var(--gold-2);font-weight:600' : ''}">${isTarget ? '★ ' : ''}${prop.shortName}</td>
                  <td>${eur(prop.askingPrice)}</td>
                  <td style="color:var(--text-dim)">${eur(open)}</td>
                  <td style="color:var(--green);font-weight:700">${eur(close)}</td>
                  <td style="color:var(--red)">${eur(walkaway)}</td>
                  <td style="color:var(--green)">${eur(saving)} (${pct(-saving/prop.askingPrice*100, 1)})</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        `;
      }
    }
  }

})();
