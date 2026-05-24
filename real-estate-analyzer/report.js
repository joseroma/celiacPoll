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

})();
