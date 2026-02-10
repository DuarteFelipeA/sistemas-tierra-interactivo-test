// ====== Utils ======
const qs  = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];
const norm = (str) => (str||'').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const lockKey = (sysId, idPath) => `act_lock::${sysId}::${idPath}`;

// ====== Datos base de los sistemas ======
const SYSTEMS = [
  {id:'atmosfera',nombre:'Atmósfera',color:'#4FC3F7',imagen:'assets/atmosfera.jpg',pdf:'assets/atmosfera.pdf',chips:['Troposfera','Estratosfera','Mesosfera','Termosfera','Exosfera'],subsistemas:[{titulo:'Troposfera',texto:'Capa más baja, donde ocurre el clima y se concentra el vapor de agua.'},{titulo:'Estratosfera',texto:'Contiene la capa de ozono, filtra radiación UV.'},{titulo:'Mesosfera',texto:'Quema la mayoría de meteoros; temperaturas muy bajas.'},{titulo:'Termosfera',texto:'Alta energía solar; auroras y órbitas de satélites bajos.'},{titulo:'Exosfera',texto:'Transición al espacio; gases muy dispersos.'}]},
  {id:'hidrosfera',nombre:'Hidrosfera',color:'#29B6F6',imagen:'assets/hidrosfera.jpg',pdf:'assets/hidrosfera.pdf',chips:['Océanos','Aguas continentales','Aguas subterráneas','Criosfera','Vapor de agua'],subsistemas:[{titulo:'Océanos',texto:'Regulan clima y almacenan calor; grandes reservorios de carbono.'},{titulo:'Aguas continentales',texto:'Ríos, lagos y humedales: ciclo del agua y hábitats cruciales.'},{titulo:'Aguas subterráneas',texto:'Acuíferos que abastecen consumo y riego; vulnerables a contaminación.'},{titulo:'Criosfera',texto:'Hielo y glaciares; reflejan radiación (albedo) y regulan nivel del mar.'},{titulo:'Vapor de agua',texto:'Gas de efecto invernadero clave; motor del clima y precipitación.'}]},
  {id:'geosfera',nombre:'Geosfera',color:'#FFCA28',imagen:'assets/geosfera.jpg',pdf:'assets/geosfera.pdf',chips:['Corteza','Manto','Núcleo','Tectónica de placas','Relieve'],subsistemas:[{titulo:'Corteza',texto:'Capa sólida superficial; continental y oceánica.'},{titulo:'Manto',texto:'Rocoso y convectivo; impulsa el movimiento de placas.'},{titulo:'Núcleo',texto:'Externo líquido e interno sólido; genera campo magnético.'},{titulo:'Tectónica de placas',texto:'Sismicidad, vulcanismo y formación de montañas.'},{titulo:'Relieve',texto:'Modelado por procesos internos y externos (erosión, sedimentación).'}]},
  {id:'biosfera',nombre:'Biosfera',color:'#66BB6A',imagen:'assets/biosfera.jpg',pdf:'assets/biosfera.pdf',chips:['Ecosistemas','Biomas','Biodiversidad','Ciclos biogeoquímicos'],subsistemas:[{titulo:'Ecosistemas',texto:'Interacciones entre seres vivos y ambiente físico.'},{titulo:'Biomas',texto:'Grandes regiones con clima y comunidades típicas (bosque, desierto, tundra).'},{titulo:'Biodiversidad',texto:'Variedad genética, de especies y ecosistemas; base de resiliencia.'},{titulo:'Ciclos biogeoquímicos',texto:'Ciclos del carbono, nitrógeno, fósforo; conectan todos los sistemas.'}]}
];

// ====== Modal ======
const modalEl = qs('#systemModal');
const modalBody = qs('#modalBody');
const modalCloseBtn = qs('.modal-close');
qs('.modal-content').addEventListener('click', (e) => e.stopPropagation());

