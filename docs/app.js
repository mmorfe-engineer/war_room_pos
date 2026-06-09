// ═══════════════════════════════════════════════════════════════
// OPERACIÓN MERIDIANO · War Room · Motor de pestañas
// ═══════════════════════════════════════════════════════════════
const TC = {ALFA:'#00E5A0',BRAVO:'#4C9FFF',CHARLIE:'#FFB454',DELTA:'#8B95AD'};
const HC = {'Capital Centro':'#00E5A0','Occidente':'#4C9FFF','Centro Occidente':'#FFB454','Oriente':'#FF8FB0'};
const fmtRent = v => v>=1e9?(v/1e9).toFixed(1)+'B':v>=1e6?(v/1e6).toFixed(0)+'M':(v/1e3).toFixed(0)+'K';
const charts = {};

// ─── TAB ROUTER ───
const PANES = {};
document.getElementById('tabbar').addEventListener('click', e => {
  const btn = e.target.closest('.tabbtn'); if(!btn) return;
  document.querySelectorAll('.tabbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  render(btn.dataset.pane);
});
function render(pane){
  const c = document.getElementById('content');
  c.innerHTML = `<div class="pane active">${PANES[pane]()}</div>`;
  if(AFTER[pane]) AFTER[pane]();
}
const AFTER = {};

// ═══════════════════════════════════════════════════════════════
// PANE 01 · CENTRO DE MANDO
// ═══════════════════════════════════════════════════════════════
PANES.resumen = () => `
  <div class="pane-head">
    <div class="eyebrow">Centro de Mando</div>
    <h2>Estado General de la Operación</h2>
    <div class="desc">Misión: instalar 2.000 terminales POS en la red del BDT en una ventana de 30 a 60 días, priorizando agencias por capacidad transaccional probada y cobertura nacional balanceada.</div>
  </div>

  <div class="grid4 mb18">
    <div class="kpi"><div class="k-lbl">Objetivo de despliegue</div><div class="k-val" style="color:var(--alfa)">2.000</div><div class="k-sub">terminales POS · Fase 1</div></div>
    <div class="kpi b"><div class="k-lbl">Agencias activadas</div><div class="k-val" style="color:var(--bravo)">203</div><div class="k-sub">de 278 del universo BDT</div></div>
    <div class="kpi w"><div class="k-lbl">Velocidad requerida</div><div class="k-val" style="color:var(--warn)">67</div><div class="k-sub">POS/día · modo 30 días</div></div>
    <div class="kpi g"><div class="k-lbl">Hubs regionales</div><div class="k-val" style="color:var(--ink)">4</div><div class="k-sub">CENTINELA · FRONTERA · LLANO · AURORA</div></div>
  </div>

  <div class="grid-3-2 mb18">
    <div class="card">
      <div class="card-h"><span class="tick"></span> Distribución por Hub Regional</div>
      <div class="chart" style="height:280px"><canvas id="cmHub"></canvas></div>
    </div>
    <div class="card">
      <div class="card-h"><span class="tick"></span> Composición por Tier de Capacidad</div>
      <div class="chart" style="height:280px"><canvas id="cmTier"></canvas></div>
    </div>
  </div>

  <div class="grid4 mb18" id="cmHubMini"></div>

  <div class="callout info">
    <div class="c-title">◆ Cómo leer este tablero</div>
    <div class="c-body">El despliegue se organiza en dos capas: <b>geográfica</b> (4 Hubs regionales que el BDT ya reconoce) y <b>de capacidad</b> (4 Tiers — ALFA a DELTA — según rentabilidad probada de cada agencia). Cada terminal tiene asignada una agencia, un hub y una ventana de instalación. Navegue por las pestañas para ver la metodología, el detalle por hub, la clasificación de agencias y la matriz completa de asignación.</div>
  </div>`;

AFTER.resumen = () => {
  // Donut hubs
  charts.cmHub = new Chart(document.getElementById('cmHub'),{
    type:'doughnut',
    data:{labels:DATA.hubs.map(h=>h.codename),
      datasets:[{data:DATA.hubs.map(h=>h.pos),backgroundColor:DATA.hubs.map(h=>HC[h.region]),borderColor:'#111B2E',borderWidth:3,hoverBorderWidth:5}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'62%',
      plugins:{legend:{position:'bottom',labels:{color:'#9FB0CC',font:{size:10},padding:12}},
        tooltip:{callbacks:{label:c=>{const h=DATA.hubs[c.dataIndex];return ` ${h.pos} POS (${h.pct}%) · ${h.agencias} agencias`}}}}}
  });
  // Stacked tier
  charts.cmTier = new Chart(document.getElementById('cmTier'),{
    type:'bar',
    data:{labels:DATA.tiers.map(t=>t.tier+' · '+t.rol),
      datasets:[{label:'POS',data:DATA.tiers.map(t=>t.pos),backgroundColor:DATA.tiers.map(t=>TC[t.tier]),borderRadius:5,borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const t=DATA.tiers[c.dataIndex];return ` ${t.pos} POS (${t.pct}%) · ${t.agencias} agencias`}}}},
      scales:{x:{grid:{color:'rgba(30,44,69,.6)'},ticks:{color:'#5E6E8C',font:{size:9}}},y:{grid:{display:false},ticks:{color:'#9FB0CC',font:{size:10}}}}}
  });
  // Hub mini cards
  document.getElementById('cmHubMini').innerHTML = DATA.hubs.map(h=>`
    <div class="hubcard">
      <div class="glow" style="background:${HC[h.region]}"></div>
      <div class="h-code">${h.codename}</div>
      <div class="h-name">${h.region}</div>
      <div class="h-pos" style="color:${HC[h.region]}">${h.pos}</div>
      <div style="font-size:10px;color:var(--ink2)">POS · ${h.pct}% del total · ${h.agencias} agencias</div>
      <div class="h-bar"><i style="width:${h.pct}%;background:${HC[h.region]}"></i></div>
      <div class="h-foot"><span>Cumpl. BDT: <b>${h.pct_bdt}%</b></span><span class="bdg ${h.pct_bdt<20?'bdg-danger':'bdg-warn'}">${h.pct_bdt<20?'CRÍTICO':'URGENTE'}</span></div>
    </div>`).join('');
};

