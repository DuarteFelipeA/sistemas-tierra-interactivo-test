// ====== Datos base de los sistemas ======
const SYSTEMS = [
  {id:'atmosfera',nombre:'Atmósfera',color:'#4FC3F7',imagen:'assets/atmosfera.jpg',pdf:'assets/atmosfera.pdf',chips:['Troposfera','Estratosfera','Mesosfera','Termosfera','Exosfera'],subsistemas:[{titulo:'Troposfera',texto:'Capa más baja, donde ocurre el clima y se concentra el vapor de agua.'},{titulo:'Estratosfera',texto:'Contiene la capa de ozono, filtra radiación UV.'},{titulo:'Mesosfera',texto:'Quema la mayoría de meteoros; temperaturas muy bajas.'},{titulo:'Termosfera',texto:'Alta energía solar; auroras y órbitas de satélites bajos.'},{titulo:'Exosfera',texto:'Transición al espacio; gases muy dispersos.'}]},
  {id:'hidrosfera',nombre:'Hidrosfera',color:'#29B6F6',imagen:'assets/hidrosfera.jpg',pdf:'assets/hidrosfera.pdf',chips:['Océanos','Aguas continentales','Aguas subterráneas','Criosfera','Vapor de agua'],subsistemas:[{titulo:'Océanos',texto:'Regulan clima y almacenan calor; grandes reservorios de carbono.'},{titulo:'Aguas continentales',texto:'Ríos, lagos y humedales: ciclo del agua y hábitats cruciales.'},{titulo:'Aguas subterráneas',texto:'Acuíferos que abastecen consumo y riego; vulnerables a contaminación.'},{titulo:'Criosfera',texto:'Hielo y glaciares; reflejan radiación (albedo) y regulan nivel del mar.'},{titulo:'Vapor de agua',texto:'Gas de efecto invernadero clave; motor del clima y precipitación.'}]},
  {id:'geosfera',nombre:'Geosfera',color:'#FFCA28',imagen:'assets/geosfera.jpg',pdf:'assets/geosfera.pdf',chips:['Corteza','Manto','Núcleo','Tectónica de placas','Relieve'],subsistemas:[{titulo:'Corteza',texto:'Capa sólida superficial; continental y oceánica.'},{titulo:'Manto',texto:'Rocoso y convectivo; impulsa el movimiento de placas.'},{titulo:'Núcleo',texto:'Externo líquido e interno sólido; genera campo magnético.'},{titulo:'Tectónica de placas',texto:'Sismicidad, vulcanismo y formación de montañas.'},{titulo:'Relieve',texto:'Modelado por procesos internos y externos (erosión, sedimentación).'}]},
  {id:'biosfera',nombre:'Biosfera',color:'#66BB6A',imagen:'assets/biosfera.jpg',pdf:'assets/biosfera.pdf',chips:['Ecosistemas','Biomas','Biodiversidad','Ciclos biogeoquímicos'],subsistemas:[{titulo:'Ecosistemas',texto:'Interacciones entre seres vivos y ambiente físico.'},{titulo:'Biomas',texto:'Grandes regiones con clima y comunidades típicas (bosque, desierto, tundra).'},
    {titulo:'Biodiversidad',texto:'Variedad genética, de especies y ecosistemas; base de resiliencia.'},{titulo:'Ciclos biogeoquímicos',texto:'Ciclos del carbono, nitrógeno, fósforo; conectan todos los sistemas.'}]}
];

// ====== Utilidades de almacenamiento (localStorage) ======
const loadActivities = (systemId) => { try { const raw = localStorage.getItem(`activities_${systemId}`); return raw ? JSON.parse(raw) : []; } catch { return []; } };
const saveActivities = (systemId, list) => { localStorage.setItem(`activities_${systemId}`, JSON.stringify(list)); };

// ====== Helpers DOM ======
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const modalEl = qs('#systemModal');
const modalBody = qs('#modalBody');
const modalCloseBtn = qs('.modal-close');

// Prevenir que clics dentro del modal cierren por backdrop
qs('.modal-content').addEventListener('click', (e) => e.stopPropagation());