// ====== Carga de actividades desde JSON ======
const activitiesCache = new Map();
async function loadActivities(systemId){
  if(activitiesCache.has(systemId)) return activitiesCache.get(systemId);
  const url = `assets/actividades/${systemId}.json`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error(res.statusText || 'Error de red');
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('El JSON debe ser un array');
    activitiesCache.set(systemId, data);
    return data;
  } catch(err){
    console.error('Error cargando actividades', systemId, err);
    return [];
  }
}

function disableAllInteractive(ui){
  qsa('input,button,select,textarea', ui).forEach(el=>{
    if(el.getAttribute('data-keep')==='1') return;
    el.disabled = true; el.classList.add('disabled');
  });
}

function lockAndDisable(sysId, idPath, ui, feedback){
  localStorage.setItem(lockKey(sysId, idPath), '1');
  if(feedback){
    feedback.textContent += ' · (Intento registrado)';
  }
  disableAllInteractive(ui);
  qsa('[data-reset]', ui).forEach(b=> b.style.display='none');
}

// ====== Render de actividad (intento único) ======
function renderActivityCard(act, idx, sysId, idPrefix='act'){
  const idPath = `${idPrefix}:${idx}`;
  const locked = localStorage.getItem(lockKey(sysId, idPath))==='1';

  const wrap = document.createElement('div');
  wrap.className = 'activity';
  wrap.innerHTML = `<h5>${act.titulo || 'Actividad'}</h5>${act.descripcion?`<p>${act.descripcion}</p>`:''}<div class="activity-ui"></div>`;
  const ui = qs('.activity-ui', wrap);

  const finalize = (ok, feedbackEl)=>{
    feedbackEl.textContent = ok ? '✔ ¡Correcto!' : '✘ No es correcto';
    feedbackEl.className = 'feedback ' + (ok?'ok':'err');
    lockAndDisable(sysId, idPath, ui, feedbackEl);
  };

  // multiple
  if (act.type === 'multiple') {
    const group = `g_${Math.random().toString(36).slice(2)}`;
    const html = [`<div class="quiz"><p><strong>${act.pregunta||'Pregunta'}</strong></p>`];
    (act.opciones||[]).forEach((op,i)=>{
      const o = (typeof op === 'string') ? {texto: op, correcta:false} : op;
      html.push(`<label class="option"><input type="radio" name="${group}" value="${i}"><span>${o.texto}</span></label>`);
    });
    html.push(`<div class="form-actions"><button class="primary" data-check>Comprobar</button></div><div class="feedback" aria-live="polite"></div></div>`);
    ui.innerHTML = html.join('');
    const feedback = qs('.feedback', ui);
    qs('[data-check]', ui).addEventListener('click', ()=>{
      const sel = ui.querySelector(`input[name="${group}"]:checked`);
      if(!sel){ feedback.textContent = 'Selecciona una opción'; feedback.className='feedback'; return; }
      const i = Number(sel.value);
      const opt = act.opciones[i] || {};
      const correct = (typeof opt === 'object' && opt.correcta === true);
      finalize(correct, feedback);
    });
  }
  // truefalse
  else if (act.type === 'truefalse') {
    ui.innerHTML = `<p><strong>${act.afirmacion||'Afirmación'}</strong></p><div class="truefalse"><button data-v="true">Verdadero</button><button data-v="false">Falso</button></div><div class="form-actions"><button class="primary" data-check>Comprobar</button></div><div class="feedback" aria-live="polite"></div>`;
    let sel = null;
    qsa('.truefalse button', ui).forEach(b=>{
      b.addEventListener('click', ()=>{
        qsa('.truefalse button', ui).forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); sel = b.getAttribute('data-v')==='true';
      });
    });
    const fb = qs('.feedback', ui);
    qs('[data-check]', ui).addEventListener('click', ()=>{
      if(sel===null){ fb.textContent='Selecciona Verdadero o Falso'; fb.className='feedback'; return; }
      const correct = (act.correcta === true) === (sel === true);
      finalize(correct, fb);
    });
  }
  // order
  else if (act.type === 'order') {
    const correctOrder = (act.pasos||[]).slice();
    const shuffled = (act.pasos||[]).slice().sort(()=>Math.random()-0.5);
    const ul = document.createElement('ul'); ul.className='order-list';
    shuffled.forEach((txt)=>{
      const li = document.createElement('li');
      li.setAttribute('draggable','true');
      li.innerHTML = `<button class="order-handle" title="Arrastrar">☰</button> <span>${txt}</span>`;
      ul.appendChild(li);
    });
    ui.appendChild(ul);
    let dragEl=null;
    ul.addEventListener('dragstart', e=>{ const li=e.target.closest('li'); if(!li) return; dragEl=li; e.dataTransfer.effectAllowed='move';});
    ul.addEventListener('dragover', e=>{ e.preventDefault(); const li=e.target.closest('li'); if(!li||li===dragEl) return; const rect = li.getBoundingClientRect(); const after = (e.clientY - rect.top) > rect.height/2; ul.insertBefore(dragEl, after? li.nextSibling : li); });
    ul.addEventListener('drop', e=>{ e.preventDefault(); dragEl=null; });
    const controls = document.createElement('div'); controls.className='order-controls';
    controls.innerHTML = `<button class="primary" data-check>Comprobar</button><div class="feedback" aria-live="polite"></div>`;
    ui.appendChild(controls);
    const fb = qs('.feedback', controls);
    qs('[data-check]', controls).addEventListener('click', ()=>{
      const current = [...ul.querySelectorAll('li span')].map(s=>s.textContent);
      const ok = current.length===correctOrder.length && current.every((t,i)=>t===correctOrder[i]);
      finalize(ok, fb);
    });
  }
  // match
  else if (act.type === 'match') {
    const left = (act.pares||[]).map(p=>p.a);
    const right = (act.pares||[]).map(p=>p.b);
    const shuffled = right.slice().sort(()=>Math.random()-0.5);
    ui.innerHTML = `<div class="match"><div class="left"></div><div class="right"></div></div><div class="form-actions"><button class="primary" data-check>Comprobar</button></div><div class="feedback" aria-live="polite"></div>`;
    const leftCol = qs('.match .left', ui);
    const rightCol = qs('.match .right', ui);
    left.forEach((a,i)=>{
      const row = document.createElement('div'); row.className='row';
      const sel = document.createElement('select');
      sel.innerHTML = `<option value="">— Elegir —</option>` + shuffled.map((b,j)=>`<option value="${j}">${b}</option>`).join('');
      row.innerHTML = `<strong>${a}</strong>`; row.appendChild(sel); leftCol.appendChild(row);
    });
    shuffled.forEach((b)=>{ const r=document.createElement('div'); r.className='row'; r.textContent=b; rightCol.appendChild(r); });
    const fb = qs('.feedback', ui);
    qs('[data-check]', ui).addEventListener('click', ()=>{
      let ok=true; leftCol.querySelectorAll('select').forEach((sel,i)=>{
        const idx = Number(sel.value); if(Number.isNaN(idx)) { ok=false; return; }
        const chosen = shuffled[idx]; if(norm(chosen)!==norm(right[i])) ok=false;
      });
      finalize(ok, fb);
    });
  }
  // cloze
  else if (act.type === 'cloze') {
    const raw = act.texto||'';
    let idxBlank = 0; const answers = [];
    const html = raw.replace(/\{\{([^}]+)\}\}/g, (m,grp)=>{
      const opts = grp.split('|').map(s=>s.trim()); answers.push(opts);
      const i = idxBlank++; return `<input type=\"text\" data-i=\"${i}\" placeholder=\"Respuesta\" />`;
    });
    ui.innerHTML = `<div class="cloze"><p>${html}</p></div><div class="form-actions"><button class="primary" data-check>Comprobar</button></div><div class="feedback" aria-live="polite"></div>`;
    const fb = qs('.feedback', ui);
    qs('[data-check]', ui).addEventListener('click', ()=>{
      const inputs = qsa('input[type=text]', ui); let ok=true; inputs.forEach(inp=>{
        const i = Number(inp.getAttribute('data-i')); const val = norm(inp.value);
        const okAny = (answers[i]||[]).some(ans=> norm(ans)===val);
        if(!okAny) ok=false;
      });
      finalize(ok, fb);
    });
  }
  // hotspots
  else if (act.type === 'hotspots') {
    const img = act.imagen; const zones = (act.zones||[]); const labels = (act.labels||[]);
    const cont = document.createElement('div'); cont.className='hotspots'; cont.style.width = '100%';
    const imgEl = document.createElement('img'); imgEl.src = img; cont.appendChild(imgEl);
    ui.appendChild(cont);
    zones.forEach(z=>{
      const d = document.createElement('div'); d.className='zone'; d.style.left=z.x+'%'; d.style.top=z.y+'%'; d.style.width=z.w+'%'; d.style.height=z.h+'%'; d.dataset.id=z.id; cont.appendChild(d);
    });
    labels.forEach((lab, i)=>{
      const tag = document.createElement('div'); tag.className='label'; tag.textContent=lab; tag.setAttribute('draggable','true');
      tag.style.left = (4 + i*12) + '%'; tag.style.top = '85%'; cont.appendChild(tag);
    });
    let drag=null; cont.addEventListener('dragstart', e=>{ const el=e.target.closest('.label'); if(!el) return; drag=el; e.dataTransfer.effectAllowed='move'; });
    cont.addEventListener('dragover', e=>{ e.preventDefault(); });
    cont.addEventListener('drop', e=>{ e.preventDefault(); if(!drag) return; const rect = cont.getBoundingClientRect(); const x = ((e.clientX-rect.left)/rect.width)*100; const y = ((e.clientY-rect.top)/rect.height)*100; drag.style.left = x+'%'; drag.style.top=y+'%'; drag.classList.add('assigned'); drag=null; });
    ui.innerHTML += `<div class="hotspots-controls"><button class="primary" data-check>Comprobar</button></div><div class="feedback" aria-live="polite"></div>`;
    const fb = qs('.feedback', ui);
    const check = ()=>{
      const ok = zones.every(z=>{
        const zr = {x:z.x,y:z.y,w:z.w,h:z.h};
        const labelsEls = qsa('.label', cont);
        for(const el of labelsEls){
          const left = parseFloat(el.style.left||'0');
          const top = parseFloat(el.style.top||'0');
          const inside = (left>=zr.x && left<=zr.x+zr.w && top>=zr.y && top<=zr.y+zr.h);
          if(inside && norm(el.textContent)===norm(z.label)) return true;
        }
        return false;
      });
      finalize(ok, fb);
    };
    qs('[data-check]', ui).addEventListener('click', check);
  }
  // bank
  else if (act.type === 'bank') {
    const n = Math.min(act.n||3, (act.items||[]).length);
    const shuffled = (act.items||[]).slice().sort(()=>Math.random()-0.5).slice(0,n);
    ui.innerHTML = `<div class="bank"></div><div class="form-actions"><button class="primary" data-check>Comprobar todo</button></div><div class="feedback" aria-live="polite"></div>`;
    const host = qs('.bank', ui);
    const fb = qs('.feedback', ui);
    const idPath = `${idPrefix}:${idx}`;

    shuffled.forEach((sub,i)=>{
      const subCard = renderActivityCard(sub, i, sysId, `${idPath}`);
      host.appendChild(subCard);
    });

    qs('[data-check]', ui).addEventListener('click', ()=>{
      let total=0, correct=0; const cards = qsa('.bank > .activity', ui);
      cards.forEach(card=>{
        total++;
        const ui2 = qs('.activity-ui', card);
        const fbs = ui2.querySelector('.feedback');
        if(!fbs){ const btn = ui2.querySelector('[data-check]'); btn && btn.click(); }
      });
      qsa('.bank > .activity .feedback', ui).forEach(f=>{ if(f.classList.contains('ok')) correct++; });
      fb.textContent = `Resultado: ${correct}/${total} correctas · (Intento registrado)`; fb.className = 'feedback ' + (correct===total?'ok':'err');
      lockAndDisable(sysId, idPath, ui, fb);
    });
  }

  if(locked){
    disableAllInteractive(ui);
    const info = document.createElement('div'); info.className='feedback'; info.textContent='Intento ya realizado'; ui.appendChild(info);
  }

  return wrap;
}