// ═══════════════════════════════════════════════════════════════
// PANE 02 · METODOLOGÍA
// ═══════════════════════════════════════════════════════════════
PANES.metodologia = () => `
  <div class="pane-head">
    <div class="eyebrow">Fundamento Técnico</div>
    <h2>Metodología de Distribución</h2>
    <div class="desc">El modelo se llama <b>Potencial Acotado (MPA)</b>. Reparte los 2.000 POS en dos capas con criterios cuantitativos auditables. Cada decisión de diseño está justificada abajo.</div>
  </div>

  <div class="grid2 mb18">
    <div class="card">
      <div class="card-h"><span class="tick"></span> Capa 1 · Cuota por Hub/Estado (fórmula de velocidad)</div>
      <div class="formula mb14">
        <div><span class="cm"># Prioriza estados con mayor brecha y menor avance</span></div>
        <div><span class="kw">Cuota</span> = <span class="vr">Meta_BDT</span> × <span class="vl">(1 − %Cumplimiento)</span> × <span class="vr">F_urgencia</span></div>
        <div>&nbsp;</div>
        <div><span class="cm"># Factor de urgencia según avance actual</span></div>
        <div><span class="kw">si</span> cumpl &lt; <span class="vl">20%</span> → <span class="vr">1.5</span> &nbsp;<span class="cm">(crítico)</span></div>
        <div><span class="kw">si</span> cumpl &lt; <span class="vl">40%</span> → <span class="vr">1.2</span> &nbsp;<span class="cm">(urgente)</span></div>
        <div><span class="kw">si</span> cumpl ≥ <span class="vl">40%</span> → <span class="vr">1.0</span> &nbsp;<span class="cm">(normal)</span></div>
        <div>&nbsp;</div>
        <div><span class="vr">Cuota_final</span> = score / Σscores × <span class="vl">2.000</span></div>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><span class="tick"></span> Capa 2 · Alícuota por Agencia (potencial acotado)</div>
      <div class="formula mb14">
        <div><span class="cm"># Peso = raíz cuadrada de la rentabilidad</span></div>
        <div><span class="kw">peso</span> = <span class="vr">√(Rentabilidad)</span></div>
        <div><span class="kw">POS</span> = peso / Σpesos × <span class="vr">Cuota_estado</span></div>
        <div>&nbsp;</div>
        <div><span class="cm"># Restricciones (no negociables)</span></div>
        <div><span class="kw">techo</span> = <span class="vl">15%</span> de la cuota del estado</div>
        <div><span class="kw">piso</span>  = <span class="vl">2</span> POS por agencia</div>
        <div><span class="kw">excluir</span> rentabilidad ≤ <span class="vl">0</span></div>
        <div><span class="cm"># Excedente topado → redistribuir proporcional</span></div>
      </div>
    </div>
  </div>

  <div class="card mb18">
    <div class="card-h"><span class="tick"></span> Por qué la raíz cuadrada — y no la rentabilidad pura</div>
    <div class="grid2" style="gap:18px;align-items:start">
      <div>
        <p style="font-size:12px;color:var(--ink2);line-height:1.7;margin-bottom:12px">Usar rentabilidad <b>absoluta</b> como peso producía concentración inejecutable: una sola agencia (La Principal, sede matriz) absorbía 650 de 734 POS de su estado, el 88%. La raíz cuadrada aplica <b>rendimientos decrecientes</b>: una agencia 4× más rentable no tiene 4× el espacio físico ni el tráfico para 4× los terminales. Premia el potencial, pero reconoce su techo operativo.</p>
        <div class="callout ok" style="margin:0">
          <div class="c-title">✓ Resultado</div>
          <div class="c-body">La Principal pasó de <b>650 → 110 POS</b>. Las 15 agencias de Gran Caracas ahora reciben distribución real (24–110 POS cada una). La concentración del líder cayó de 88% a 15%.</div>
        </div>
      </div>
      <div class="chart" style="height:280px"><canvas id="mtCompare"></canvas></div>
    </div>
  </div>

  <div class="grid3">
    <div class="callout info" style="margin:0">
      <div class="c-title">◆ Variable única: rentabilidad</div>
      <div class="c-body">El diseño original pedía ponderar por rentabilidad + transaccionalidad + accesibilidad. Solo existe <b>rentabilidad</b> en los datos del BDT. Trabajamos con la variable disponible, usándola como proxy de capacidad transaccional. Es una decisión consciente, documentada en Advertencias.</div>
    </div>
    <div class="callout warn" style="margin:0">
      <div class="c-title">⚠ Exclusión por rentabilidad</div>
      <div class="c-body">Las 17 agencias con rentabilidad negativa quedan <b>fuera de Fase 1</b>. Las 37 bajo el percentil 15 nacional pasan a <b>lista de espera</b>, activable en protocolos de escalación. El umbral exacto se publica en versión enmascarada.</div>
    </div>
    <div class="callout info" style="margin:0">
      <div class="c-title">◆ Clasificación en Tiers</div>
      <div class="c-body">Sobre la asignación, cada agencia se clasifica en <b>ALFA · BRAVO · CHARLIE · DELTA</b> según su percentil de rentabilidad nacional. Define el orden de despliegue y la prioridad operativa. Ver pestaña Clasificación.</div>
    </div>
  </div>`;