function openModalFor(systemId){
  const sys = SYSTEMS.find(s => s.id === systemId);
  if(!sys) return;
  modalEl.setAttribute('aria-hidden','false');
  modalBody.innerHTML = `
    <header class="modal-header">
      <img src="${sys.imagen}" alt="${sys.nombre}" />
      <div>
        <h3 id="modalTitle" class="modal-title" style="color:${sys.color}">${sys.nombre}</h3>
        <div class="chips">${sys.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>
      </div>
    </header>
    <div class="modal-tabs" role="tablist">
      <button role="tab" class="modal-tab active" aria-selected="true" data-panel="info">Información</button>
      <button role="tab" class="modal-tab" aria-selected="false" data-panel="actividades">Actividades</button>
      <a class="btn" target="_blank" rel="noopener" href="${sys.pdf}">PDF del sistema ↗</a>
    </div>
    <section id="panel-info" class="modal-panel active" role="tabpanel" aria-label="Información">
      <div class="subsystems">
        ${sys.subsistemas.map(sbs => `<article class="card"><h4>${sbs.titulo}</h4><p>${sbs.texto}</p></article>`).join('')}
      </div>
    </section>
    <section id="panel-actividades" class="modal-panel" role="tabpanel" aria-label="Actividades">
      <form id="activityForm" autocomplete="off">
        <div class="form-grid">
          <label>Título<input required name="titulo" placeholder="Ej: Observación de nubes en el barrio" /></label>
          <label>Enlace (opcional)<input name="enlace" type="url" placeholder="https://..." /></label>
          <label style="grid-column:1/-1">Descripción<textarea name="descripcion" rows="3" placeholder="Breve consigna, materiales, tiempo, criterios..."></textarea></label>
        </div>
        <div class="form-actions">
          <button type="reset" class="secondary">Limpiar</button>
          <button type="submit" class="primary">Agregar actividad</button>
        </div>
      </form>
      <div id="activityList" class="activity-list" aria-live="polite"></div>
    </section>`;

  qsa('.modal-tab', modalBody).forEach(btn => {
    const panel = btn.getAttribute('data-panel');
    if(!panel) return;
    btn.addEventListener('click', () => {
      qsa('.modal-tab', modalBody).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      qsa('.modal-panel', modalBody).forEach(p => p.classList.remove('active'));
      qs(`#panel-${panel}`, modalBody).classList.add('active');
      btn.setAttribute('aria-selected','true');
    });
  });

  const renderActivities = () => {
    const listEl = qs('#activityList', modalBody);
    const items = loadActivities(sys.id);
    if(items.length === 0){ listEl.innerHTML = `<p>No hay actividades aún. ¡Agrega la primera!</p>`; return; }
    listEl.innerHTML = items.map((it, idx) => `
      <div class="activity">
        <h5>${it.titulo}</h5>
        ${it.descripcion ? `<p>${it.descripcion}</p>` : ''}
        ${it.enlace ? `<p>Recurso: <a target="_blank" rel="noopener" href="${it.enlace}">${it.enlace}</a></p>` : ''}
        <button class="secondary" data-del="${idx}">Eliminar</button>
      </div>`).join('');
    qsa('button[data-del]', listEl).forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-del'));
        const arr = loadActivities(sys.id);
        arr.splice(idx,1);
        saveActivities(sys.id, arr);
        renderActivities();
      });
    });
  };
  renderActivities();

  const form = qs('#activityForm', modalBody);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nuevo = {
      titulo: (fd.get('titulo')||'').toString().trim(),
      enlace: (fd.get('enlace')||'').toString().trim(),
      descripcion: (fd.get('descripcion')||'').toString().trim(),
      fecha: new Date().toISOString()
    };
    if(!nuevo.titulo) return;
    const arr = loadActivities(sys.id);
    arr.unshift(nuevo);
    saveActivities(sys.id, arr);
    form.reset();
    renderActivities();
  });
}

function closeModal(){ modalEl.setAttribute('aria-hidden','true'); qs('#modalBody').innerHTML = ''; }
qs('.modal-backdrop').addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && modalEl.getAttribute('aria-hidden') === 'false'){ closeModal(); }});

qsa('.hotspot').forEach(h => {
  h.addEventListener('click', () => openModalFor(h.getAttribute('data-system')));
  h.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModalFor(h.getAttribute('data-system')); }});
});

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