async function renderActivitiesFor(systemId){
  const cont = qs('#activityList', modalBody);
  cont.innerHTML = '<p>Cargando actividades…</p>';
  const acts = await loadActivities(systemId);
  if(acts.length===0){ cont.innerHTML = '<p>No hay actividades cargadas para este sistema.</p>'; return; }
  cont.innerHTML = '';
  acts.forEach((a,i)=> cont.appendChild(renderActivityCard(a,i,systemId)) );
}

function openModalFor(systemId){
  const sys = SYSTEMS.find(s => s.id === systemId);
  if(!sys) return;
  modalEl.setAttribute('aria-hidden', 'false');

  modalBody.innerHTML = `
    <header class=\"modal-header\">\n      <img src=\"${sys.imagen}\" alt=\"${sys.nombre}\" />\n      <div>\n        <h3 id=\"modalTitle\" class=\"modal-title\" style=\"color:${sys.color}\">${sys.nombre}</h3>\n        <div class=\"chips\">${sys.chips.map(c => `<span class=\\\"chip\\\">${c}</span>`).join('')}</div>\n      </div>\n    </header>\n    <div class=\"modal-tabs\" role=\"tablist\">\n      <button role=\"tab\" class=\"modal-tab active\" aria-selected=\"true\" data-panel=\"info\">Información</button>\n      <button role=\"tab\" class=\"modal-tab\" aria-selected=\"false\" data-panel=\"actividades\">Actividades</button>\n      <a class=\"btn\" target=\"_blank\" rel=\"noopener\" href=\"${sys.pdf}\">PDF del sistema ↗</a>\n    </div>\n\n    <section id=\"panel-info\" class=\"modal-panel active\" role=\"tabpanel\" aria-label=\"Información\">\n      <div class=\"subsystems\">\n        ${sys.subsistemas.map(sbs => `<article class=\\\"card\\\"><h4>${sbs.titulo}</h4><p>${sbs.texto}</p></article>`).join('')}\n      </div>\n    </section>\n\n    <section id=\"panel-actividades\" class=\"modal-panel\" role=\"tabpanel\" aria-label=\"Actividades\">\n      <div id=\"activityList\" class=\"activity-list\" aria-live=\"polite\"></div>\n    </section>`;

  qsa('.modal-tab[role="tab"]', modalBody).forEach(btn => {
    const panel = btn.getAttribute('data-panel');
    btn.addEventListener('click', () => {
      qsa('.modal-tab[role="tab"]', modalBody).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      qsa('.modal-panel[role="tabpanel"]', modalBody).forEach(p => p.classList.remove('active'));
      qs(`#panel-${panel}`, modalBody).classList.add('active');
      btn.setAttribute('aria-selected','true');
      if(panel==='actividades'){ renderActivitiesFor(systemId); }
    });
  });

  renderActivitiesFor(systemId);
}

function closeModal(){ modalEl.setAttribute('aria-hidden','true'); qs('#modalBody').innerHTML=''; }
qs('.modal-backdrop').addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modalEl.getAttribute('aria-hidden')==='false'){ closeModal(); }});

// Hotspots (ya sea círculos o polígonos del cono)
qsa('.hotspot').forEach(h => {
  h.addEventListener('click', () => openModalFor(h.getAttribute('data-system')));
  h.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModalFor(h.getAttribute('data-system')); }});
});

// Tabs de Material docente
qsa('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    qsa('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected','true');
    const id = tab.getAttribute('data-tab');
    qsa('.tab-panel').forEach(p => p.classList.remove('active'));
    qs(`#${id}`).classList.add('active');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