AFTER.metodologia = () => {
  const labels=['La Principal','Centro Lido','El Hatillo','Sabana Gr.','Chacaíto','Resto (10 ag.)'];
  charts.mtCompare = new Chart(document.getElementById('mtCompare'),{
    type:'bar',
    data:{labels,datasets:[
      {label:'Rentabilidad pura (rechazado)',data:[650,20,15,11,8,30],backgroundColor:'rgba(255,84,112,.55)',borderRadius:4},
      {label:'Potencial Acotado (adoptado)',data:[110,92,80,68,56,328],backgroundColor:'rgba(0,229,160,.85)',borderRadius:4}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#9FB0CC',font:{size:10}}},title:{display:true,text:'Gran Caracas · 734 POS — antes vs ahora',color:'#5E6E8C',font:{size:10}}},
      scales:{x:{grid:{display:false},ticks:{color:'#5E6E8C',font:{size:9}}},y:{grid:{color:'rgba(30,44,69,.6)'},ticks:{color:'#5E6E8C',font:{size:9}}}}}
  });
};

// ═══════════════════════════════════════════════════════════════
// PANE 03 · HUBS REGIONALES
// ═══════════════════════════════════════════════════════════════
PANES.hubs = () => `
  <div class="pane-head">
    <div class="eyebrow">Capa Geográfica</div>
    <h2>Hubs Regionales de Despliegue</h2>
    <div class="desc">Los 2.000 POS se preposicionan en 4 hubs logísticos que corresponden a las regiones del BDT. Cada hub recibe equipos de instalación dedicados y opera con autonomía bajo el War Room central.</div>
  </div>

  <div class="grid4 mb18" id="hubCards"></div>

  <div class="grid-3-2 mb18">
    <div class="card">
      <div class="card-h"><span class="tick"></span> Cuota DIGIPAGOS vs. Brecha de cumplimiento BDT por Hub</div>
      <div class="chart" style="height:300px"><canvas id="hbBars"></canvas></div>
      <div class="legend">
        <div class="li"><span class="sw" style="background:var(--alfa)"></span> POS asignados (nuestra cuota)</div>
        <div class="li"><span class="sw" style="background:var(--danger)"></span> % cumplimiento del BDT (contexto)</div>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><span class="tick"></span> Estados dentro de cada Hub</div>
      <div class="tbl-scroll" style="max-height:300px">
        <table class="tbl"><thead><tr><th>Estado</th><th>Hub</th><th>POS</th><th>% Cumpl</th></tr></thead>
        <tbody id="hbEstados"></tbody></table>
      </div>
    </div>
  </div>

  <div class="callout info">
    <div class="c-title">◆ Lógica de preposicionamiento (Día −7)</div>
    <div class="c-body">Cada hub recibe sus terminales pre-configurados (SIM/IMEI pre-asignado por agencia) antes del kickoff. El día 0, los equipos despliegan desde el hub, no desde bodega central — esto recorta el tiempo muerto logístico. <b>CENTINELA</b> (Capital Centro) concentra el 58% del volumen y exige el triple de equipos.</div>
  </div>`;

AFTER.hubs = () => {
  document.getElementById('hubCards').innerHTML = DATA.hubs.map(h=>`
    <div class="hubcard">
      <div class="glow" style="background:${HC[h.region]}"></div>
      <div class="h-code">${h.codename}</div>
      <div class="h-name">${h.region}</div>
      <div class="h-pos" style="color:${HC[h.region]}">${h.pos}</div>
      <div style="font-size:10px;color:var(--ink2)">POS · ${h.pct}% · ${h.agencias} agencias</div>
      <div class="h-bar"><i style="width:${h.pct}%;background:${HC[h.region]}"></i></div>
      <div class="h-tiers">
        <div class="h-tier"><div class="n" style="color:var(--alfa)">${h.alfa}</div><div class="l">ALFA</div></div>
        <div class="h-tier"><div class="n" style="color:var(--bravo)">${h.bravo}</div><div class="l">BRAVO</div></div>
        <div class="h-tier"><div class="n" style="color:var(--charlie)">${h.charlie}</div><div class="l">CHARLIE</div></div>
        <div class="h-tier"><div class="n" style="color:var(--delta)">${h.delta}</div><div class="l">DELTA</div></div>
      </div>
      <div class="h-foot"><span>Equipos mín.: <b>3</b></span><span>Urgencia <b>${h.urgencia}×</b></span></div>
    </div>`).join('');

  charts.hbBars = new Chart(document.getElementById('hbBars'),{
    data:{labels:DATA.hubs.map(h=>h.codename.split('·')[1].trim()),
      datasets:[
        {type:'bar',label:'POS',data:DATA.hubs.map(h=>h.pos),backgroundColor:DATA.hubs.map(h=>HC[h.region]+'CC'),borderRadius:5,yAxisID:'y'},
        {type:'line',label:'% Cumpl BDT',data:DATA.hubs.map(h=>h.pct_bdt),borderColor:'#FF5470',backgroundColor:'rgba(255,84,112,.1)',pointBackgroundColor:'#FF5470',borderWidth:2,pointRadius:4,yAxisID:'y2'}
      ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{grid:{display:false},ticks:{color:'#9FB0CC',font:{size:10}}},
        y:{position:'left',grid:{color:'rgba(30,44,69,.6)'},ticks:{color:'#5E6E8C',font:{size:9}},title:{display:true,text:'POS',color:'#5E6E8C',font:{size:9}}},
        y2:{position:'right',min:0,max:50,grid:{drawOnChartArea:false},ticks:{color:'#FF5470',font:{size:9}},title:{display:true,text:'%',color:'#FF5470',font:{size:9}}}}}
  });

  const er = {};
  DATA.estados.forEach(e=>{(er[e.region]=er[e.region]||[]).push(e)});
  let rows='';
  Object.keys(er).sort().forEach(reg=>{
    er[reg].sort((a,b)=>b.pos-a.pos).forEach(e=>{
      rows+=`<tr><td style="font-weight:600">${e.estado}</td><td><span style="font-size:9px;color:${HC[reg]}">${reg}</span></td><td style="font-weight:800;color:${HC[reg]}">${e.pos}</td><td><span class="${e.pct_cumpl<20?'bdg bdg-danger':e.pct_cumpl<30?'bdg bdg-warn':'bdg bdg-ok'}">${e.pct_cumpl}%</span></td></tr>`;
    });
  });
  document.getElementById('hbEstados').innerHTML = rows;
};
// ═══════════════════════════════════════════════════════════════
// PANE 04 · CLASIFICACIÓN DE AGENCIAS (TIERS)
// ═══════════════════════════════════════════════════════════════
PANES.tiers = () => `
  <div class="pane-head">
    <div class="eyebrow">Capa de Capacidad</div>
    <h2>Clasificación de Agencias — Tiers ALFA a DELTA</h2>
    <div class="desc">Cada agencia se clasifica por su capacidad transaccional probada (rentabilidad). El tier define <b>cuándo</b> se despliega y <b>con qué prioridad</b>. Nomenclatura operativa diseñada para que cualquier equipo de campo entienda la prioridad sin consultar fórmulas.</div>
  </div>

  <div class="grid4 mb18" id="tierCards"></div>

  <div class="grid-3-2 mb18">
    <div class="card">
      <div class="card-h"><span class="tick"></span> Curva de capacidad — POS por tier (Principio 80/20 controlado)</div>
      <div class="chart" style="height:300px"><canvas id="tCurve"></canvas></div>
      <div class="callout info" style="margin:14px 0 0">
        <div class="c-body" style="font-size:11px">El <b>34% de los POS</b> va a ALFA (vanguardia, 21 agencias de máxima capacidad), pero ninguna región queda sin servicio: los 4 tiers están presentes en los 4 hubs. Distribución por capacidad <b>sin sacrificar cobertura nacional</b>.</div>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><span class="tick"></span> Presencia de cada tier por Hub</div>
      <div class="chart" style="height:300px"><canvas id="tStack"></canvas></div>
    </div>
  </div>

  <div class="card">
    <div class="card-h"><span class="tick"></span> Protocolo de despliegue por tier</div>
    <table class="tbl">
      <thead><tr><th>Tier</th><th style="text-align:left">Rol operativo</th><th>Agencias</th><th>POS</th><th>Ventana</th><th style="text-align:left">Regla de gestión</th></tr></thead>
      <tbody id="tierProto"></tbody>
    </table>
  </div>`;

AFTER.tiers = () => {
  document.getElementById('tierCards').innerHTML = DATA.tiers.map(t=>`
    <div class="hubcard">
      <div class="glow" style="background:${TC[t.tier]}"></div>
      <div class="h-code" style="color:${TC[t.tier]}">${t.tier}</div>
      <div class="h-name">${t.rol}</div>
      <div class="h-pos" style="color:${TC[t.tier]}">${t.pos}</div>
      <div style="font-size:10px;color:var(--ink2)">POS · ${t.pct}% · ${t.agencias} agencias</div>
      <div class="h-bar"><i style="width:${t.pct}%;background:${TC[t.tier]}"></i></div>
      <div class="h-foot" style="display:block"><div style="font-size:10px;color:var(--ink2);line-height:1.4">${t.desc}</div></div>
    </div>`).join('');

  charts.tCurve = new Chart(document.getElementById('tCurve'),{
    type:'bar',
    data:{labels:DATA.tiers.map(t=>`${t.tier} · ${t.rol}`),
      datasets:[{label:'POS',data:DATA.tiers.map(t=>t.pos),backgroundColor:DATA.tiers.map(t=>TC[t.tier]),borderRadius:5}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${DATA.tiers[c.dataIndex].pos} POS · ${DATA.tiers[c.dataIndex].agencias} agencias`}}},
      scales:{x:{grid:{display:false},ticks:{color:'#9FB0CC',font:{size:10}}},y:{grid:{color:'rgba(30,44,69,.6)'},ticks:{color:'#5E6E8C',font:{size:9}}}}}
  });

  const hubsN = DATA.hubs.map(h=>h.codename.split('·')[1].trim());
  charts.tStack = new Chart(document.getElementById('tStack'),{
    type:'bar',
    data:{labels:hubsN,datasets:['alfa','bravo','charlie','delta'].map((k,i)=>({
      label:k.toUpperCase(),data:DATA.hubs.map(h=>h[k]),
      backgroundColor:[TC.ALFA,TC.BRAVO,TC.CHARLIE,TC.DELTA][i],borderRadius:3,stack:'s'}))},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#9FB0CC',font:{size:10}}}},
      scales:{x:{stacked:true,grid:{display:false},ticks:{color:'#9FB0CC',font:{size:10}}},
        y:{stacked:true,grid:{color:'rgba(30,44,69,.6)'},ticks:{color:'#5E6E8C',font:{size:9}},title:{display:true,text:'N° agencias',color:'#5E6E8C',font:{size:9}}}}}
  });

  const rules={ALFA:'Despliegue garantizado · soporte premium · NPS prioritario',
    BRAVO:'Despliegue programado · soporte estándar',
    CHARLIE:'Despliegue por cluster geográfico · soporte compartido',
    DELTA:'Bajo vigilancia · reasignar si no transacciona en T+15 días'};
  document.getElementById('tierProto').innerHTML = DATA.tiers.map(t=>`
    <tr>
      <td><span class="bdg bdg-${t.tier.toLowerCase()}">${t.tier}</span></td>
      <td style="text-align:left;font-weight:600">${t.rol}</td>
      <td>${t.agencias}</td>
      <td style="font-weight:800;color:${TC[t.tier]}">${t.pos}</td>
      <td>${t.ventana}</td>
      <td style="text-align:left;color:var(--ink2);font-size:10px">${rules[t.tier]}</td>
    </tr>`).join('');
};

// ═══════════════════════════════════════════════════════════════
// PANE 05 · MATRIZ DE ASIGNACIÓN
// ═══════════════════════════════════════════════════════════════
let matrizFilter = {tier:'TODOS', hub:'TODOS', q:''};
PANES.matriz = () => `
  <div class="pane-head">
    <div class="eyebrow">Trazabilidad Total</div>
    <h2>Matriz de Asignación — 203 Agencias</h2>
    <div class="desc">Cada fila documenta cuántos POS recibe una agencia, su tier, ventana de instalación y el criterio que produjo el número. Las cifras de rentabilidad están enmascaradas en la vista pública.</div>
  </div>

  <div class="filterbar">
    <input class="search" id="mxSearch" placeholder="Buscar agencia o estado…" oninput="mxSet('q',this.value)">
    <span style="color:var(--muted);font-size:10px;margin-left:4px">TIER:</span>
    ${['TODOS','ALFA','BRAVO','CHARLIE','DELTA'].map(t=>`<button class="fbtn ${matrizFilter.tier===t?'active':''}" onclick="mxSet('tier','${t}')">${t}</button>`).join('')}
  </div>
  <div class="filterbar">
    <span style="color:var(--muted);font-size:10px">HUB:</span>
    ${['TODOS','Capital Centro','Occidente','Centro Occidente','Oriente'].map(h=>`<button class="fbtn ${matrizFilter.hub===h?'active':''}" onclick="mxSet('hub','${h}')">${h}</button>`).join('')}
    <span id="mxCount" style="margin-left:auto;color:var(--ink2);font-size:11px"></span>
  </div>

  <div class="card" style="padding:0">
    <div class="tbl-scroll">
      <table class="tbl">
        <thead><tr><th>Agencia</th><th style="text-align:left">Estado</th><th style="text-align:left">Hub</th><th>POS</th><th style="text-align:left">Tier</th><th style="text-align:left">Ventana</th><th style="text-align:left">Criterio</th></tr></thead>
        <tbody id="mxBody"></tbody>
      </table>
    </div>
  </div>`;

function mxSet(k,v){ matrizFilter[k]=v; if(k!=='q'){render('matriz');} mxRender(); }
window.mxSet = mxSet;
function mxRender(){
  let rows = DATA.matriz.filter(r=>{
    if(matrizFilter.tier!=='TODOS' && r.tier!==matrizFilter.tier) return false;
    if(matrizFilter.hub!=='TODOS' && r.region!==matrizFilter.hub) return false;
    if(matrizFilter.q){const q=matrizFilter.q.toLowerCase();if(!r.nombre.toLowerCase().includes(q)&&!r.estado.toLowerCase().includes(q))return false;}
    return true;
  });
  const body=document.getElementById('mxBody'); if(!body)return;
  body.innerHTML = rows.map(r=>`
    <tr>
      <td style="font-weight:600">${r.nombre}</td>
      <td style="text-align:left;color:var(--ink2)">${r.estado}</td>
      <td style="text-align:left"><span style="font-size:9px;color:${HC[r.region]}">${r.region}</span></td>
      <td style="font-weight:800;color:${TC[r.tier]}">${r.pos}</td>
      <td style="text-align:left"><span class="bdg bdg-${r.tier.toLowerCase()}">${r.tier}</span></td>
      <td style="text-align:left;font-size:10px;color:var(--ink2)">${r.ventana}</td>
      <td style="text-align:left;font-size:10px;color:var(--muted)">${r.criterio}</td>
    </tr>`).join('');
  const cnt=document.getElementById('mxCount');
  if(cnt) cnt.innerHTML = `<b>${rows.length}</b> agencias · <b>${rows.reduce((s,r)=>s+r.pos,0)}</b> POS`;
}
AFTER.matriz = () => { const s=document.getElementById('mxSearch'); if(s)s.value=matrizFilter.q; mxRender(); };

// ═══════════════════════════════════════════════════════════════
// PANE 06 · CRONOGRAMA & PROTOCOLOS
// ═══════════════════════════════════════════════════════════════
PANES.cronograma = () => `
  <div class="pane-head">
    <div class="eyebrow">Línea de Tiempo Operativa</div>
    <h2>Cronograma & Protocolos de Escalación</h2>
    <div class="desc">Seis fases con nombre clave, dos checkpoints de control y tres niveles de protocolo (Verde / Ámbar / Rojo). La nomenclatura permite que el equipo sepa en qué fase está y qué protocolo rige con una sola palabra.</div>
  </div>

  <div class="stepper mb24">
    <div class="step"><div class="s-phase">FASE 0</div><div class="s-code" style="color:var(--alfa)">GÉNESIS</div><div class="s-when">Días −7 a 0</div><div class="s-desc">Preposicionar POS en 4 hubs · 12 equipos listos · data validada</div></div>
    <div class="step"><div class="s-phase">FASE 1</div><div class="s-code" style="color:var(--bravo)">CARTOGRAFÍA</div><div class="s-when">Días 1–3</div><div class="s-desc">Validar cuotas por hub · aprobación CEO en 24h</div></div>
    <div class="step"><div class="s-phase">FASE 2</div><div class="s-code" style="color:var(--bravo)">PRECISIÓN</div><div class="s-when">Días 3–5</div><div class="s-desc">Alícuota por agencia · matriz final · CSV operativo</div></div>
    <div class="step"><div class="s-phase">FASE 3</div><div class="s-code" style="color:var(--charlie)">RUTA</div><div class="s-when">Días 5–7</div><div class="s-desc">Optimización de rutas (VRPTW) · clustering · Gantt diario</div></div>
    <div class="step"><div class="s-phase">FASE 4</div><div class="s-code" style="color:var(--alfa)">DESPLIEGUE</div><div class="s-when">Días 8–30/60</div><div class="s-desc">Go-live · instalación express · 67 POS/día</div></div>
    <div class="step"><div class="s-phase">FASE 5</div><div class="s-code" style="color:var(--charlie)">VIGÍA</div><div class="s-when">Día 1 →</div><div class="s-desc">Monitoreo · reasignación de DELTA no transaccionales</div></div>
  </div>

  <div class="grid3 mb18">
    <div class="callout ok" style="margin:0">
      <div class="c-title">● CÓDIGO VERDE · Operación normal</div>
      <div class="c-body">Días 1–15. Filtros plenos: solo agencias rentables, P15 activo, techo 15%, mínimo 2 POS. Velocidad objetivo 33–67 POS/día. Es el estado por defecto.</div>
    </div>
    <div class="callout warn" style="margin:0">
      <div class="c-title">● CÓDIGO ÁMBAR · Protocolo Crisis</div>
      <div class="c-body">Se activa en el <b>Checkpoint Día 15 si &lt;1.000 POS</b>. Relaja P15→P25, duplica equipos (3→6 por hub), techo 15%→20%, activa lista de espera (37 agencias).</div>
    </div>
    <div class="callout danger" style="margin:0">
      <div class="c-title">● CÓDIGO ROJO · Protocolo Emergencia</div>
      <div class="c-body">Se activa en el <b>Checkpoint Día 30 si &lt;1.800 POS</b>. Cero exclusión por rentabilidad, redistribución total de equipos al hub más rezagado, outsourcing certificado.</div>
    </div>
  </div>

  <div class="card">
    <div class="card-h"><span class="tick"></span> Checkpoints de control — gatillos automáticos</div>
    <div class="chart" style="height:260px"><canvas id="crBurn"></canvas></div>
    <div class="legend">
      <div class="li"><span class="sw" style="background:var(--alfa)"></span> Trayectoria objetivo (67/día)</div>
      <div class="li"><span class="sw" style="background:var(--warn)"></span> Umbral Día 15 = 1.000 POS</div>
      <div class="li"><span class="sw" style="background:var(--danger)"></span> Umbral Día 30 = 1.800 POS</div>
    </div>
  </div>`;

AFTER.cronograma = () => {
  const dias=Array.from({length:31},(_,i)=>i);
  const target=dias.map(d=>Math.min(2000,Math.round(d*67)));
  charts.crBurn = new Chart(document.getElementById('crBurn'),{
    type:'line',
    data:{labels:dias.map(d=>'D'+d),datasets:[
      {label:'Objetivo',data:target,borderColor:'#00E5A0',backgroundColor:'rgba(0,229,160,.08)',fill:true,tension:.3,pointRadius:0,borderWidth:2},
      {label:'Umbral D15',data:dias.map(d=>d===15?1000:null),borderColor:'#FFB454',pointBackgroundColor:'#FFB454',pointRadius:dias.map(d=>d===15?6:0),showLine:false},
      {label:'Umbral D30',data:dias.map(d=>d===30?1800:null),borderColor:'#FF5470',pointBackgroundColor:'#FF5470',pointRadius:dias.map(d=>d===30?6:0),showLine:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{grid:{color:'rgba(30,44,69,.4)'},ticks:{color:'#5E6E8C',font:{size:8},maxTicksLimit:11}},
        y:{grid:{color:'rgba(30,44,69,.6)'},ticks:{color:'#5E6E8C',font:{size:9}},title:{display:true,text:'POS acumulados',color:'#5E6E8C',font:{size:9}}}}}
  });
};

// ═══════════════════════════════════════════════════════════════
// PANE 07 · ADVERTENCIAS & NOTAS
// ═══════════════════════════════════════════════════════════════
PANES.advertencias = () => `
  <div class="pane-head">
    <div class="eyebrow">Transparencia Metodológica</div>
    <h2>Advertencias, Sesgos y Notas para el BDT</h2>
    <div class="desc">Honestidad analítica: estas son las limitaciones conocidas del modelo y las decisiones que requieren criterio humano. Documentarlas protege la credibilidad del proyecto ante el banco.</div>
  </div>

  <div class="callout danger">
    <div class="c-title">⚠ Sesgo de urgencia — explicado para el BDT</div>
    <div class="c-body">La fórmula de Capa 1 envía <b>más POS donde el BDT ha instalado menos</b> (factor 1.5× bajo 20% de cumplimiento). Gran Caracas (11% cumplimiento) recibe 734 POS; Sucre (58%) recibe 7. <b>Esto es intencional y alineado con las metas del banco</b>: atacamos su mayor brecha de cobertura, no solo nuestra rentabilidad. El mensaje al BDT: <i>"trabajamos para cerrar la brecha de SU plan de negocios, no solo para colocar terminales."</i> Punto de decisión sobre la marcha: si un estado de bajo cumplimiento resulta tener baja demanda estructural (no oportunidad), su cuota se rebalancea en el checkpoint semanal.</div>
  </div>

  <div class="grid2 mb18">
    <div class="callout warn" style="margin:0">
      <div class="c-title">⚠ 16 agencias sin dato de rentabilidad</div>
      <div class="c-body">El universo oficial es de <b>278 agencias</b>; tenemos rentabilidad de 262. Las 16 restantes quedan como <b>pendientes de levantamiento</b> — no entran al reparto hasta tener su dato. No se asume cero ni se inventan valores.</div>
    </div>
    <div class="callout warn" style="margin:0">
      <div class="c-title">⚠ Una sola variable de decisión</div>
      <div class="c-body">El diseño ideal pondera rentabilidad + transaccionalidad + accesibilidad. Solo existe <b>rentabilidad</b>. Volamos con un instrumento de tres. Recomendación: levantar transaccionalidad por agencia antes de Fase 2 para refinar el modelo.</div>
    </div>
    <div class="callout info" style="margin:0">
      <div class="c-title">◆ Concentración en estados pequeños</div>
      <div class="c-body">En Trujillo (4 agencias) o Sucre (3), el líder concentra 40–55%. Es <b>estructural, no un defecto</b>: con tan pocas agencias el techo del 15% no puede activarse matemáticamente. Aceptado como inherente.</div>
    </div>
    <div class="callout info" style="margin:0">
      <div class="c-title">◆ Ventana temporal a reconciliar</div>
      <div class="c-body">El modelo opera a <b>30–60 días</b>. Si el horizonte real es mayor (ciclo julio 2025–septiembre 2026), las velocidades y el número de equipos se recalculan — la estructura del modelo no cambia.</div>
    </div>
  </div>

  <div class="card mb18">
    <div class="card-h"><span class="tick"></span> Decisiones tomadas — registro de auditoría</div>
    <table class="tbl">
      <thead><tr><th style="text-align:left">Decisión</th><th style="text-align:left">Resolución</th><th style="text-align:left">Justificación</th></tr></thead>
      <tbody>
        <tr><td style="text-align:left;font-weight:600">Método de ponderación</td><td style="text-align:left">Potencial Acotado (√rentabilidad + techo 15%)</td><td style="text-align:left;color:var(--ink2);font-size:10px">Evita concentración inejecutable; premia potencial con rendimientos decrecientes</td></tr>
        <tr><td style="text-align:left;font-weight:600">Universo de agencias</td><td style="text-align:left">278 oficiales · 203 activas en Fase 1</td><td style="text-align:left;color:var(--ink2);font-size:10px">Cobertura nacional sin diluir en agencias no rentables</td></tr>
        <tr><td style="text-align:left;font-weight:600">Agencias no rentables</td><td style="text-align:left">Excluidas de Fase 1 (17 negativas)</td><td style="text-align:left;color:var(--ink2);font-size:10px">No se instala donde se pierde dinero en la fase de velocidad</td></tr>
        <tr><td style="text-align:left;font-weight:600">Tamaño del universo</td><td style="text-align:left">Tiers por capacidad, no Pareto puro</td><td style="text-align:left;color:var(--ink2);font-size:10px">La velocidad no mejora concentrando (0,6 días de diferencia); sí importa la cobertura BDT</td></tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-h"><span class="tick"></span> Agencias excluidas — rentabilidad negativa (17)</div>
    <div class="callout warn" style="margin:0 0 14px">
      <div class="c-body" style="font-size:11px">El detalle numérico de rentabilidad está enmascarado en la versión pública. Aquí se listan solo los nombres y el estatus.</div>
    </div>
    <div class="tbl-scroll" style="max-height:280px">
      <table class="tbl"><thead><tr><th style="text-align:left">Agencia</th><th style="text-align:left">Estado</th><th style="text-align:left">Estatus</th></tr></thead>
      <tbody id="exclBody"></tbody></table>
    </div>
  </div>`;

AFTER.advertencias = () => {
  document.getElementById('exclBody').innerHTML = DATA.excluidas
    .sort((a,b)=>a.rent-b.rent)
    .map(e=>`<tr><td style="text-align:left;font-weight:600">${e.nombre}</td><td style="text-align:left;color:var(--ink2)">${e.estado}</td><td style="text-align:left"><span class="bdg bdg-danger">Fuera Fase 1 · rent. negativa</span></td></tr>`).join('');
};

// ─── INIT ───
render('resumen');
